const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    paddleProductId: { type: String, required: true }, // 'pro_...'
    paddlePriceId: { type: String, required: true }, // 'pri_...'
    price: { type: Number, required: true }, // e.g., 29.99
    currency: { type: String, required: true, default: 'USD' },
    totalAmount: { type: Number, required: true },
    amountLeft: { type: Number, required: true },
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);
module.exports = Product;