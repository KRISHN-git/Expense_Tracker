
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Plan = require('../models/Plan');
const MonthlyBudget = require('../models/MonthlyBudget');
const { protect } = require('../middleware/authMiddleware');

// ... existing imports ...

// @desc    Get budget analytics (Last 6 Months)
// @route   GET /expenses/budget-analytics
// @access  Private
router.get('/budget-analytics', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of the 6th month back (e.g., if now is Oct 2024, start from May 1)
        sixMonthsAgo.setHours(0, 0, 0, 0);

        // 1. Aggregate Expenses by Month/Year
        const expenses = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    totalSpent: { $sum: "$amount" }
                }
            }
        ]);

        // 2. Fetch Monthly Budgets
        // Also get the user's *current* budget as a fallback (if no history exists for a month)
        // Or strict history? Let's use history if available, else user.monthlyBudget (or 0)
        // Actually, user.monthlyBudget applies to *future* or *current* until changed. 
        // For history, if no record exists, it means we didn't track it. Maybe assume current budget?
        // Let's assume current budget for now if history is missing.
        const budgetHistory = await MonthlyBudget.find({
            user: userId,
            $or: [
                { year: { $gt: sixMonthsAgo.getFullYear() } },
                {
                    year: sixMonthsAgo.getFullYear(),
                    month: { $gte: sixMonthsAgo.getMonth() + 1 }
                }
            ]
        });

        // 3. Construct 6-Month Data Array
        const result = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Loop from 5 months ago to current month
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(now.getMonth() - i);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();

            // Find expense for this month
            const expenseRecord = expenses.find(e => e._id.month === m && e._id.year === y);
            const spent = expenseRecord ? expenseRecord.totalSpent : 0;

            // Find budget for this month
            const budgetRecord = budgetHistory.find(b => b.month === m && b.year === y);
            // Default to current user budget if no history record (best guess)
            // But we need to fetch user separately? req.user is attached by protect middleware? 
            // Wait, protect middleware attaches req.user, but it might be just the User document or ID depending on implementation.
            // Let's check authMiddleware. Ah, it does `req.user = await User.findById(decoded.id)`. So we have the full user doc!
            const budget = budgetRecord ? budgetRecord.amount : (req.user.monthlyBudget || 0);

            result.push({
                month: monthNames[m - 1],
                year: y,
                budget,
                spent,
                status: spent > budget ? 'Over Budget' : 'Within Budget'
            });
        }

        res.json(result);

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create an expense
// @route   POST /expenses
// @access  Private
router.post('/', protect, async (req, res) => {
    const { amount, category, description, date, planId } = req.body;
    const idempotencyKey = req.header('Idempotency-Key');

    // Validation
    if (!amount || !category || !description || !date) {
        return res.status(400).json({ message: 'Please include all fields' });
    }
    if (!Number.isInteger(Number(amount))) {
        return res.status(400).json({ message: 'Amount must be an integer (paise)' });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: 'Idempotency-Key header is missing' });
    }

    try {
        // Check for duplicate request (Idempotency) scoped to user
        const existingExpense = await Expense.findOne({
            user: req.user.id,
            idempotencyKey
        });

        if (existingExpense) {
            return res.status(200).json(existingExpense);
        }

        const expenseData = {
            user: req.user.id,
            amount,
            category,
            description,
            date,
            splitBetween: req.body.splitBetween || [],
            idempotencyKey
        };

        // If planId is provided, verify it belongs to user
        if (planId) {
            const plan = await Plan.findById(planId);
            if (plan && plan.user.toString() === req.user.id) {
                expenseData.plan = planId;
            } else {
                return res.status(400).json({ message: 'Invalid or unauthorized plan' });
            }
        }

        const expense = await Expense.create(expenseData);
        res.status(201).json(expense);

    } catch (err) {
        if (err.code === 11000) {
            // Handle race condition where duplicate inserted in parallel
            const existing = await Expense.findOne({ user: req.user.id, idempotencyKey });
            if (existing) return res.status(200).json(existing);
        }
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get all expenses
// @route   GET /expenses
// @access  Private
router.get('/', protect, async (req, res) => {
    const { category, date, sort, planId } = req.query;
    const query = { user: req.user.id };

    if (category && category !== 'All') {
        query.category = category;
    }

    if (planId) {
        query.plan = planId;
    }

    // Exclude Plan Expenses (for Dashboard)
    if (req.query.excludePlans === 'true') {
        // This ensures we get expenses where plan is either explicitly null or the field doesn't exist
        query.$or = [{ plan: null }, { plan: { $exists: false } }];
    }

    // Date Filter (Range or Single Date)
    const { startDate, endDate } = req.query;

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate).toISOString(),
            $lte: new Date(endDate).toISOString()
        };
    } else if (date) {
        // Fallback for single date (backward compatibility)
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);

        query.date = {
            $gte: start.toISOString(),
            $lte: end.toISOString()
        };
    }

    let sortOption = {};
    if (sort === 'date_asc') {
        sortOption.date = 1;
        sortOption.createdAt = 1; // Secondary sort for same-day expenses
    } else if (sort === 'amount_desc') {
        sortOption.amount = -1;
    } else if (sort === 'amount_asc') {
        sortOption.amount = 1;
    } else {
        // Default: newest first
        sortOption.date = -1;
        sortOption.createdAt = -1; // Secondary sort for same-day expenses
    }

    try {
        const expenses = await Expense.find(query).sort(sortOption);
        res.status(200).json(expenses);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Delete an expense
// @route   DELETE /expenses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await Expense.findByIdAndDelete(req.params.id);

        res.json({ id: req.params.id, message: 'Expense removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
