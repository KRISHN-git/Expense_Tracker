
const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// @route   POST /expenses
// @desc    Create a new expense
// @access  Public
router.post('/', async (req, res) => {
    const { amount, category, description, date } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    // Basic Validation
    if (!amount || !category || !description || !date) {
        return res.status(400).json({ error: 'Please include all fields' });
    }

    // Idempotency Check
    if (idempotencyKey) {
        try {
            const existingExpense = await Expense.findOne({ idempotencyKey });
            if (existingExpense) {
                // Return existing resource 
                return res.status(200).json(existingExpense);
            }
        } catch (err) {
            console.error("Idempotency check error", err);
            // Continue to try to create, or fail safe? 
            // If DB is down, we'll fail later anyway.
        }
    }

    try {
        const expense = new Expense({
            amount,
            category,
            description,
            date,
            idempotencyKey
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        // Handle Duplicate Key Error (MongoDB code 11000) for idempotencyKey race condition
        if (err.code === 11000 && err.keyPattern && err.keyPattern.idempotencyKey) {
            try {
                const existing = await Expense.findOne({ idempotencyKey });
                if (existing) return res.status(200).json(existing);
            } catch (findErr) {
                return res.status(500).json({ error: 'Server Error' });
            }
        }

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: messages });
        }

        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   GET /expenses
// @desc    Get all expenses
// @access  Public
router.get('/', async (req, res) => {
    const { category, sort } = req.query;

    let query = {};
    if (category) {
        query.category = category;
    }

    let sortOption = { createdAt: -1 }; // Default: Newest created first
    if (sort === 'date_desc') {
        sortOption = { date: -1 };
    }

    try {
        const expenses = await Expense.find(query).sort(sortOption);
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
