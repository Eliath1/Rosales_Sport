import { prisma } from "@/lib/db";
import type { LeadSource, Prisma } from "@/generated/prisma/client";
import { createCustomer, findCustomerByEmail } from "@/lib/services/customerService";

export async function createLead(input: {
  source: LeadSource;
  payload: Prisma.InputJsonValue;
  customer?: {
    name: string;
    email: string;
    phone?: string;
    marketingConsent?: boolean;
  };
}) {
  let customerId: string | undefined;

  if (input.customer) {
    const existing = await findCustomerByEmail(input.customer.email);
    const customer =
      existing ??
      (await createCustomer({
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        marketingConsent: input.customer.marketingConsent,
        customerType: input.source === "bulk_form" ? "equipo" : "retail",
      }));
    customerId = customer.id;
  }

  return prisma.lead.create({
    data: {
      source: input.source,
      customerId,
      payload: input.payload,
    },
    include: { customer: true },
  });
}

export async function listLeads(limit = 50) {
  return prisma.lead.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
