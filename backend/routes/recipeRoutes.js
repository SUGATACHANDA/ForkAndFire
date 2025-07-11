const express = require('express');
const router = express.Router();
const {
    createRecipe,
    getRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
} = require('../controllers/recipeController');

const { protect, admin } = require('../middleware/authMiddleware');


// Route to get all recipes and create a new one.
// The 'create' route chain: check auth -> accept any files -> process images -> run controller.
router
    .route('/')
    .get(getRecipes)
    .post(
        protect,
        admin,
        createRecipe // 3. Controller saves the data with new image paths
    );

// Routes for a specific recipe by ID.
// The 'update' route has the same middleware chain.
router
    .route('/:id')
    .get(getRecipeById)
    .put(
        protect,
        admin,
        updateRecipe // 3. Controller intelligently updates paths
    )
    .delete(protect, admin, deleteRecipe);

module.exports = router;