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
const createAdminOrderNotificationHtml = require('../utils/adminOrderNotificationTemplate.js');
const createCustomerConfirmationHtml = require('../utils/customerOrderTemplate.js');

const createCartCheckout = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user.cart || user.cart.length === 0) {
        res.status(400); throw new Error('Your cart is empty.');
    }

    // Check if any item in the cart has insufficient stock
    for (const item of user.cart) {
        if (item.quantity > item.product.amountLeft) {
            res.status(400);
            throw new Error(`Not enough stock for "${item.product.name}". Only ${item.product.amountLeft} available.`);
        }
    }

    try {
        // Create a list of items for the Paddle transaction
        const transactionItems = user.cart.map(item => ({
            priceId: item.product.paddlePriceId,
            quantity: item.quantity,
        }));

        const transaction = await paddle.transactions.create({
            items: transactionItems,
            customerId: user.paddleCustomerId,
            customData: {
                userId: user._id.toString(),
                isCartCheckout: true, // A flag to identify a cart purchase in the webhook
                // We pass the cart content for the webhook to process
                cart: user.cart.map(item => ({ productId: item.product._id, quantity: item.quantity })),
            }
        });

        res.status(200).json({ transactionId: transaction.id });
    } catch (paddleError) {
        console.error("PADDLE CART CHECKOUT ERROR:", paddleError);
        res.status(500).json({ message: "Could not create cart checkout session." });
    }
});

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
// const handlePaddleWebhook = asyncHandler(async (req, res) => {
//     // 1. Signature verification (no changes needed)
//     const signature = req.headers["paddle-signature"];
//     const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
//     const rawRequestBody = req.body;
//     if (!signature || !webhookSecret || !Buffer.isBuffer(rawRequestBody)) {
//         return res
//             .status(400)
//             .send("Webhook validation failed: required data missing.");
//     }

//     try {
//         const event = await paddleSdk.webhooks.unmarshal(
//             rawRequestBody,
//             webhookSecret,
//             signature
//         );
//         console.log(`✅ Webhook verified for event: ${event.eventType}`);

//         if (event.eventType === "transaction.completed") {
//             const transactionData = event.data;
//             const customData = transactionData.customData;

//             if (!customData?.userId) { return res.status(200).send('Acknowledged: Missing userId.'); }

//             const existingOrder = await Order.findOne({ paddleTransactionId: transactionData.id });
//             if (existingOrder) { return res.status(200).send('Acknowledged: Already processed.'); }

//             let productsToUpdate, orderItems;

//             // Determine if it's a cart or single item purchase
//             if (customData.isCartCheckout && Array.isArray(customData.cart)) {
//                 console.log(`- Fulfilling CART checkout for transaction ${transactionData.id}`);
//                 productsToUpdate = customData.cart; // An array of {productId, quantity}
//                 orderItems = customData.cart.map(item => ({ product: item.productId, quantity: item.quantity }));
//             } else {
//                 console.log(`- Fulfilling SINGLE item checkout for transaction ${transactionData.id}`);
//                 productsToUpdate = [{ productId: customData.productId, quantity: customData.quantity }];
//                 orderItems = [{ product: customData.productId, quantity: customData.quantity }];
//             }

//             // Decrement stock for all purchased items
//             const stockUpdatePromises = productsToUpdate.map(item =>
//                 Product.updateOne({ _id: item.productId, amountLeft: { $gte: item.quantity } }, { $inc: { amountLeft: -item.quantity } })
//             );
//             await Promise.all(stockUpdatePromises);
//             console.log(`- Stock decremented for ${productsToUpdate.length} item(s).`);

//             const totals = transactionData.details?.totals;
//             const liveDisplayPrice = totals?.total; // This is the formatted string, e.g., "£28.79"
//             const purchasePriceInCents = totals?.grandTotal;
//             const currencyCode = totals?.currencyCode;

