import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  customerType: z.enum(["retail", "wholesale", "equipo"]).default("retail"),
  notes: z.string().optional(),
  marketingConsent: z.boolean().default(false),
});

export const createProductSchema = z.object({
  sku: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  team: z.string().optional(),
  league: z.string().optional(),
  category: z.string().min(1),
  description: z.string().optional(),
  basePriceCents: z.number().int().positive(),
  wholesalePriceCents: z.number().int().positive().optional(),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        color: z.string().optional(),
        stockHint: z.number().int().optional(),
      }),
    )
    .min(1),
});

export const quoteLineItemSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});

export const createQuoteSchema = z.object({
  customerId: z.string().uuid(),
  validUntil: z.string().date(),
  discountCents: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  lineItems: z.array(quoteLineItemSchema).min(1),
});

export const quoteFormLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  productSlug: z.string().optional(),
  size: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  message: z.string().optional(),
  marketingConsent: z.boolean().default(false),
});

export const bulkFormLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  teamName: z.string().min(2),
  quantity: z.number().int().positive(),
  sizes: z.string().optional(),
  message: z.string().optional(),
  marketingConsent: z.boolean().default(false),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Priority 3 (ADR-012): customer-facing auth, fully separate from staff
// loginSchema above - no shared validation, no shared role table.
export const customerRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  marketingConsent: z.boolean().default(false),
});

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateCustomerDistributorSchema = z.object({
  isDistributor: z.boolean(),
});

export const orderLineItemSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});

// Public endpoint (guest checkout, ADR-012): no auth required, no
// customerId - the customer is matched or created by email server-side.
// Note: unitPriceCents is NOT taken here - orderService looks up the
// authoritative price from the product record so a guest request body can
// never set its own price.
export const checkoutOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    marketingConsent: z.boolean().default(false),
  }),
  notes: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        productVariantId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending_payment",
    "payment_received",
    "in_progress",
    "preparing_shipment",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const createTestimonialSchema = z.object({
  authorName: z.string().min(2),
  teamName: z.string().optional(),
  quote: z.string().min(10),
  photoUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateTestimonialStatusSchema = z.object({
  status: z.enum(["pending", "approved", "hidden"]),
});
