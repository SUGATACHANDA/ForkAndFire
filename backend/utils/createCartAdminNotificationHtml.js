const createCartAdminOrderNotificationHtml = ({ order, purchasedItems }) => {
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100);
  };

  const totalAmount = order.displayPrice;
  const ADMIN_DASHBOARD_URL = `${process.env.FRONTEND_URL}/admin/orders`;

  const itemsHtml = purchasedItems.map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; color: #2d3436;">${item.product.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center; color: #0984e3;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #d63031;">
        ${formatCurrency(item.product.price * 100 * item.quantity, item.product.currency)}
      </td>
    </tr>
  `).join("");

  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 650px; margin: auto; border: 1px solid #dcdde1; border-radius: 8px; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
      
      <div style="background: linear-gradient(to right, #d63031, #ff7675); padding: 16px 24px; border-radius: 8px;">
        <h2 style="margin: 0; color: #ffffff;">🛒 New Order Received</h2>
      </div>

      <div style="margin-top: 20px; font-size: 14px; color: #2d3436;">
        <p><strong>Customer Name:</strong> ${order.user?.name || "Unknown User"}</p>
        <p><strong>Customer Email:</strong> ${order.user?.email || "N/A"}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead style="background-color: #f1f2f6;">
          <tr>
            <th style="padding: 12px; text-align: left; color: #636e72;">Item</th>
            <th style="padding: 12px; text-align: center; color: #636e72;">Qty</th>
            <th style="padding: 12px; text-align: right; color: #636e72;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 14px; text-align: right; font-weight: bold; border-top: 2px solid #dfe6e9; color: #2d3436;">Total (local)</td>
            <td style="padding: 14px; text-align: right; font-weight: bold; border-top: 2px solid #dfe6e9; color: #d63031;">
              ${formatCurrency(totalAmount, order.currency)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 24px; font-size: 14px; color: #636e72; line-height: 1.6;">
        <p><strong>Order ID:</strong> ${order._id?.toString().slice(-6)}</p>
        <p><strong>Paddle Txn ID:</strong> ${order.paddleTransactionId || "-"}</p>
        <p><strong>Time:</strong> ${new Date(order.purchasedAt).toLocaleString("en-IN")}</p>
      </div>

      <div style="margin-top: 30px;">
        <a href="${ADMIN_DASHBOARD_URL}" style="display: inline-block; padding: 10px 18px; background-color: #0984e3; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">Open Orders →</a>
      </div>
    </div>
  `;
};

module.exports = createCartAdminOrderNotificationHtml;