//             // Validate that we have the essential data
//             if (!liveDisplayPrice || !purchasePriceInCents || !currencyCode) {
//                 console.error(
//                     `Webhook CRITICAL: Transaction ${transactionData.id} missing pricing details.`
//                 );
//                 return res
//                     .status(200)
//                     .send("Acknowledged, but cannot process without pricing.");
//             }

//             // Create a single, flexible Order document
//             const newOrder = new Order({
//                 user: customData.userId,
//                 products: orderItems,
//                 isCartPurchase: !!customData.isCartCheckout,
//                 paddleTransactionId: transactionData.id,
//                 purchasePrice: purchasePriceInCents,
//                 displayPrice: liveDisplayPrice,
//                 currency: currencyCode,
//             });
//             await newOrder.save();
//             console.log(`- New order record created: ${newOrder._id}`);

//             // --- Send Emails ---
//             // Fetch the full order with ALL details needed for BOTH emails in one go
//             const fullOrderDetails = await Order.findById(newOrder._id)
//                 .populate({ path: 'user', select: 'name email' })
//                 .populate({ path: 'products.product', select: 'name price' }); // Populate the product details within the array

//             if (fullOrderDetails?.user?.email) {
//                 // Prepare and send emails in parallel for efficiency
//                 await Promise.all([
//                     // Send to Customer
//                     sendEmail({
//                         to: fullOrderDetails.user.email,
//                         subject: `Your Fork & Fire Order Confirmation (#${newOrder._id.toString().slice(-6)})`,
//                         html: createCustomerConfirmationHtml({
//                             recipientName: fullOrderDetails.user.name.split(' ')[0],
//                             recipientEmail: fullOrderDetails.user.email,
//                             order: fullOrderDetails,
//                         }),
//                     }),
//                     // Send to Admin
//                     sendEmail({
//                         to: process.env.ADMIN_EMAIL_ADDRESS || process.env.EMAIL_USER,
//                         subject: `🎉 New Order! (${fullOrderDetails.displayPrice})`,
//                         html: createAdminOrderNotificationHtml({ order: fullOrderDetails }),
//                     })
//                 ]).catch(emailError => {
//                     // Log errors but don't fail the webhook
//                     console.error("Webhook Warning: Failed to send one or more confirmation emails.", emailError);
//                 });
//                 console.log('- All notification emails dispatched.');
//             }

//             // Update user's paddle customer ID
//             await User.updateOne({ _id: customData.userId }, { $set: { paddleCustomerId: transactionData.customer_id } });
//         }
//         // Final "OK" to Paddle
//         res.sendStatus(200);
//     } catch (err) {
//         console.error("❌ WEBHOOK ERROR:", err.message);
//         res.status(400).send("Webhook Error: Could not process event.");
//     }
// });

