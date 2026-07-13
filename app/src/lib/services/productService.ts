import { prisma } from "@/lib/db";

export async function listProducts(params?: { team?: string; activeOnly?: boolean }) {
  return prisma.product.findMany({
    where: {
      ...(params?.team ? { team: params.team } : {}),
      ...(params?.activeOnly !== false ? { active: true } : {}),
    },
    include: { variants: true },
    orderBy: { name: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });
}

export async function createProduct(input: {
  sku: string;
  slug: string;
  name: string;
  team?: string;
  league?: string;
  category: string;
  description?: string;
  basePriceCents: number;
  wholesalePriceCents?: number;
  variants: Array<{ size: string; color?: string; stockHint?: number }>;
}) {
  return prisma.product.create({
    data: {
      sku: input.sku,
      slug: input.slug,
      name: input.name,
      team: input.team,
      league: input.league,
      category: input.category,
      description: input.description,
      basePriceCents: input.basePriceCents,
      wholesalePriceCents: input.wholesalePriceCents,
      variants: {
        create: input.variants.map((v) => ({
          size: v.size,
          color: v.color,
          stockHint: v.stockHint,
        })),
      },
    },
    include: { variants: true },
  });
}
