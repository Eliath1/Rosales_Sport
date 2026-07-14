import bcrypt from "bcryptjs";
import { prisma } from "@rs/db";
import type { CustomerType, Prisma } from "@rs/db";

export async function listCustomers(params?: { search?: string; limit?: number }) {
  const where: Prisma.CustomerWhereInput = params?.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
        ],
      }
    : {};

  return prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: params?.limit ?? 50,
  });
}

export async function createCustomer(input: {
  name: string;
  email: string;
  phone?: string;
  customerType?: CustomerType;
  notes?: string;
  marketingConsent?: boolean;
}) {
  return prisma.customer.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      customerType: input.customerType ?? "retail",
      notes: input.notes,
      marketingConsent: input.marketingConsent ?? false,
      consentAt: input.marketingConsent ? new Date() : null,
    },
  });
}

export async function findCustomerByEmail(email: string) {
  return prisma.customer.findFirst({
    where: { email: email.toLowerCase() },
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

// Priority 3 (ADR-012): registering claims an existing guest Customer row
// by email instead of creating a duplicate - a guest may already have a row
// with passwordHash = null from a prior order/quote/lead. Throws
// EMAIL_ALREADY_REGISTERED if that row already has a password set.
export async function registerOrClaimCustomer(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  marketingConsent?: boolean;
}) {
  const email = input.email.toLowerCase();
  const existing = await prisma.customer.findFirst({ where: { email } });

  if (existing?.passwordHash) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const consentAt = input.marketingConsent ? new Date() : null;

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        phone: input.phone ?? existing.phone,
        passwordHash,
        marketingConsent: input.marketingConsent ?? existing.marketingConsent,
        consentAt: input.marketingConsent ? consentAt : existing.consentAt,
      },
    });
  }

  return prisma.customer.create({
    data: {
      name: input.name,
      email,
      phone: input.phone,
      passwordHash,
      customerType: "retail",
      marketingConsent: input.marketingConsent ?? false,
      consentAt,
    },
  });
}

// Staff-only mutation (ADR-012 Journey 7 step 2) - server-checked role
// happens at the call site (admin/customers/page.tsx), not here.
export async function setCustomerDistributorFlag(id: string, isDistributor: boolean) {
  return prisma.customer.update({
    where: { id },
    data: { isDistributor },
  });
}
