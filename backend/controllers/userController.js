const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const User = require('../models/userModel.js');
const Recipe = require('../models/recipeModel.js');
const Newsletter = require('../models/newsletterModel.js');
const sendEmail = require('../utils/sendMail.js');
const asyncHandler = require('express-async-handler');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, newsletter } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const user = await User.create({ name, email, password, newsletter });

    if (user) {
        // If the user checked the newsletter box during signup, add them to the list.
        if (newsletter) {
            // `findOneAndUpdate` with `upsert` is a safe way to "add if not exists".
            // It prevents errors if for some reason the email is already in the newsletter collection.
            await Newsletter.findOneAndUpdate(
                { email: user.email }, // Find a document with this email
                { $setOnInsert: { email: user.email } }, // If not found, create it with this data
                { upsert: true, new: true, setDefaultsOnInsert: true } // Options for the operation
            );
        }

        // Return user info and token to log them in immediately.
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Add/remove recipe from favorites
// @route   PUT /api/users/favorites
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
    const { recipeId } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(recipeId);

    if (isFavorite) {
        // Remove from favorites
        user.favorites.pull(recipeId);
    } else {
        // Add to favorites
        user.favorites.push(recipeId);
    }

    await user.save();
    res.status(200).json({ message: 'Favorites updated' });
});

// @desc    Get user's favorite recipes
// @route   GET /api/users/favorites
// @access  Private
const getFavoriteRecipes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
});

// ... your existing login and register functions ...

/**
 * @desc    Generate and mail a password reset token
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const RESET_JWT_SECRET = process.env.RESET_JWT_SECRET;

// 15 minutes expiry
const RESET_TOKEN_EXPIRY = '5m';

/**
 * @desc    Generate and email a JWT-based password reset link
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Don't reveal user existence
    if (!user) {
        return res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent."
        });
    }

    // Create JWT token with 15-minute expiry
    const resetToken = jwt.sign(
        { userId: user._id },
        RESET_JWT_SECRET,
        { expiresIn: RESET_TOKEN_EXPIRY }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const message = `
        <h1>Password Reset Requested</h1>
        <p>Please click the link below to reset your password (valid for 15 minutes):</p>
        <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
        <p>If you did not request this, you can ignore this email.</p>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Fork & Fire - Password Reset',
            html: message
        });

        res.status(200).json({
            message: "If an account with that email exists, a password reset link has been sent."
        });
    } catch (error) {
        console.error("FORGOT PASSWORD EMAIL ERROR:", error);
        throw new Error("Email could not be sent. Please try again later.");
    }
});

/**
 * @desc    Reset password using a JWT token
 * @route   POST /api/users/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        res.status(400);
        throw new Error("Please provide a token and a new password.");
    }

    try {
        const decoded = jwt.verify(token, RESET_JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(404);
            throw new Error("User not found.");
        }

        user.password = password;
        await user.save();

        // Optional: log in user after reset
        const jwtToken = generateToken(user._id);

        res.status(200).json({
            message: "Password has been reset successfully.",
            token: jwtToken,
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error("RESET TOKEN ERROR:", err);
        res.status(400);
        throw new Error("Password reset token is invalid or has expired.");
    }
});

module.exports = { authUser, registerUser, toggleFavorite, getFavoriteRecipes, forgotPassword, resetPassword };