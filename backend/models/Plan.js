
const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Plan title is required']
    },
    description: {
        type: String
    },
    totalBudget: {
        type: Number, // In paise
        default: 0
    },
    type: {
        type: String,
        enum: ['personal', 'group'],
        default: 'personal'
    },
    members: [{
        name: {
            type: String,
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Plan', PlanSchema);
