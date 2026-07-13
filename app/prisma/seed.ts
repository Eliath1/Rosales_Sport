import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/db";

const prisma = createPrismaClient();

const SIZES = ["S", "M", "L", "XL", "XXL"];

const PRODUCTS = [
  {
    sku: "JER-DIA-BOR",
    slug: "jersey-diablos-borgona",
    name: "Jersey Diablos Rojos Borgoña",
    team: "Diablos Rojos",
    league: "LMB",
    category: "jersey",
    description: "Jersey oficial replica Diablos Rojos del Mexico, color borgoña.",
    basePriceCents: 129900,
    wholesalePriceCents: 99900,
  },
  {
    sku: "JER-MEX-EST",
    slug: "jersey-mexico-estrellas",
    name: "Jersey Mexico Estrellas",
    team: "Seleccion Mexico",
    league: "WBC",
    category: "jersey",
    description: "Jersey Mexico edicion estrellas, ideal para fanaticos y equipos.",
    basePriceCents: 149900,
    wholesalePriceCents: 114900,
  },
  {
    sku: "JER-SUL-NAV",
    slug: "jersey-sultanes-navy",
    name: "Jersey Sultanes Navy",
    team: "Sultanes de Monterrey",
    league: "LMB",
    category: "jersey",
    description: "Jersey replica Sultanes de Monterrey color navy.",
    basePriceCents: 129900,
    wholesalePriceCents: 99900,
  },
  {
    sku: "JER-MEX-EMB",
    slug: "jersey-mexico-emblem",
    name: "Jersey Mexico Emblem",
    team: "Seleccion Mexico",
    league: "WBC",
    category: "jersey",
    description: "Jersey Mexico con escudo emblematico.",
    basePriceCents: 139900,
    wholesalePriceCents: 109900,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("changeme123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@rosalessport.mx" },
    update: {},
    create: {
      email: "admin@rosalessport.mx",
      passwordHash,
      role: "admin",
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: "ventas@rosalessport.mx" },
    update: {},
    create: {
      email: "ventas@rosalessport.mx",
      passwordHash,
      role: "sales",
    },
  });

  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: product.slug,
        team: product.team,
        league: product.league,
        category: product.category,
        description: product.description,
        basePriceCents: product.basePriceCents,
        wholesalePriceCents: product.wholesalePriceCents,
        active: true,
      },
      create: {
        ...product,
        variants: {
          create: SIZES.map((size) => ({ size, color: "Default" })),
        },
      },
    });
  }

  const customer = await prisma.customer.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Juan Perez",
      email: "juan.perez@example.com",
      phone: "+52 81 1234 5678",
      customerType: "retail",
      marketingConsent: true,
      consentAt: new Date(),
    },
  });

  const diablos = await prisma.product.findUnique({
    where: { slug: "jersey-diablos-borgona" },
    include: { variants: true },
  });

  if (diablos && diablos.variants[0]) {
    const variant = diablos.variants.find((v) => v.size === "M") ?? diablos.variants[0];
    const existingQuote = await prisma.quote.findFirst({
      where: { customerId: customer.id, status: "draft" },
    });

    if (!existingQuote) {
      await prisma.quote.create({
        data: {
          customerId: customer.id,
          status: "draft",
          validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          subtotalCents: diablos.basePriceCents * 2,
          discountCents: 0,
          totalCents: diablos.basePriceCents * 2,
          createdById: sales.id,
          lineItems: {
            create: [
              {
                productVariantId: variant.id,
                quantity: 2,
                unitPriceCents: diablos.basePriceCents,
                lineTotalCents: diablos.basePriceCents * 2,
              },
            ],
          },
        },
      });
    }
  }

  const sultanes = await prisma.product.findUnique({
    where: { slug: "jersey-sultanes-navy" },
    include: { variants: true },
  });

  if (sultanes && sultanes.variants[0]) {
    const variant = sultanes.variants.find((v) => v.size === "L") ?? sultanes.variants[0];
    const existingOrder = await prisma.order.findFirst({
      where: { customerId: customer.id },
    });

    if (!existingOrder) {
      await prisma.order.create({
        data: {
          customerId: customer.id,
          status: "pending_payment",
          subtotalCents: sultanes.basePriceCents * 6,
          totalCents: sultanes.basePriceCents * 6,
          notes: "Pedido de ejemplo (seed) - equipo local, 6 piezas talla L.",
          lineItems: {
            create: [
              {
                productVariantId: variant.id,
                quantity: 6,
                unitPriceCents: sultanes.basePriceCents,
                lineTotalCents: sultanes.basePriceCents * 6,
              },
            ],
          },
        },
      });
    }
  }

  const TESTIMONIALS = [
    {
      authorName: "Carlos Ramirez",
      teamName: "Aguilas de Reynosa",
      quote: "Los jerseys llegaron a tiempo para el torneo y la calidad de la sublimacion supero lo que esperabamos.",
      status: "approved" as const,
      sortOrder: 1,
    },
    {
      authorName: "Lorena Gutierrez",
      teamName: "Liga Infantil Monterrey",
      quote: "El equipo de Rosales Sport nos ayudo a elegir tallas para todo el roster sin complicaciones.",
      status: "approved" as const,
      sortOrder: 2,
    },
    {
      authorName: "Miguel Torres",
      teamName: "Diablos Rojos Fan Club",
      quote: "Pedimos playeras personalizadas para el club y el proceso de cotizacion fue muy claro.",
      status: "pending" as const,
      sortOrder: 3,
    },
  ];

  for (const testimonial of TESTIMONIALS) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: testimonial.authorName },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
    }
  }

  console.log("Seed complete.");
  console.log("Staff login: admin@rosalessport.mx / changeme123");
  console.log("Staff login: ventas@rosalessport.mx / changeme123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
