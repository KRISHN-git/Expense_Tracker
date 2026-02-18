
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be positive'],
        validate: {
            validator: Number.isInteger,
            message: 'Amount must be an integer (in paise)'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        index: true
    },
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple nulls if ever needed, but likely we want unique or required? 
        // If required, we must send it. Better to be unique and required for this exercise.
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index if we wanted to enforce uniqueness per user per day, but idempotencyKey handles the strict case.

module.exports = mongoose.model('Expense', ExpenseSchema);
