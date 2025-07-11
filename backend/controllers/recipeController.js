const asyncHandler = require('express-async-handler');
const Recipe = require('../models/recipeModel.js');
const User = require('../models/userModel.js');
const Comment = require('../models/commentModel.js')

// @desc    Fetch all recipes
const getRecipes = asyncHandler(async (req, res) => {
    // Check for query parameters for filtering and limiting results
    const limit = Number(req.query.limit) || 0;
    const categoryId = req.query.category;

    // Build the query object
    const query = {};
    if (categoryId) {
        query.category = categoryId;
    }

    // Find recipes based on the query, populate category, sort by newest, and apply limit
    const recipes = await Recipe.find(query)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);

    res.json(recipes);
});


// @desc    Fetch single recipe
const getRecipeById = asyncHandler(async (req, res) => {
    // 1. Fetch the recipe and populate its primary related data
    const recipe = await Recipe.findById(req.params.id)
        .populate('category', 'name')
        .populate('author', 'name')
        .populate('faqs');

    if (recipe) {
        // 2. Perform two separate, efficient counts for favorites and comments.
        const [favoriteCount, commentCount] = await Promise.all([
            User.countDocuments({ favorites: req.params.id }),
            Comment.countDocuments({ recipe: req.params.id }) // Count comments for this recipe
        ]);

        // 3. Convert to a plain object to add new properties
        const recipeObject = recipe.toObject();

        // 4. Attach the counts to the object
        recipeObject.favoriteCount = favoriteCount;
        recipeObject.commentCount = commentCount; // <-- Attach the new comment count

        res.json(recipeObject);
    } else {
        res.status(404);
        throw new Error('Recipe not found');
    }
});


// @desc    Delete a recipe
const deleteRecipe = asyncHandler(async (req, res) => {
    // Find and delete...
});

// @desc    Create a recipe
const createRecipe = asyncHandler(async (req, res) => {
    // Expect a clean JSON payload with image URLs already included from the frontend
    const { title, description, prepTime, cookTime, servings, category, youtubeUrl, mainImage, ingredients, steps, faqs } = req.body;

    // The 'steps' array received here should already be in the correct format.
    const recipe = new Recipe({
        title, description, prepTime, cookTime, servings, category, youtubeUrl,
        mainImage: mainImage || '',
        author: req.user._id,
        ingredients: ingredients || [],
        steps: steps || [],
        faqs: faqs || [],
    });

    const createdRecipe = await recipe.save();
    res.status(201).json(createdRecipe);
});


// --- UPDATE Recipe Controller ---
// This version ONLY deals with req.body. All file logic is gone.
const updateRecipe = asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
    }

    const { title, description, prepTime, cookTime, servings, category, youtubeUrl, mainImage, ingredients, steps, faqs } = req.body;

    // Directly assign the values from the payload.
    // If a field wasn't changed on the frontend, the frontend will send the original value.
    recipe.title = title ?? recipe.title;
    recipe.description = description ?? recipe.description;
    recipe.prepTime = prepTime ?? recipe.prepTime;
    recipe.cookTime = cookTime ?? recipe.cookTime;
    recipe.servings = servings ?? recipe.servings;
    recipe.category = category ?? recipe.category;
    recipe.youtubeUrl = youtubeUrl ?? recipe.youtubeUrl;
    recipe.mainImage = mainImage ?? recipe.mainImage; // This will be the new OR old Cloudinary URL
    recipe.ingredients = ingredients ?? recipe.ingredients;
    recipe.steps = steps ?? recipe.steps; // The frontend is now responsible for preserving old image URLs
    recipe.faqs = faqs ?? recipe.faqs;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
});

module.exports = { getRecipes, getRecipeById, deleteRecipe, createRecipe, updateRecipe };