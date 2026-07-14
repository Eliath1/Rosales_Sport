import { formatMXN } from "../format";

type QuoteLine = {
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  productVariant: {
    size: string;
    color: string | null;
    product: { name: string; team: string | null };
  };
};

type QuoteForPdf = {
  id: string;
  validUntil: Date;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  notes: string | null;
  customer: { name: string; email: string; phone: string | null };
  lineItems: QuoteLine[];
};

export function buildQuotePdfText(quote: QuoteForPdf): string {
  const lines = [
    "ROSALES SPORT - COTIZACION",
    "================================",
    `Folio: ${quote.id.slice(0, 8).toUpperCase()}`,
    `Cliente: ${quote.customer.name}`,
    `Email: ${quote.customer.email}`,
    quote.customer.phone ? `Telefono: ${quote.customer.phone}` : "",
    `Vigencia: ${quote.validUntil.toLocaleDateString("es-MX")}`,
    "",
    "DETALLE",
    "-------",
    ...quote.lineItems.map((item) => {
      const productName = item.productVariant.product.name;
      const team = item.productVariant.product.team;
      const size = item.productVariant.size;
      return `${productName}${team ? ` (${team})` : ""} - Talla ${size} x${item.quantity} = ${formatMXN(item.lineTotalCents)}`;
    }),
    "",
    `Subtotal: ${formatMXN(quote.subtotalCents)}`,
    quote.discountCents > 0 ? `Descuento: -${formatMXN(quote.discountCents)}` : "",
    `TOTAL: ${formatMXN(quote.totalCents)}`,
    quote.notes ? `\nNotas: ${quote.notes}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}
