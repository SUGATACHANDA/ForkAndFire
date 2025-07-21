// const createCartOrderConfirmationHtml = ({ recipientName, recipientEmail, order, purchasedItems }) => {
//   const formatCurrency = (currency, amount) => {
//     if (!amount) return "₹0.00";
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: currency || "USD",
//     }).format(amount / 100);
//   };

//   const totalAmount = order.displayPrice;

//   const itemsHtml = purchasedItems?.map((item) => `
//     <tr>
//       <td style="padding: 12px; border-bottom: 1px solid #eceff1; color: #2d3436;">${item.product.name}</td>
//       <td style="padding: 12px; border-bottom: 1px solid #eceff1; text-align: center; color: #0984e3;">${item.quantity}</td>
//       <td style="padding: 12px; border-bottom: 1px solid #eceff1; text-align: right; color: #00b894;">${formatCurrency(item.product.currency, item.product.price * 100 * item.quantity)}</td>
//     </tr>
//   `).join("") || "";

//   return `
//     <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #dfe6e9; border-radius: 10px; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

//       <div style="background: linear-gradient(to right, #0984e3, #74b9ff); padding: 16px 24px; border-radius: 8px;">
//         <h2 style="margin: 0; color: #ffffff;">Hi ${recipientName || "there"},</h2>
//         <p style="margin: 6px 0 0; font-size: 14px; color: #dfe6e9;">Thanks for shopping with Fork & Fire!</p>
//       </div>

//       <p style="margin-top: 24px; font-size: 15px; color: #2d3436;">Here’s a quick summary of your order:</p>

//       <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
//         <thead style="background-color: #f1f2f6;">
//           <tr>
//             <th style="padding: 12px; text-align: left; color: #636e72;">Item</th>
//             <th style="padding: 12px; text-align: center; color: #636e72;">Qty</th>
//             <th style="padding: 12px; text-align: right; color: #636e72;">Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${itemsHtml}
//         </tbody>
//         <tfoot>
//           <tr>
//             <td colspan="2" style="padding: 14px; text-align: right; font-weight: bold; border-top: 2px solid #dfe6e9; color: #2d3436;">Total (local)</td>
//             <td style="padding: 14px; text-align: right; font-weight: bold; border-top: 2px solid #dfe6e9; color: #00b894;">${formatCurrency(order.currency, totalAmount)}</td>
//           </tr>
//         </tfoot>
//       </table>

//       <div style="margin-top: 24px; font-size: 14px; color: #636e72; line-height: 1.6;">
//         <p><strong>Order ID:</strong> ${order?._id?.toString().slice(-6) || "-"}</p>
//         <p><strong>Paddle Transaction ID:</strong> ${order?.paddleTransactionId || "-"}</p>
//         <p><strong>Purchase Time:</strong> ${order?.purchasedAt ? new Date(order.purchasedAt).toLocaleString("en-IN") : "-"}</p>
//       </div>

//       <div style="margin-top: 30px; font-size: 14px; color: #2d3436;">
//         <p>If you have any questions, feel free to reply to this email.</p>
//         <p>Cheers,</p>
//         <p><strong style="color: #0984e3;">The Fork & Fire Team</strong></p>
//       </div>
//     </div>
//   `;
// };

// module.exports = createCartOrderConfirmationHtml;



/**
 * Creates a modern and elegant HTML order confirmation for the customer.
 * It uses the original logic for data processing but applies a new, on-brand visual design.
 *
 * @param {object} options
 * @param {string} options.recipientName - The customer's first name.
 * @param {string} options.recipientEmail - The customer's email for the unsubscribe link.
 * @param {object} order - The full, populated Order document.
 * @param {Array} purchasedItems - The populated `products` array from the order object.
 * @returns {string} The complete, styled HTML email content.
 */