const handlePaddleWebhook = asyncHandler(async (req, res) => {
    // 1. Get required data for verification from the request
    const signature = req.headers['paddle-signature'];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    const rawRequestBody = req.body;

    // 2. Validate that we have everything needed for verification
    if (!signature || !webhookSecret || !Buffer.isBuffer(rawRequestBody)) {
        console.error("Webhook received with missing signature, secret, or raw body.");
        return res.status(400).send('Webhook validation failed: Missing required data.');
    }

    try {
        // 3. Securely verify that the webhook is genuinely from Paddle
        const event = await paddleSdk.webhooks.unmarshal(rawRequestBody, webhookSecret, signature);
        console.log(`✅ Webhook signature VERIFIED successfully for event: ${event.eventType}`);

        // 4. Process only the event that signifies a successful payment
        if (event.eventType === 'transaction.completed') {
            const transactionData = event.data;
            const { custom_data, id: paddleTransactionId, customer_id: paddleCustomerId, details } = transactionData;

            // 5. Validate the integrity of our custom data payload
            if (!custom_data || !custom_data.userId) {
                console.warn(`Webhook for txn ${paddleTransactionId} is missing critical 'userId'. Cannot fulfill.`);
                return res.status(200).send('Acknowledged, but cannot process without custom user data.');
            }
            const { userId } = custom_data;

            // 6. Prevent duplicate processing
            const existingOrder = await Order.findOne({ paddleTransactionId });
            if (existingOrder) {
                console.warn(`Webhook for txn ${paddleTransactionId} has already been processed. Skipping.`);
                return res.status(200).send('Acknowledged: Transaction already processed.');
            }

            // --- FULFILLMENT LOGIC ---
            let fulfillmentData;

            // Determine if this is a cart or single item checkout
            if (custom_data.isCartCheckout && Array.isArray(custom_data.cart)) {
                fulfillmentData = { isCart: true, items: custom_data.cart };
                console.log(`- Fulfilling CART checkout for txn ${paddleTransactionId}`);
            } else if (custom_data.productId && custom_data.quantity) {
                fulfillmentData = { isCart: false, items: [{ productId: custom_data.productId, quantity: custom_data.quantity }] };
                console.log(`- Fulfilling SINGLE item checkout for txn ${paddleTransactionId}`);
            } else {
                console.error(`Webhook for txn ${paddleTransactionId} is missing product/cart data.`);
                return res.status(200).send('Acknowledged: Missing product data.');
            }

            // 7. Atomically decrement stock for all purchased items
            const stockUpdatePromises = fulfillmentData.items.map(item =>
                Product.updateOne(
                    { _id: item.productId, amountLeft: { $gte: item.quantity } },
                    { $inc: { amountLeft: -item.quantity } }
                )
            );
            const stockUpdateResults = await Promise.all(stockUpdatePromises);

            // Check if any stock updates failed
            const failedStockUpdates = stockUpdateResults.filter(result => result.modifiedCount === 0);
            if (failedStockUpdates.length > 0) {
                console.error(`Webhook CRITICAL: Stock update failed for one or more items in txn ${paddleTransactionId}. REFUND MAY BE REQUIRED.`);
                // Decide if you want to stop or continue. For now, we continue but have the log.
            } else {
                console.log(`- Stock decremented for ${fulfillmentData.items.length} product line(s).`);
            }



            // 8. Create the new Order document in our database
            const newOrder = new Order({
                user: userId,
                products: fulfillmentData.items.map(item => ({ product: item.productId, quantity: item.quantity })),
                isCartPurchase: fulfillmentData.isCart,
                paddleTransactionId,
                purchasePrice: details.totals.grandTotal,
                displayPrice: details.totals.total,
                currency: details.totals.currencyCode,
                accessToken: nanoid(24),
                purchasedAt: new Date(transactionData.billed_at || Date.now())
            });
            await newOrder.save();
            console.log(`- New order record created: ${newOrder._id}`);

            // 9. Update the User's record and send confirmation emails
            const user = await User.findById(userId);
            if (user) {
                user.paddleCustomerId = paddleCustomerId;
                await user.save();
                console.log(`- User ${userId}'s Paddle Customer ID updated.`);

                const populatedOrder = await Order.findById(newOrder._id).populate('user', 'name email').populate('products.product', 'name price');
                if (populatedOrder) {
                    await Promise.all([
                        sendEmail({ to: user.email, subject: `Your Fork & Fire Order Confirmation (#${newOrder._id.toString().slice(-6)})`, html: createCustomerConfirmationHtml({ recipientName: user.name.split(' ')[0], recipientEmail: user.email, order: populatedOrder }) }),
                        sendEmail({ to: process.env.ADMIN_EMAIL_ADDRESS || process.env.EMAIL_USER, subject: `🎉 New Order! (${populatedOrder.displayPrice})`, html: createAdminOrderNotificationHtml({ order: populatedOrder }) })
                    ]).then(() => console.log('- Customer and admin notification emails dispatched.'))
                        .catch(err => console.error('Webhook Warning: Failed to send one or more emails.', err));
                }
            } else {
                console.warn(`- Could not find User ${userId} to update customer ID or send email.`);
            }
        }

        // Final "OK" to Paddle to stop retries.
        res.sendStatus(200);
    } catch (err) {
        console.error("❌ WEBHOOK ERROR:", err.message);
        res.status(400).send('Webhook Error: Could not process event.');
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
