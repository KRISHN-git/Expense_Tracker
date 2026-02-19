
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Plan = require('../models/Plan');
const Expense = require('../models/Expense');

// @desc    Get all plans for user with total spent
// @route   GET /plans
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Use aggregation to join expenses and calculate total spent
        // We match plans by user, then lookup expenses, sum them up, and project the result
        // Note: MongoDB Lookup can be expensive if not indexed. Expense.plan needs index (which it has).
        const plans = await Plan.aggregate([
            { $match: { user: req.user._id } }, // Match plans for this user (user field in Plan is ObjectId ref)
            {
                $lookup: {
                    from: 'expenses', // Collection name
                    localField: '_id',
                    foreignField: 'plan',
                    as: 'expenses'
                }
            },
            {
                $addFields: {
                    totalSpent: { $sum: '$expenses.amount' },
                    expenseCount: { $size: '$expenses' }
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    totalBudget: 1,
                    type: 1,
                    members: 1,
                    createdAt: 1,
                    user: 1,
                    totalSpent: 1,
                    expenseCount: 1,
                    // expenses: 0 // Implicitly 0 if we list others as 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        // console.log("Plans Aggregated:", JSON.stringify(plans, null, 2)); // Debugging
        res.json(plans);
    } catch (err) {
        console.error("Error fetching plans:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get single plan
// @route   GET /plans/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        if (plan.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Get expenses for this plan
        const expenses = await Expense.find({ plan: req.params.id }).sort({ date: -1 });

        res.json({ plan, expenses });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a plan
// @route   POST /plans
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, totalBudget } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const plan = await Plan.create({
            user: req.user.id,
            title,
            description,
            totalBudget: totalBudget || 0,
            type: req.body.type || 'personal',
            members: req.body.members || []
        });

        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a plan
// @route   DELETE /plans/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Check user
        if (plan.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Delete associated expenses first
        await Expense.deleteMany({ plan: req.params.id });

        // Delete plan
        await Plan.findByIdAndDelete(req.params.id); // atomic removal

        res.json({ id: req.params.id, message: 'Plan removed' });
    } catch (error) {
        console.error("Error deleting plan:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
