const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const User = require("../models/userModel.js");
const Recipe = require("../models/recipeModel.js");
const Newsletter = require("../models/newsletterModel.js");
const sendEmail = require("../utils/sendMail.js");
const jwt = require("jsonwebtoken");
const resetPasswordEmailTemplate = require("../utils/generateResetEmailTemplate.js");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

const dotenv = require("dotenv");
dotenv.config();

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
        throw new Error("Invalid email or password");
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
        throw new Error("User with this email already exists");
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
        throw new Error("Invalid user data");
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
        throw new Error("Recipe not found");
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
    res.status(200).json({ message: "Favorites updated" });
});

// @desc    Get user's favorite recipes
// @route   GET /api/users/favorites
// @access  Private
const getFavoriteRecipes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user.favorites);
});

const checkUserExists = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const userExists = await User.exists({ email });
    res.status(200).json({ exists: !!userExists });
});

// ... your existing login and register functions ...

/**
 * @desc    Generate and mail a password reset token
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const RESET_JWT_SECRET = process.env.RESET_JWT_SECRET;

// 5 minutes expiry
const RESET_TOKEN_EXPIRY = "5m";

const verifyResetToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ valid: false, message: 'Token is missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.RESET_JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (
            !user ||
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < Date.now() ||
            user.resetTokenUsed
        ) {
            return res.json({ valid: false });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        console.error("VERIFY TOKEN ERROR:", error);
        res.status(400).json({ valid: false, message: 'Token is invalid or expired.' });
    }
});

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
            message:
                "If an account with that email exists, a password reset link has been sent.",
        });
    }

    // Create JWT token with 15-minute expiry
    const resetToken = jwt.sign({ userId: user._id }, RESET_JWT_SECRET, {
        expiresIn: RESET_TOKEN_EXPIRY,
    });

    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.resetTokenUsed = false;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const htmlTemplate = resetPasswordEmailTemplate(resetUrl, user.name);

    try {
        await sendEmail({
            to: user.email,
            subject: "Fork & Fire - Password Reset",
            html: htmlTemplate,
        });

        res.status(200).json({
            message:
                "If an account with that email exists, a password reset link has been sent.",
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
        throw new Error("Token and password are required.");
    }

    try {
        const decoded = jwt.verify(token, RESET_JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(404);
            throw new Error("User not found.");
        }

        if (
            !user.resetPasswordExpires ||
            user.resetPasswordExpires < Date.now() ||
            user.resetTokenUsed
        ) {
            res.status(400);
            throw new Error("Reset link is invalid or has expired.");
        }

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            res.status(400);
            throw new Error("You have entered your previous password.");
        }

        user.password = password;
        user.resetTokenUsed = true; // invalidate link immediately
        await user.save();

        const jwtToken = generateToken(user._id);

        res.status(200).json({
            message: "Password has been reset successfully. Redirecting...",
            token: jwtToken,
            _id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error("RESET ERROR:", err.message);
        res.status(400).json({ message: err.message || "Password reset token is invalid or has expired." });
    }
});


module.exports = {
    authUser,
    registerUser,
    toggleFavorite,
    getFavoriteRecipes,
    forgotPassword,
    resetPassword,
    checkUserExists,
    verifyResetToken,
};
