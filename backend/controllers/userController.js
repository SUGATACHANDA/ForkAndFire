const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const User = require('../models/userModel.js');
const Recipe = require('../models/recipeModel.js');
const Newsletter = require('../models/newsletterModel.js');

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

module.exports = { authUser, registerUser, toggleFavorite, getFavoriteRecipes };