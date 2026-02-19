
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Plan = require('../models/Plan');
const { protect } = require('../middleware/authMiddleware');

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

    if (date) {
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);

        query.date = {
            $gte: startDate.toISOString(),
            $lte: endDate.toISOString()
        };
    }

    let sortOption = {};
    if (sort === 'date_asc') {
        sortOption.date = 1;
    } else if (sort === 'amount_desc') {
        sortOption.amount = -1;
    } else if (sort === 'amount_asc') {
        sortOption.amount = 1;
    } else {
        // Default: newest first
        sortOption.date = -1;
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
