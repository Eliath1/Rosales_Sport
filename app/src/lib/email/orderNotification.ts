import { Resend } from "resend";
import { formatMXN } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

const SALES_INBOX = "sales@rosalessport.com";

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    lineItems: { include: { productVariant: { include: { product: true } } } };
  };
}>;

function buildOrderEmailHtml(order: OrderWithDetails): string {
  const rows = order.lineItems
    .map((item) => {
      const productName = item.productVariant.product.name;
      const variantLabel = [item.productVariant.size, item.productVariant.color]
        .filter(Boolean)
        .join(" / ");
      return `<tr>
        <td style="padding:4px 8px;border-bottom:1px solid #eee">${productName} (${variantLabel})</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee">${item.quantity}</td>
        <td style="padding:4px 8px;border-bottom:1px solid #eee">${formatMXN(item.lineTotalCents)}</td>
      </tr>`;
    })
    .join("");

  return `
    <h2>Nuevo pedido - Rosales Sport</h2>
    <p><strong>Cliente:</strong> ${order.customer.name} (${order.customer.email})</p>
    <p><strong>Telefono:</strong> ${order.customer.phone ?? "No proporcionado"}</p>
    <table style="border-collapse:collapse;width:100%">
      <thead>
        <tr><th align="left">Producto</th><th align="left">Cantidad</th><th align="left">Subtotal</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p><strong>Total:</strong> ${formatMXN(order.totalCents)}</p>
    ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ""}
    <p>Estado: ${order.status}</p>
  `;
}

// Best-effort only: a missing RESEND_API_KEY or a provider outage must never
// block order creation (Priority 1 = capture the sale first). PDF/Excel
// attachments land in Priority 2 alongside real payment/commission data.
export async function sendNewOrderNotification(order: OrderWithDetails): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[orderNotification] RESEND_API_KEY not set - skipping email for order ${order.id}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "pedidos@rosalessport.com",
      to: SALES_INBOX,
      subject: `Nuevo pedido de ${order.customer.name} - ${formatMXN(order.totalCents)}`,
      html: buildOrderEmailHtml(order),
    });
  } catch (error) {
    console.error(`[orderNotification] Failed to send email for order ${order.id}`, error);
  }
}
