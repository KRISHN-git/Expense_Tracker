const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc    Register new user
// @route   POST /auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

// @desc    Google Login
// @route   POST /auth/google
// @access  Public
router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // If user exists but doesn't have googleId (e.g., signed up with password)
            if (!user.googleId) {
                user.googleId = googleId;
                user.picture = picture;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId,
                picture
            });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Google Sign-In Failed' });
    }
});

// @desc    Get user data
// @route   GET /auth/me
// @access  Private
const MonthlyBudget = require('../models/MonthlyBudget');

// ... existing code ...

// @desc    Update user profile (budget)
// @route   PUT /auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // Update Budget & Log History
            if (req.body.monthlyBudget !== undefined) {
                user.monthlyBudget = req.body.monthlyBudget;

                // Track history for current month
                const now = new Date();
                const month = now.getMonth() + 1; // 1-12
                const year = now.getFullYear();

                await MonthlyBudget.findOneAndUpdate(
                    { user: user._id, month, year },
                    { amount: req.body.monthlyBudget, updatedAt: now },
                    { upsert: true, new: true }
                );
            }

            if (req.body.password) {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                monthlyBudget: updatedUser.monthlyBudget,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = router;