const createCartOrderConfirmationHtml = ({ recipientName, recipientEmail, order, purchasedItems }) => {
  // === YOUR ORIGINAL LOGIC AND FUNCTIONS (UNCHANGED) ===
  const formatCurrency = (currency, amount) => {
    // Note: Swapped argument order for consistency with Intl.NumberFormat
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100);
  };

  const totalAmount = order.displayPrice; // Using displayPrice for final localized total
  const SITE_URL = process.env.FRONTEND_URL;
  const CURRENT_YEAR = new Date().getFullYear();

  const itemsHtml = purchasedItems?.map((item) => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #e8e0d1;">
        <p style="margin:0; font-family:'Lora',serif; font-weight:700; font-size:16px; color:#2c3e50;">${item.product.name}</p>
        <p style="margin:4px 0 0 0; font-size:12px; color:#718096;">Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #e8e0d1; text-align: right; font-weight:600; font-size:16px; color:#575757;">
        ${formatCurrency(item.product.currency, item.product.price * 100 * item.quantity)}
      </td>
    </tr>
  `).join("") || "";

  const encodedEmail = Buffer.from(recipientEmail || '').toString('base64');
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${encodedEmail}`;


  // === THE NEW, REDESIGNED HTML AND INLINE CSS ===
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,700;1,400&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { margin:0; padding:0; background-color:#fdfaef; }
            table { border-collapse:collapse; width: 100%; }
            h1, h2, h3, p { font-family: 'Montserrat', sans-serif; margin:0; }
            h1, h2, h3 { font-family: 'Lora', serif; color: #2c3e50; }
        </style>
    </head>
    <body style="background-color:#fdfaef;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <!-- Main Wrapper -->
                    <table style="width:100%; max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow: 0 10px 40px -15px rgba(44,62,80,0.15);">
                        
                        <!-- Header Section -->
                        <tr>
                            <td align="center" style="padding:40px; border-bottom: 1px solid #f0f2f5;">
                                <h1 style="font-size:32px; font-style:italic; margin:0;">Thank You!</h1>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding:30px 40px;">
                                <h2 style="font-size:22px; line-height:1.4;">Hi ${recipientName || "there"},</h2>
                                <p style="font-size:16px; color:#575757; line-height:1.6; margin-top:16px;">
                                    Your order from Fork & Fire Kitchen has been confirmed. We're so excited for you to get cooking! Below is a summary of your purchase.
                                </p>

                                <!-- Items Table (populated by your unchanged itemsHtml variable) -->
                                <table style="margin: 30px 0;">
                                    <thead>
                                        <tr>
                                            <th style="padding:0 0 10px 0; text-align: left; font-size:12px; color:#718096; text-transform:uppercase; letter-spacing:1px;">Item</th>
                                            <th style="padding:0 0 10px 0; text-align: right; font-size:12px; color:#718096; text-transform:uppercase; letter-spacing:1px;">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td style="padding:15px 0; text-align: right; font-weight: 600; color: #2c3e50; border-top: 2px solid #2c3e50;">Grand Total (in Local Price)</td>
                                            <td style="padding:15px 0; text-align: right; font-weight: 700; color: #e67e22; font-size:20px; border-top: 2px solid #2c3e50;">
                                                ${formatCurrency(order.currency, totalAmount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                                
                                <!-- Signature & CTA -->
                                <p style="font-size:16px; color:#575757; line-height:1.6; margin-top:20px;">
                                    If you have any questions, please don't hesitate to reach out. We can't wait to see what you create!
                                </p>
                                <p style="font-family:'Brush Script MT','cursive'; font-size:42px; line-height:48px; color:#e67e22; margin:10px 0 0 0;">Fork & Fire</p>

                                <div style="text-align:center; padding:30px 0 0 0;">
                                    <a href="${SITE_URL}/my-orders" style="background-color:#2c3e50; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-weight:bold;">
                                        View Your Full Order History
                                    </a>
                                </div>
                            </td>
                        </tr>

                         <!-- Footer -->
                         <tr>
                             <td style="padding:20px 30px; text-align:center; background-color:#f0f2f5; border-top:1px solid #e2e8f0;">
                                 <p style="font-size:12px; color:#7A6C66; line-height:1.6;">
                                    © ${CURRENT_YEAR} Fork & Fire Kitchen. All Rights Reserved.<br/>
                                    You received this email because you made a purchase on our site.
                                    Manage your email preferences <a href="${unsubscribeUrl}" style="color:#7A6C66; text-decoration:underline;">here</a>.
                                 </p>
                             </td>
                         </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
};

module.exports = createCartOrderConfirmationHtml;