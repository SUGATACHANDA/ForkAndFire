const express = require('express');
const router = express.Router();
const { authUser, registerUser, toggleFavorite, getFavoriteRecipes, forgotPassword, resetPassword } = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.route('/').post(registerUser);
router.post('/login', authUser);
router.route('/favorites').put(protect, toggleFavorite).get(protect, getFavoriteRecipes);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;