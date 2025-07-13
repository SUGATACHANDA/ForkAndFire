const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
// === THE FIX IS HERE: Import the axios instance, not the SDK client ===
const { paddleApi } = require("../utils/paddleClient.js");
const { paddleSdk } = require("../utils/paddleSdkClient.js");

const mongoose = require("mongoose");
const Order = require("../models/orderModel.js");
const sendEmail = require("../utils/sendMail.js");
const createOrderConfirmationHtml = require("../utils/orderConfirmationTemplate.js");

/**
 * @desc    Creates a Paddle Transaction and returns its ID for an Inline Checkout.
 * @route   POST /api/paddle/create-transaction/:productId
 * @access  Private
 */
const createTransactionForCheckout = asyncHandler(async (req, res) => {
    // === THE FIX: Use `req.params.id` which matches the route definition ===
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    console.log(
        `[Step 1] Initiating checkout for local Product ID: ${productId}`
    );

    // --- Validation ---
    if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400); // Bad Request
        throw new Error("The provided product ID is invalid.");
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found in our database.");
    }
    if (!product.paddlePriceId) {
        res.status(500);
        throw new Error(
            "This product is not configured for payments on the server."
        );
    }
    if (quantity > product.amountLeft) {
        res.status(400);
        throw new Error(`Only ${product.amountLeft} items are in stock.`);
    }

    // --- Pre-flight check with Paddle API (This part is already robust) ---
    try {
        console.log(
            `[Step 2] Verifying Paddle resources for Price ID: ${product.paddlePriceId}`
        );
        const priceResponse = await paddleApi.get(
            `/prices/${product.paddlePriceId}`
        );
        if (priceResponse.data.data.status !== "active") {
            throw new Error(
                "This product has an inactive price and cannot be purchased."
            );
        }
        console.log(`✅ Paddle price is active.`);
    } catch (axiosError) {
        console.error(
            "❌ PADDLE PRE-FLIGHT CHECK FAILED:",
            axiosError.response?.data || axiosError.message
        );
        throw new Error(
            "Could not verify product details with our payment provider."
        );
    }

    // --- Create the Transaction ---
    try {
        const payload = {
            items: [
                {
                    priceId: product.paddlePriceId,
                    quantity: parseInt(quantity, 10) || 1,
                },
            ],
            customer: user.paddleCustomerId
                ? { id: user.paddleCustomerId }
                : { email: user.email },
            custom_data: {
                userId: user._id.toString(),
                productId: product._id.toString(),
                quantity: parseInt(quantity, 10) || 1,
            },
        };

        console.log("[Step 3] Sending final payload to Paddle /transactions");
        const response = await paddleApi.post("/transactions", payload);
        const transactionId = response.data?.data?.id;

        if (!transactionId)
            throw new Error("Could not initialize the payment session.");

        const checkoutUrl = `${process.env.PADDLE_CHECKOUT_URL}/${transactionId}`;
        console.log(`✅ Checkout created successfully! URL: ${checkoutUrl}`);
        res.status(200).json({ checkoutUrl });
    } catch (axiosError) {
        console.error(
            "❌ PADDLE PRE-FLIGHT CHECK FAILED:",
            axiosError.response?.data || axiosError.message
        );
        res.status(500);
        throw new Error(
            "Could not verify product details with our payment provider."
        );
    }

    // --- 3. CREATE THE TRANSACTION (this should now succeed) ---
    try {
        const payload = {
            items: [
                {
                    price_id: product.paddlePriceId,
                    quantity: parseInt(quantity, 10) || 1,
                },
            ],
            customer: { email: user.email },
            customData: {
                userId: user._id.toString(),
                productId: product._id.toString(),
                quantity: parseInt(quantity, 10) || 1,
            },
        };

        console.log(
            "[Step 3] Sending final payload to /transactions:",
            JSON.stringify(payload, null, 2)
        );

        const response = await paddleApi.post("/transactions", payload);
        const transactionId = response.data?.data?.id;

        if (!transactionId) {
            throw new Error(
                "Payment provider created a transaction but did not return an ID."
            );
        }

        const checkoutUrl = `${process.env.PADDLE_CHECKOUT_URL}/${transactionId}`;
        console.log(`✅ Checkout created successfully! URL: ${checkoutUrl}`);

        res.status(200).json({ checkoutUrl });
    } catch (axiosError) {
        console.error(
            "❌ FINAL TRANSACTION ERROR:",
            axiosError.response?.data?.error || axiosError.message
        );
        const errorMessage =
            axiosError.response?.data?.error?.detail ||
            "An unexpected final error occurred during checkout creation.";
        res.status(500).json({ message: errorMessage });
    }
});

/**
 * @desc    Handles incoming webhooks from Paddle.
 * @note    Webhook verification without the SDK is complex and requires manual
 *          cryptographic signature validation. This is an advanced topic.
 *          For now, we'll just log the event. Using the SDK for this one part is recommended.
 */
