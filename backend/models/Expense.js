
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
    type: {
        type: String,
        enum: ['expense', 'income'],
        default: 'expense'
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        default: null
    },
    splitBetween: [{
        type: String // Stores names of members involved in the expense
    }],
    paidBy: {
        type: String // Name of the member who paid
    },
    idempotencyKey: {
        type: String,
        // unique: true, // Old global uniqueness
        // index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for User-scoped Idempotency
ExpenseSchema.index({ user: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

// Compound index if we wanted to enforce uniqueness per user per day, but idempotencyKey handles the strict case.

module.exports = mongoose.model('Expense', ExpenseSchema);
