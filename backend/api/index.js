const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');
const { notFound, errorHandler } = require('../middleware/errorMiddleware');

// Import Routers
const userRoutes = require('../routes/userRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const recipeRoutes = require('../routes/recipeRoutes');
const faqRoutes = require('../routes/faqRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes.js');
const newsletterRoutes = require('../routes/newsletterRoutes');
const commentRoutes = require('../routes/commentRoutes.js');
const productRoutes = require('../routes/productRoutes');
const paddleRoutes = require('../routes/paddleRoutes');
const orderRoutes = require('../routes/orderRoutes.js');
const cartRoutes = require('../routes/cartRoutes.js')
// For standard JSON routes
const paddleController = require('../controllers/paddleController');


// Initial Setup
dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PADDLE_API_KEY', 'PADDLE_WEBHOOK_SECRET'];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    // If any required variable is missing, log a clear error and stop the server.
    console.error('❌ FATAL ERROR: Missing required environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    // `process.exit(1)` tells the system that the script terminated with an error.
    process.exit(1);
}

console.log('✅ All required environment variables loaded successfully.');

connectDB();
const app = express();

app.post(
    '/api/paddle/webhook',
    express.raw({ type: 'application/json' }),
    paddleController.handlePaddleWebhook
);

app.use(cors());
// Middlewares
app.use(express.json()); // Body parser for JSON

// API Info Route
app.get('/api', (req, res) => {
    res.send('API is running...');
});

// Mount Routers
app.use('/api/paddle', paddleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes)

app.get('/', (req, res) => {
    res.send('Welcome to the Recipe Website API');
});


// Make uploads folder static

// Custom Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));