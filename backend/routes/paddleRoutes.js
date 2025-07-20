const express = require('express');
const router = express.Router();
const { createTransactionForCheckout, getLivePrice, previewPrice, cartCheckoutForMultipleProducts } = require('../controllers/paddleController.js');

const { protect } = require('../middleware/authMiddleware.js');
// const geoipMiddleware = require('../middleware/geoipMiddleware.js');

/**
 * @route   POST /api/paddle/create-transaction/:productId
 * @desc    Creates a new Paddle transaction for a given product ID and returns the transaction ID
 *          for the frontend to open the inline checkout.
 * @access  Private (A user must be logged in to purchase)
 */
router.post('/create-transaction/:productId', protect, createTransactionForCheckout);

router.route('/:id/checkout').post(protect, createTransactionForCheckout);

router.get('/price/:priceId', protect, getLivePrice);

router.route('/preview-price').post(previewPrice);

router.post("/cart-checkout", protect, cartCheckoutForMultipleProducts);


/**
 * @route   POST /api/paddle/webhook
 * @desc    Receives webhook notifications from Paddle for events like 'transaction.completed'.
 *          This endpoint MUST be public and have a special raw body parser.
 * @access  Public
 */
// router.post('/webhook', handlePaddleWebhook);


module.exports = router;