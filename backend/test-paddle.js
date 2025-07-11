// This script is for pure debugging. It has minimal dependencies.

const dotenv = require('dotenv');
const { Paddle, Environment } = require('@paddle/paddle-node-sdk');

// Load environment variables directly into this script.
dotenv.config();

// --- CRITICAL VALIDATION STEP ---
// We will manually check the variables to see what our script is actually loading.
console.log("--- DEBUGGING PADDLE CREDENTIALS ---");

const PADDLE_API_KEY = process.env.PADDLE_API_KEY;

if (!PADDLE_API_KEY) {
    console.error("❌ FATAL: PADDLE_API_KEY was NOT FOUND in your .env file.");
    process.exit(1); // Exit the script immediately.
}

if (typeof PADDLE_API_KEY !== 'string' || PADDLE_API_KEY.trim().length < 20) {
    console.error("❌ FATAL: PADDLE_API_KEY seems to be malformed or too short.");
    console.log(`   Value found: "${PADDLE_API_KEY}"`);
    process.exit(1);
}

// Show the key's length and a masked version to check for whitespace issues.
console.log(`✅ PADDLE_API_KEY found.`);
console.log(`   - Length: ${PADDLE_API_KEY.length}`);
console.log(`   - Starts with: "${PADDLE_API_KEY.substring(0, 8)}..."`);
console.log(`   - Ends with: "...${PADDLE_API_KEY.substring(PADDLE_API_KEY.length - 4)}"`);
console.log("--------------------------------------\n");

// --- ISOLATED API CALL ---

// Initialize a new Paddle client instance inside this script.
const paddle = new Paddle(PADDLE_API_KEY, {
    environment: Environment.sandbox, // Force sandbox for testing
});

// A hardcoded, known-good price ID from a public Paddle test product.
// This eliminates any errors related to your own product/price setup.
const TEST_PRICE_ID = 'pri_01jzjw7m1z0v79xn5fgpksn4ef'; // This is Paddle's "Annual Plan" test price

const testPaddleApi = async () => {
    console.log("🚀 Attempting to create a test transaction with Paddle...");
    try {
        const transaction = await paddle.transactions.create({
            items: [{ priceId: TEST_PRICE_ID, quantity: 1 }],
            // We use a dummy email to avoid customer creation issues.
            customer: { email: `test-user-${Date.now()}@example.com` }
        });

        console.log("\n✅✅✅ SUCCESS! ✅✅✅");
        console.log("The API call worked. The authentication credentials ARE CORRECT.");
        console.log("Transaction created successfully with ID:", transaction.id);
        console.log("This means the issue is NOT with your API key, but somewhere in your main application's code.");

    } catch (paddleError) {
        console.log("\n❌❌❌ FAILURE! ❌❌❌");
        console.log("The API call failed. This strongly suggests an issue with your API Key or environment setup.");
        console.error("Error Message:", paddleError.message);
        // The SDK error object has detailed information.
        if (paddleError.body && paddleError.body.error) {
            console.error("Paddle's Detailed Error Response:", JSON.stringify(paddleError.body.error, null, 2));
        }
    }
};

// Run the test
testPaddleApi();