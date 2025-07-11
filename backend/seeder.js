const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- Import Models ---
// We only need the User model for this specific task, but it's good practice
// to have placeholders for other models if you expand the seeder later.
const User = require('./models/userModel.js');
// const Recipe = require('./models/recipeModel.js'); 
// const Category = require('./models/categoryModel.js');

// --- Import Utility for DB Connection ---
const connectDB = require('./config/db.js');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// --- Define the Admin User Data ---
// IMPORTANT: Change the email and password to something secure!
const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword123', // The model will hash this automatically before saving.
    isAdmin: true,
};

// --- Import Function ---
const importData = async () => {
    try {
        // Clear existing users to prevent duplicates (optional, but good for a clean seed)
        await User.deleteMany({ email: 'admin@example.com' });

        // Create the admin user
        // We don't need to hash the password here because the `pre('save')`
        // middleware in our `userModel.js` handles it automatically.
        await User.create(adminUser);

        console.log('\x1b[32m%s\x1b[0m', '✓ Admin User Seeded Successfully!'); // Green text
        process.exit();
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `✗ Error seeding data: ${error}`); // Red text
        process.exit(1);
    }
};

// --- Destroy Function ---
const destroyData = async () => {
    try {
        // Find and delete the specific admin user
        await User.deleteMany({ email: 'admin@example.com' });

        console.log('\x1b[33m%s\x1b[0m', '✓ Admin User Destroyed Successfully!'); // Yellow text
        process.exit();
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `✗ Error destroying data: ${error}`); // Red text
        process.exit(1);
    }
};

// --- Command Line Logic ---
// process.argv is an array that contains the command-line arguments.
// process.argv[2] will be the first argument you pass (e.g., '-d').
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}