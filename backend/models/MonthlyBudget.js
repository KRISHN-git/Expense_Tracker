const mongoose = require('mongoose');

const MonthlyBudgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number, // 1-12
        required: true
    },
    year: {
        type: Number, // e.g., 2024
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure one budget per user per month
MonthlyBudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyBudget', MonthlyBudgetSchema);
