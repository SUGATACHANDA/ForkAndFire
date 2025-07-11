const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Category = require('../models/categoryModel.js');
const Recipe = require('../models/recipeModel.js'); // <-- Import Recipe model to check for dependencies

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    // --- THE FIX IS HERE ---
    // 1. Read the 'limit' query parameter from the request URL.
    // We use Number() to convert it from a string to an integer.
    // The || 0 fallback means "if there's no limit, set it to 0," which Mongoose
    // interprets as "no limit," so it will return all documents.
    const limit = Number(req.query.limit) || 0;

    // 2. Find all categories, sort them by name, and then apply the limit.
    const categories = await Category.find({})
        .sort({ name: 1 }) // Sorting ensures a consistent order
        .limit(limit);    // Apply the limit to the database query

    res.status(200).json(categories);
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Private/Admin
const getCategoryById = asyncHandler(async (req, res) => {
    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400); // Bad Request
        throw new Error('Invalid category ID format');
    }

    const category = await Category.findById(req.params.id);

    if (category) {
        res.status(200).json(category);
    } else {
        res.status(404);
        throw new Error('Category not found');
    }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // --- Stricter Validation ---
    if (!name || name.trim() === '') {
        res.status(400);
        throw new Error('Category name is required.');
    }

    // Check for uniqueness, case-insensitive
    const categoryExists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });

    if (categoryExists) {
        res.status(400);
        throw new Error(`A category with the name "${name}" already exists.`);
    }

    const category = new Category({
        name,
        description: description || '', // Ensure description is at least an empty string
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Validate if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid category ID format');
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    // --- Improved Duplicate Check on Update ---
    if (name) {
        // Check if another category (not this one) already has the new name
        const categoryExists = await Category.findOne({
            name: { $regex: `^${name}$`, $options: 'i' },
            _id: { $ne: req.params.id } // $ne means "not equal"
        });

        if (categoryExists) {
            res.status(400);
            throw new Error(`A category with the name "${name}" already exists.`);
        }
        category.name = name;
    }

    // Update description if provided
    if (description !== undefined) {
        category.description = description;
    }

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
});


// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    // Validate if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid category ID format');
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    // --- CRUCIAL: Data Integrity Check ---
    // Check if any recipes are currently using this category before deleting.
    const recipeCount = await Recipe.countDocuments({ category: req.params.id });

    if (recipeCount > 0) {
        res.status(400); // Bad Request, as the operation cannot be completed
        throw new Error(`Cannot delete category. It is currently assigned to ${recipeCount} recipe(s). Please reassign them first.`);
    }

    // If no recipes are using it, proceed with deletion.
    await category.deleteOne();

    res.status(200).json({ message: `Category "${category.name}" removed successfully` });
});


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};