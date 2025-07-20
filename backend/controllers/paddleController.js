const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
// === THE FIX IS HERE: Import the axios instance, not the SDK client ===
const { paddleApi } = require("../utils/paddleClient.js");
const { paddleSdk } = require("../utils/paddleSdkClient.js");
const Cart = require('../models/cartModel');

const mongoose = require("mongoose");
const { Order } = require("../models/orderModel.js");
const { CartOrder } = require("../models/orderModel");
const sendEmail = require("../utils/sendMail.js");
const createOrderConfirmationHtml = require("../utils/orderConfirmationTemplate.js");
const createCartOrderConfirmationHtml = require("../utils/createCartOrderConfirmationHtml.js");
const createAdminOrderNotificationHtml = require('../utils/adminOrderNotificationTemplate.js');
const createCartAdminNotificationHtml = require("../utils/createCartAdminNotificationHtml.js");

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
 * @desc    Creates a Paddle Transaction for multiple products in cart
 * @route   POST /api/paddle/cart-checkout
 * @access  Private
 */
const cartCheckoutForMultipleProducts = asyncHandler(async (req, res) => {
    const { cartItems } = req.body;
    const user = req.user;

    if (!cartItems || cartItems.length === 0) {
        res.status(400);
        throw new Error("Cart is empty.");
    }

    const payload = {
        items: cartItems.map((item) => ({
            price_id: item.paddlePriceId,
            quantity: parseInt(item.quantity, 10) || 1,
        })),
        customer: {
            email: user.email,
        },
        custom_data: {
            userId: user._id.toString(),
            cart: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                paddlePriceId: item.paddlePriceId,
            })),
        },
        // custom_checkout: {
        //     enable: true,
        //     redirect_url: `${process.env.FRONTEND_URL}/purchase-success`, // ✅ Set this to your real frontend page
        // },
    };

    console.log("Sending to Paddle /transactions:", JSON.stringify(payload, null, 2));

    try {
        const response = await paddleApi.post("/transactions", payload);
        const checkoutUrl = response.data?.data?.checkout_url;

        if (!checkoutUrl) {
            console.error("❌ Paddle did not return a checkout_url:", response.data);
            throw new Error("Could not retrieve checkout URL.");
        }

        res.status(200).json({ checkoutUrl });
    } catch (err) {
        console.error("❌ Paddle cart transaction error:", err.response?.data || err.message);
        res.status(500).json({
            message:
                err.response?.data?.error?.detail ||
                "Could not initiate cart checkout.",
        });
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

//             // === CRITICAL DEBUGGING LOG ===
//             // Let's see the exact structure of the transaction data from Paddle
//             console.log("--- PADDLE TRANSACTION.COMPLETED DATA ---");
//             console.log(JSON.stringify(transactionData, null, 2));
//             console.log("-----------------------------------------");

//             if (
//                 !customData?.userId ||
//                 !customData?.productId ||
//                 !customData?.quantity ||
//                 !transactionData.customerId
//             ) {
//                 return res
//                     .status(200)
//                     .send("Acknowledged but cannot process without custom data.");
//             }

//             const { userId, productId, quantity } = customData;
//             const {
//                 id: paddleTransactionId,
//                 customer_id: paddleCustomerId,
//                 details,
//             } = transactionData;

//             const existingOrder = await Order.findOne({ paddleTransactionId });
//             if (existingOrder) {
//                 return res
//                     .status(200)
//                     .send("Acknowledged: Transaction already processed.");
//             }

//             // --- FULFILLMENT LOGIC ---

//             // A. Decrement stock
//             const [updatedProduct, user] = await Promise.all([
//                 // Decrement stock
//                 Product.findOneAndUpdate(
//                     { _id: productId, amountLeft: { $gte: quantity } },
//                     { $inc: { amountLeft: -quantity } }
//                 ),
//                 // Find the user who made the purchase
//                 User.findById(userId),
//             ]);
//             if (!updatedProduct) {
//                 console.error(
//                     `Webhook CRITICAL: Stock update failed for product ${productId}. REFUND MAY BE REQUIRED.`
//                 );
//                 return res.status(200).send("Acknowledged, stock conflict detected.");
//             }

//             if (!user) {
//                 console.error(
//                     `Webhook CRITICAL: User ${userId} not found. Cannot send email or update customer ID.`
//                 );
//                 // We might still create the order but can't email
//             }

//             // B. Create a new Order document

//             // === THE DEFINITIVE FIX IS HERE ===
//             // The total amount is at `details.totals.grand_total`.
//             // But let's use optional chaining (`?.`) for maximum safety.
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

//             const newOrder = new Order({
//                 user: userId,
//                 product: productId,
//                 paddleTransactionId: transactionData.id,
//                 quantity,
//                 purchasePrice: purchasePriceInCents,
//                 currency: currencyCode,
//                 displayPrice: liveDisplayPrice,
//                 purchasedAt: new Date(transactionData.billedAt || Date.now()),
//             });
//             await newOrder.save();
//             console.log(`- New order record created: ${newOrder._id}`);

//             // C. Update the User with their Paddle Customer ID
//             if (user && user.email) {
//                 // Repopulate the new order with product details for the email template
//                 const fullOrderDetails = await Order.findById(newOrder._id)
//                     .populate('user', 'name email')
//                     .populate('product', 'name price');

//                 // If this critical data is missing, we can't send any emails.
//                 if (!fullOrderDetails?.user?.email) {
//                     throw new Error(`User data or email not found for order ${newOrder._id}`);
//                 }

//                 // Explicitly create the HTML content
//                 const customerEmailHtml = createOrderConfirmationHtml({
//                     recipientName: user.name.split(" ")[0] || "there",
//                     recipientEmail: user.email, // <-- Pass the now guaranteed-to-exist email
//                     order: fullOrderDetails,
//                 });

//                 // Send the email
//                 await sendEmail({
//                     to: user.email,
//                     subject: `Your Fork & Fire Order Confirmation (#${newOrder._id
//                         .toString()
//                         .slice(-6)})`,
//                     html: customerEmailHtml,
//                 }).catch((customerEmailError) => {
//                     // Catch email errors but don't fail the webhook
//                     console.error(
//                         "Webhook Fulfillment Warning: Failed to send confirmation email.",
//                         customerEmailError
//                     );
//                 });

//                 const adminEmail = process.env.ADMIN_EMAIL_ADDRESS;

//                 const adminEmailHtml = createAdminOrderNotificationHtml({
//                     order: fullOrderDetails,
//                 });
//                 await sendEmail({
//                     to: adminEmail,
//                     subject: `🎉 New Order! - ${fullOrderDetails.product.name} (x${fullOrderDetails.quantity})`,
//                     html: adminEmailHtml,
//                 }).catch((adminEmailError) => {
//                     // Catch email errors but don't fail the webhook
//                     console.error(
//                         "Webhook Fulfillment Warning: Failed to send confirmation email.",
//                         adminEmailError
//                     );
//                 });

//             } else {
//                 console.warn(
//                     `- Could not send confirmation email because user or user email was not found for userId: ${userId}`
//                 );
//             }

//             // 7. Update Paddle Customer ID on the user record if the user was found.
//             if (user) {
//                 user.paddleCustomerId = transactionData.customerId;
//                 await user.save();
//                 console.log(`- User ${userId} paddleCustomerId updated.`);
//             }
//         }

//         // Final "OK" to Paddle
//         res.sendStatus(200);
//     } catch (err) {
//         console.error("❌ WEBHOOK ERROR:", err.message);
//         res.status(400).send("Webhook Error: Could not process event.");
//     }
// });

// const handleCartCheckoutWebhook = asyncHandler(async (req, res) => {
//     const signature = req.headers["paddle-signature"];
//     const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
//     const rawRequestBody = req.body;

//     if (!signature || !webhookSecret || !Buffer.isBuffer(rawRequestBody)) {
//         return res
//             .status(400)
//             .send("Webhook validation failed: missing signature or buffer.");
//     }

//     try {
//         const event = await paddleSdk.webhooks.unmarshal(
//             rawRequestBody,
//             webhookSecret,
//             signature
//         );

//         if (event.eventType !== "transaction.completed") {
//             return res.sendStatus(200);
//         }

//         const transaction = event.data;
//         const customData = transaction.customData;

//         console.log("✅ Verified transaction:", transaction.id);

//         if (
//             !customData?.userId ||
//             !Array.isArray(customData?.cart) ||
//             !transaction.customerId
//         ) {
//             return res.status(200).send("Missing custom data.");
//         }

//         const { userId, cart } = customData;

//         const existingOrder = await Order.findOne({ paddleTransactionId: transaction.id });
//         if (existingOrder) return res.status(200).send("Already processed.");

//         const user = await User.findById(userId);
//         if (!user) return res.status(404).send("User not found.");

//         const totals = transaction.details?.totals;
//         const totalAmount = totals?.grandTotal;
//         const displayPrice = totals?.total;
//         const currency = totals?.currencyCode;

//         const orderProducts = [];

//         for (const item of cart) {
//             const product = await Product.findOneAndUpdate(
//                 { _id: item.productId, amountLeft: { $gte: item.quantity } },
//                 { $inc: { amountLeft: -item.quantity } },
//                 { new: true }
//             );

//             if (product) {
//                 orderProducts.push({
//                     product: product._id,
//                     quantity: item.quantity,
//                     price: product.price,
//                 });

//                 // Mark as purchased
//                 if (!user.purchasedProducts.includes(product._id)) {
//                     user.purchasedProducts.push(product._id);
//                 }
//             }
//         }

//         if (orderProducts.length === 0) {
//             return res.status(400).send("No valid products in cart.");
//         }

//         // Save order
//         const newOrder = new Order({
//             user: userId,
//             paddleTransactionId: transaction.id,
//             products: orderProducts,
//             totalAmount,
//             displayPrice,
//             currency,
//             purchasedAt: new Date(transaction.billedAt || Date.now()),
//             status: "completed",
//         });

//         await newOrder.save();
//         await user.save();

//         console.log("✅ Order saved:", newOrder._id);

//         // Send email to user
//         const fullOrder = await Order.findById(newOrder._id).populate("products.product", "name price");

//         const customerHtml = createOrderConfirmationHtml({
//             recipientName: user.name.split(" ")[0] || "there",
//             recipientEmail: user.email,
//             orders: [fullOrder],
//         });

//         await sendEmail({
//             to: user.email,
//             subject: `✅ Order Confirmation (#${transaction.id.slice(-6)})`,
//             html: customerHtml,
//         });

//         const adminHtml = createAdminOrderNotificationHtml({ orders: [fullOrder] });

//         await sendEmail({
//             to: process.env.ADMIN_EMAIL_ADDRESS,
//             subject: `🛒 New Cart Order (${fullOrder.products.length} items)`,
//             html: adminHtml,
//         });

//         return res.sendStatus(200);
//     } catch (err) {
//         console.error("❌ Webhook failed:", err);
//         return res.status(400).send("Webhook error");
//     }
// });


const handlePaddleWebhook = asyncHandler(async (req, res) => {
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

        if (event.eventType === "transaction.completed") {
            const transactionData = event.data;
            const customData = transactionData.customData;

            console.log("--- PADDLE TRANSACTION.COMPLETED DATA ---");
            console.log(JSON.stringify(transactionData, null, 2));
            console.log("-----------------------------------------");

            const {
                id: paddleTransactionId,
                customer_id: paddleCustomerId,
                details,
                billedAt
            } = transactionData;

            const totals = details?.totals;
            const liveDisplayPrice = totals?.total;
            const purchasePriceInCents = totals?.grandTotal;
            const currencyCode = totals?.currencyCode;

            if (!liveDisplayPrice || !purchasePriceInCents || !currencyCode) {
                console.error(`Missing pricing details for transaction ${paddleTransactionId}`);
                return res.status(200).send("Acknowledged, but cannot process without pricing.");
            }

            // ✅ CART ORDER HANDLING
            if (Array.isArray(customData?.cart)) {
                const userId = customData.userId;

                const existingCartOrder = await CartOrder.findOne({ paddleTransactionId });
                if (existingCartOrder) {
                    return res.status(200).send("Acknowledged: Cart transaction already processed.");
                }

                const user = await User.findById(userId);
                if (!user) {
                    console.error(`User ${userId} not found`);
                    return res.status(200).send("Acknowledged, but user not found.");
                }

                const purchasedItems = [];

                for (const item of customData.cart) {
                    const product = await Product.findById(item.productId);
                    if (!product || product.amountLeft < item.quantity) {
                        console.error(`Stock error or product not found: ${item.productId}`);
                        continue;
                    }

                    // Update stock
                    product.amountLeft -= item.quantity;
                    await product.save();

                    // Track purchased items
                    purchasedItems.push({
                        product: product._id,
                        quantity: item.quantity
                    });

                    // Add to user's purchased products
                    if (!user.purchasedProducts.includes(product._id.toString())) {
                        user.purchasedProducts.push(product._id.toString());
                    }
                }

                if (user) {
                    user.paddleCustomerId = transactionData.customer_id;
                    await user.save();
                    console.log(`- User ${userId} paddleCustomerId updated.`);
                }

                const newCartOrder = new CartOrder({
                    user: userId,
                    items: purchasedItems,
                    paddleTransactionId,
                    currency: currencyCode,
                    displayPrice: liveDisplayPrice,
                    purchasePrice: purchasePriceInCents / 100,
                    status: 'completed',
                    purchasedAt: new Date(billedAt || Date.now())
                });



                await newCartOrder.save();

                const fullOrderDetails = await CartOrder.findById(newCartOrder._id)
                    .populate("user", "name email")
                    .populate("items.product", "name price");

                if (!fullOrderDetails || !fullOrderDetails.items) {
                    console.error("❌ WEBHOOK ERROR: fullOrderDetails or products missing");
                    return res.status(500).json({ message: "Order details not found" });
                }


                await Cart.deleteMany({ user: user._id });


                // Send Email (if needed)
                const cartEmailHtml = createCartOrderConfirmationHtml({
                    recipientName: user.name.split(" ")[0] || "there",
                    recipientEmail: user.email,
                    order: newCartOrder,
                    purchasedItems: fullOrderDetails.items
                });
                const cartAdminEmailHtml = createCartAdminNotificationHtml({
                    recipientName: user.name.split(" ")[0] || "there",
                    recipientEmail: user.email,
                    order: newCartOrder,
                    purchasedItems: fullOrderDetails.items
                });

                console.log("👉 Sending customer order email to:", user.email);
                await sendEmail({
                    to: user.email,
                    subject: `Your Fork & Fire Order Confirmation (#${newCartOrder._id.toString().slice(-6)})`,
                    html: cartEmailHtml,

                });

                console.log("👉 Sending admin order email to:", process.env.ADMIN_EMAIL_ADDRESS);
                await sendEmail({
                    to: process.env.ADMIN_EMAIL_ADDRESS,
                    subject: `🛒 New Cart Order: ${purchasedItems.length} items`,
                    html: cartAdminEmailHtml
                });

                console.log(`✅ Transaction ${paddleTransactionId} processed successfully for user ${user.email}`);
                return res.status(200).send("Transaction processed and cart cleared.");

            }

            // ✅ SINGLE PRODUCT LOGIC (unchanged)
            if (
                !customData?.userId ||
                !customData?.productId ||
                !customData?.quantity ||
                !transactionData.customerId
            ) {
                return res
                    .status(200)
                    .send("Acknowledged but cannot process without custom data.");
            }

            const { userId, productId, quantity } = customData;

            const existingOrder = await Order.findOne({ paddleTransactionId });
            if (existingOrder) {
                return res
                    .status(200)
                    .send("Acknowledged: Transaction already processed.");
            }

            const [updatedProduct, user] = await Promise.all([
                Product.findOneAndUpdate(
                    { _id: productId, amountLeft: { $gte: quantity } },
                    { $inc: { amountLeft: -quantity } }
                ),
                User.findById(userId),
            ]);

            if (!updatedProduct) {
                console.error(`Stock update failed for ${productId}`);
                return res.status(200).send("Acknowledged, stock conflict.");
            }

            if (!user) {
                console.error(`User ${userId} not found`);
            }

            const newOrder = new Order({
                user: userId,
                product: productId,
                paddleTransactionId,
                quantity,
                purchasePrice: purchasePriceInCents,
                currency: currencyCode,
                displayPrice: liveDisplayPrice,
                purchasedAt: new Date(billedAt || Date.now()),
            });
            await newOrder.save();
            console.log(`- New order record created: ${newOrder._id}`);

            // Send email (user)
            if (user?.email) {
                const fullOrderDetails = await Order.findById(newOrder._id)
                    .populate('user', 'name email')
                    .populate('product', 'name price');

                const customerEmailHtml = createOrderConfirmationHtml({
                    recipientName: user.name.split(" ")[0] || "there",
                    recipientEmail: user.email,
                    order: fullOrderDetails,
                });

                await sendEmail({
                    to: user.email,
                    subject: `Your Fork & Fire Order Confirmation (#${newOrder._id.toString().slice(-6)})`,
                    html: customerEmailHtml,
                });

                const adminEmailHtml = createAdminOrderNotificationHtml({
                    order: fullOrderDetails,
                });

                await sendEmail({
                    to: process.env.ADMIN_EMAIL_ADDRESS,
                    subject: `🎉 New Order! - ${fullOrderDetails.product.name} (x${fullOrderDetails.quantity})`,
                    html: adminEmailHtml,
                });
            }

            user.paddleCustomerId = transactionData.customerId;
            await user.save();
            console.log(`- User ${userId} paddleCustomerId updated.`);
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("❌ WEBHOOK ERROR:", err);
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
    cartCheckoutForMultipleProducts,
    // handleCartCheckoutWebhook
};
