// const createCartAdminOrderNotificationHtml = ({ order, purchasedItems }) => {
//   const formatCurrency = (amount, currency) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: currency || "USD",
//     }).format(amount / 100);
//   };

//   const totalAmount = order.displayPrice;
//   const ADMIN_DASHBOARD_URL = `${process.env.FRONTEND_URL}/admin/orders`;

//   const itemsHtml = purchasedItems.map((item) => `
//     <tr>
//       <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #2d3436;">${item.product.name}</td>
//       <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center; color: #0984e3;">${item.quantity}</td>
//       <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #d63031;">
//         ${formatCurrency(item.product.price * 100 * item.quantity, item.product.currency)}
//       </td>
//     </tr>
//   `).join("");

//   return `
//     <div style="font-family: 'Segoe UI', sans-serif; max-width: 650px; margin: auto; border: 1px solid #dcdde1; border-radius: 8px; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">

//       <div style="background: linear-gradient(to right, #d63031, #ff7675); padding: 16px 24px; border-radius: 8px;">
//         <h2 style="margin: 0; color: #ffffff;">🛒 New Order Received</h2>
//       </div>

//       <div style="margin-top: 20px; font-size: 14px; color: #2d3436;">
//         <p><strong>Customer Name:</strong> ${order.user?.name || "Unknown User"}</p>
//         <p><strong>Customer Email:</strong> ${order.user?.email || "N/A"}</p>
//       </div>

//       <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
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
//             <td style="padding: 14px; text-align: right; font-weight: bold; border-top: 2px solid #dfe6e9; color: #d63031;">
//               ${formatCurrency(totalAmount, order.currency)}
//             </td>
//           </tr>
//         </tfoot>
//       </table>

//       <div style="margin-top: 24px; font-size: 14px; color: #636e72; line-height: 1.6;">
//         <p><strong>Order ID:</strong> ${order._id?.toString().slice(-6)}</p>
//         <p><strong>Paddle Txn ID:</strong> ${order.paddleTransactionId || "-"}</p>
//         <p><strong>Time:</strong> ${new Date(order.purchasedAt).toLocaleString("en-IN")}</p>
//       </div>

//       <div style="margin-top: 30px;">
//         <a href="${ADMIN_DASHBOARD_URL}" style="display: inline-block; padding: 10px 18px; background-color: #0984e3; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">Open Orders →</a>
//       </div>
//     </div>
//   `;
// };

// module.exports = createCartAdminOrderNotificationHtml;


/**
 * Creates a modern, elegant, and on-brand HTML email to notify an admin of a new order.
 * It's designed to be clean, scannable, and actionable.
 * This template handles both single-item and multi-item cart orders.
 *
 * @param {object} options
 * @param {object} order - The full, populated Mongoose Order document.
 * @returns {string} The complete HTML email content for the admin.
 */
const createAdminOrderNotificationHtml = ({ order, purchasedItems }) => {
  // --- Configuration and Helpers ---
  const adminOrdersUrl = `${process.env.FRONTEND_URL}/admin/orders`;
  const orderDate = new Date(order.purchasedAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100);
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { margin:0; padding:0; background-color:#f7fafc; }
            table { border-collapse:collapse; }
            h1, h2, h3, p, a, span, th, td { font-family: 'Montserrat', sans-serif; }
            h1, h2, h3 { font-family: 'Lora', serif; font-weight: 700; color: #2c3e50; }
        </style>
    </head>
    <body style="background-color:#f7fafc;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <!-- Main Email Wrapper -->
                    <table style="width:100%; max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow: 0 10px 40px -15px rgba(0,0,0,0.1);">
                        
                        <!-- Header Section -->
                        <tr>
                            <td align="center" style="padding: 30px; border-bottom: 1px solid #e2e8f0;">
                                <h1 style="font-size:20px; letter-spacing:1px; text-transform:uppercase; color: #e67e22; margin:0;">New Order Notification</h1>
                                <p style="font-size:14px; color:#718096; margin-top:8px;">A purchase was successfully completed at Fork & Fire Kitchen.</p>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 30px 40px;">
                                
                                <!-- Customer Info Card -->
                                <table width="100%" style="background-color:#fafafa; border-radius:8px; margin-bottom: 30px;">
                                    <tr>
                                        <td style="padding:20px;">
                                            <h3 style="font-size:16px; margin:0 0 12px 0;">Customer Details</h3>
                                            <p style="font-size:14px; color:#575757; line-height:1.6;">
                                                <strong>Name:</strong> ${order.user.name || 'N/A'}<br>
                                                <strong>Email:</strong> <a href="mailto:${order.user.email}" style="color:#e67e22; text-decoration:underline;">${order.user.email}</a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Items Purchased Section -->
                                <h3 style="font-size:16px; margin:0 0 15px 0;">Items Purchased</h3>
                                <table width="100%" style="border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <thead>
                                        <tr style="background-color:#f7fafc; text-align:left;">
                                            <th style="padding:10px 15px; font-size:12px; text-transform:uppercase; color:#718096;">Product</th>
                                            <th style="padding:10px 15px; font-size:12px; text-transform:uppercase; color:#718096; text-align:center;">Qty</th>
                                            <th style="padding:10px 15px; font-size:12px; text-transform:uppercase; color:#718096; text-align:right;">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${purchasedItems.map(item => `
                                        <tr>
                                            <td style="padding:12px 15px; border-top:1px solid #e2e8f0; color:#2c3e50; font-weight:600;">${item.product.name}</td>
                                            <td style="padding:12px 15px; border-top:1px solid #e2e8f0; text-align:center; color:#575757;">${item.quantity}</td>
                                            <td style="padding:12px 15px; border-top:1px solid #e2e8f0; text-align:right; font-weight:600; color:#2c3e50;"> ${formatCurrency(item.product.price * 100 * item.quantity, item.product.currency)}</td>
                                        </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                         <tr style="background-color:#f7fafc;">
                                            <td colspan="2" style="padding:14px 15px; text-align:right; font-weight:bold; color:#2c3e50;">Grand Total</td>
                                            <td style="padding:14px 15px; text-align:right; font-weight:bold; color:#e67e22; font-size: 18px;">${formatCurrency(order.displayPrice, order.currency)}</td>
                                         </tr>
                                    </tfoot>
                                </table>

                                <!-- Call to Action Button -->
                                <table width="100%" style="margin-top: 40px;">
                                    <tr>
                                        <td align="center">
                                             <a href="${adminOrdersUrl}" style="background:#2c3e50;text-decoration:none;padding:12px 30px;color:#ffffff;border-radius:5px;display:inline-block;font-weight:bold;">
                                                View Order in Dashboard
                                             </a>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>
                        
                        <!-- Footer / Transaction Details -->
                        <tr>
                            <td style="padding:20px; text-align:center; font-size:12px; color:#99a2ad; background-color:#f7fafc; border-top:1px solid #e2e8f0;">
                                <p style="margin:0;"><strong>Order Date:</strong> ${orderDate}</p>
                                <p style="margin:5px 0 0 0;"><strong>Paddle Transaction ID:</strong> ${order.paddleTransactionId}</p>
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

module.exports = createAdminOrderNotificationHtml;