const handlePaddleWebhook = asyncHandler(async (req, res) => {
    // 1. Signature verification (no changes needed)
    const signature = req.headers["paddle-signature"];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    const rawRequestBody = req.body;
    if (!signature || !webhookSecret || !Buffer.isBuffer(rawRequestBody)) {
        return res
            .status(400)
            .send("Webhook validation failed: required data missing.");
    }

    try {
        const event = await paddleSdk.webhooks.unmarshal(
            rawRequestBody,
            webhookSecret,
            signature
        );
        console.log(`✅ Webhook verified for event: ${event.eventType}`);

        if (event.eventType === 'transaction.completed') {
            // === THE DEFINITIVE FIX: Correctly access snake_case properties ===
            const transactionData = event.data;

            // 1. Get the custom data (this part was correct in your log)
            const { userId, productId, quantity } = transactionData.customData;

            // 2. Get other key fields using their snake_case names from the webhook
            const paddleTransactionId = transactionData.id;
            const paddleCustomerId = transactionData.customerId;
            const billingDetails = transactionData.details;

            if (!userId || !productId || !quantity) {
                return res.status(200).send('Acknowledged: Missing custom data.');
            }

            // 3. Prevent duplicate processing
            const existingOrder = await Order.findOne({ paddleTransactionId });
            if (existingOrder) {
                return res.status(200).send('Acknowledged: Transaction already processed.');
            }

            // 4. Fulfillment - Decrement stock
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productId, amountLeft: { $gte: quantity } },
                { $inc: { amountLeft: -quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                console.error(`Webhook CRITICAL: Stock update failed for product ${productId}. REFUND REQUIRED.`);
                return res.status(200).send('Acknowledged, but stock conflict detected.');
            }

            // 5. Create the new Order with correct price data
            const purchasePriceInCents = billingDetails.totals.grandTotal;
            const displayPrice = billingDetails.lineItems[0]?.formatted_totals?.total; // Get formatted price for a single item
            const currencyCode = billingDetails.totals.currencyCode;

            if (!purchasePriceInCents || !displayPrice || !currencyCode) {
                return res.status(200).send('Acknowledged but webhook missing pricing details.');
            }

            const newOrder = new Order({
                user: userId, product: productId, paddleTransactionId, quantity,
                purchasePrice: purchasePriceInCents, displayPrice: displayPrice, currency: currencyCode,
                // accessToken: nanoid(24),
            });
            await newOrder.save();

            // 6. Update the User record. Fetch the user first to get their email.
            const user = await User.findById(userId);
            if (user) {
                user.paddleCustomerId = paddleCustomerId;
                await user.save();
                console.log(`- User ${userId} paddleCustomerId updated.`);

                // 7. Send the confirmation email
                try {
                    const fullOrderDetails = await Order.findById(newOrder._id).populate('product', 'name price');
                    if (fullOrderDetails) {
                        const emailHtml = createOrderConfirmationHtml({
                            recipientName: user.name.split(' ')[0],
                            recipientEmail: user.email, // Use the fetched email
                            order: fullOrderDetails,
                        });

                        await sendEmail({
                            to: user.email,
                            subject: `Your Fork & Fire Order Confirmation (#${newOrder._id.toString().slice(-6)})`,
                            html: emailHtml,
                        });
                        console.log(`- Order confirmation email sent successfully to ${user.email}`);
                    }
                } catch (emailError) {
                    console.error("Webhook Fulfillment Warning: Failed to send confirmation email.", emailError);
                }
            } else {
                console.warn(`- User ${userId} not found. Cannot send confirmation email.`);
            }
        }
        res.sendStatus(200);
    } catch (err) {
        console.error("❌ WEBHOOK ERROR:", err.message);
        res.status(400).send("Webhook Error: Could not process event.");
    }
});

const getLivePrice = asyncHandler(async (req, res) => {
    const { priceId } = req.params;

    if (!priceId || !priceId.startsWith("pri_")) {
        res.status(400);
        throw new Error("A valid price ID is required.");
    }

    try {
        console.log(`- Fetching live price for ID: ${priceId}`);
        const response = await paddleApi.get(`/prices/${priceId}`);

        const priceData = response.data.data;

        // We extract only the necessary details to send to the frontend.
        const livePrice = {
            amount: priceData.unit_price.amount, // The price in cents (e.g., 2999)
            currency: priceData.unit_price.currency_code, // e.g., 'USD'
        };

        res.status(200).json(livePrice);
    } catch (axiosError) {
        console.error(
            `❌ PADDLE PRICE FETCH ERROR for ID ${priceId}:`,
            axiosError.response?.data
        );
        res.status(404); // Use 404 as the price likely doesn't exist
        throw new Error("Could not retrieve pricing information at this time.");
    }
});

const previewPrice = asyncHandler(async (req, res) => {
    // We now expect `priceId` and `customerCountry` from the frontend.
    const { priceId, customerCountry } = req.body;

    if (!priceId) {
        res.status(400);
        throw new Error("A Price ID is required.");
    }

    try {
        const payload = {
            items: [{ price_id: priceId, quantity: 1 }],
            // Use the country code provided by the frontend, fallback to US
            address: {
                country_code: customerCountry || "US",
            },
        };

        const response = await paddleApi.post("/pricing-preview", payload);

        const priceDetails = response.data?.data?.details;
        const lineItem = priceDetails?.line_items?.[0];

        if (!lineItem?.formatted_totals?.total) {
            throw new Error("Formatted price totals not found in Paddle's response.");
        }

        res.status(200).json({
            // Send back the pre-formatted string (e.g., "$29.99" or "£23.99")
            displayPrice: lineItem.formatted_totals.total,
            // You could also send back other details if needed
            // subtotal: lineItem.formatted_totals.subtotal,
            // tax: lineItem.formatted_totals.tax
        });
    } catch (axiosError) {
        console.error("❌ PADDLE PRICE PREVIEW ERROR:", axiosError.response?.data);
        const errorMessage =
            axiosError.response?.data?.error?.detail ||
            "Could not retrieve live pricing.";
        res.status(500).json({ message: errorMessage });
    }
});

module.exports = {
    createTransactionForCheckout,
    handlePaddleWebhook,
    getLivePrice,
    previewPrice,
};
