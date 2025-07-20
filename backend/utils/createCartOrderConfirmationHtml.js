const createCartOrderConfirmationHtml = ({ recipientName, recipientEmail, order, purchasedItems }) => {
  const formatCurrency = (currency, amount) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100);
  };

  const totalAmount = order.displayPrice;

  const itemsHtml = purchasedItems?.map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eceff1; color: #2d3436;">${item.product.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eceff1; text-align: center; color: #0984e3;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eceff1; text-align: right; color: #00b894;">${formatCurrency(item.product.currency, item.product.price * 100 * item.quantity)}</td>
    </tr>
  `).join("") || "";

  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; border: 1px solid #dfe6e9; border-radius: 10px; padding: 24px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <div style="background: linear-gradient(to right, #0984e3, #74b9ff); padding: 16px 24px; border-radius: 8px;">
        <h2 style="margin: 0; color: #ffffff;">Hi ${recipientName || "there"},</h2>
        <p style="margin: 6px 0 0; font-size: 14px; color: #dfe6e9;">Thanks for shopping with Fork & Fire!</p>
      </div>

      <p style="margin-top: 24px; font-size: 15px; color: #2d3436;">Here’s a quick summary of your order:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
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
            <td style="padding: 14px; text-align: right; font-weight: bold; border-top: 2px solid #dfe6e9; color: #00b894;">${formatCurrency(order.currency, totalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 24px; font-size: 14px; color: #636e72; line-height: 1.6;">
        <p><strong>Order ID:</strong> ${order?._id?.toString().slice(-6) || "-"}</p>
        <p><strong>Paddle Transaction ID:</strong> ${order?.paddleTransactionId || "-"}</p>
        <p><strong>Purchase Time:</strong> ${order?.purchasedAt ? new Date(order.purchasedAt).toLocaleString("en-IN") : "-"}</p>
      </div>

      <div style="margin-top: 30px; font-size: 14px; color: #2d3436;">
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Cheers,</p>
        <p><strong style="color: #0984e3;">The Fork & Fire Team</strong></p>
      </div>
    </div>
  `;
};

module.exports = createCartOrderConfirmationHtml;
