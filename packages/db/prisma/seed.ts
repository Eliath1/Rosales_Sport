import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/client";

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

// Official custom-uniform decoration price list (client, 2026-07-13). See
// docs/business/custom-uniform-price-list-2026-07.md for the canonical source.
// Kept `active: false` deliberately - these are staff-facing pricing line
// items for building quotes (visible in /admin/products, which lists
// inactive too), not browsable storefront products. Without this, they'd
// mix into the public homepage/catalog grid alongside real jerseys, since
// listProducts() has no category filter today.
const CUSTOM_DECORATION_PRODUCTS = [
  // Gorras
  { sku: "CAP-BASE", slug: "custom-gorra-logo-frente", name: "Gorra - 1 logo frente", category: "custom-gorra", description: "Gorra personalizada con 1 logo al frente.", basePriceCents: 15000 },
  { sku: "CAP-ADD-LOGO-LAT", slug: "custom-gorra-logo-lateral", name: "Gorra - Add-on: logo lateral (max 5cm)", category: "custom-gorra", description: "Adicional: logo lateral, maximo 5cm.", basePriceCents: 3000 },
  { sku: "CAP-ADD-LOGO-TRAS", slug: "custom-gorra-logo-trasero", name: "Gorra - Add-on: logo trasero (max 3cm)", category: "custom-gorra", description: "Adicional: logo trasero, maximo 3cm.", basePriceCents: 2000 },
  { sku: "CAP-ADD-PERSONAL", slug: "custom-gorra-personalizacion", name: "Gorra - Add-on: personalizacion lateral (max 10 letras)", category: "custom-gorra", description: "Adicional: personalizacion lateral, maximo 10 letras.", basePriceCents: 5000 },

  // Jerseys - Linea 1 (sublimado) y Linea 2 (bordado)
  { sku: "JER-SUBL-ADL", slug: "custom-jersey-sublimado-adl", name: "Jersey Linea 1 Sublimado - ADL", category: "custom-jersey", description: "Sublimado full color. Cuello V o cerrada, 2 botones o abierta; manga normal o ranglan (sin cargo).", basePriceCents: 40000 },
  { sku: "JER-SUBL-JR", slug: "custom-jersey-sublimado-jr", name: "Jersey Linea 1 Sublimado - JR", category: "custom-jersey", description: "Sublimado full color. Cuello V o cerrada, 2 botones o abierta; manga normal o ranglan (sin cargo).", basePriceCents: 30000 },
  { sku: "JER-BORD-SOL-ADL", slug: "custom-jersey-bordado-solido-adl", name: "Jersey Linea 2 Bordado, tela solida - ADL", category: "custom-jersey", description: "Bordado. Incluye letrero al frente, numero espalda, 1 escudo en manga y personalizacion.", basePriceCents: 50000 },
  { sku: "JER-BORD-SOL-JR", slug: "custom-jersey-bordado-solido-jr", name: "Jersey Linea 2 Bordado, tela solida - JR", category: "custom-jersey", description: "Bordado. Incluye letrero al frente, numero espalda, 1 escudo en manga y personalizacion.", basePriceCents: 40000 },
  { sku: "JER-BORD-RAY-ADL", slug: "custom-jersey-bordado-rayado-adl", name: "Jersey Linea 2 Bordado, tela rayada/full color - ADL", category: "custom-jersey", description: "Bordado. Incluye letrero al frente, numero espalda, 1 escudo en manga y personalizacion.", basePriceCents: 60000 },
  { sku: "JER-BORD-RAY-JR", slug: "custom-jersey-bordado-rayado-jr", name: "Jersey Linea 2 Bordado, tela rayada/full color - JR", category: "custom-jersey", description: "Bordado. Incluye letrero al frente, numero espalda, 1 escudo en manga y personalizacion.", basePriceCents: 50000 },
  { sku: "JER-ADD-ESCUDO-BORD", slug: "custom-jersey-escudo-bordado", name: "Jersey - Add-on: escudo 2a manga, bordado", category: "custom-jersey", description: "Escudo en 2a manga o cualquier otro lado, bordado.", basePriceCents: 4000 },
  { sku: "JER-ADD-ESCUDO-SUBL", slug: "custom-jersey-escudo-sublimado", name: "Jersey - Add-on: escudo 2a manga, sublimado", category: "custom-jersey", description: "Escudo en 2a manga o cualquier otro lado, sublimado.", basePriceCents: 2000 },
  { sku: "JER-ADD-PUB-BORD", slug: "custom-jersey-publicidad-bordada", name: "Jersey - Add-on: publicidad espalda (max 30cm), bordada", category: "custom-jersey", description: "Publicidad espalda, maximo 30cm, bordada.", basePriceCents: 8000 },
  { sku: "JER-ADD-PUB-SUBL", slug: "custom-jersey-publicidad-sublimada", name: "Jersey - Add-on: publicidad espalda (max 30cm), sublimada", category: "custom-jersey", description: "Publicidad espalda, maximo 30cm, sublimada.", basePriceCents: 4000 },
  { sku: "JER-ADD-NUM-FRENTE", slug: "custom-jersey-numeros-frente", name: "Jersey - Add-on: numeros al frente bajo el letrero", category: "custom-jersey", description: "Numeros al frente, bajo el letrero.", basePriceCents: 4000 },

  // Pantalon
  { sku: "PANT-REG-ADL", slug: "custom-pantalon-regular-adl", name: "Pantalon regular - ADL", category: "custom-pantalon", description: "Bco, Gris, Beige, Rojo, Negro, Azul Rey, Azul Marino o Gris Obscuro. Incluye presillas para cinto, 2 bolsas traseras, doble tela refuerzo rodillas.", basePriceCents: 35000 },
  { sku: "PANT-REG-JR", slug: "custom-pantalon-regular-jr", name: "Pantalon regular - JR", category: "custom-pantalon", description: "Bco, Gris, Beige, Rojo, Negro, Azul Rey, Azul Marino o Gris Obscuro. Incluye presillas para cinto, 2 bolsas traseras, doble tela refuerzo rodillas.", basePriceCents: 30000 },
  { sku: "PANT-ADD-1LIN", slug: "custom-pantalon-1-linea", name: "Pantalon - Add-on: 1 linea al costado", category: "custom-pantalon", description: "1 linea al costado.", basePriceCents: 2000 },
  { sku: "PANT-ADD-2-3LIN", slug: "custom-pantalon-2-3-lineas", name: "Pantalon - Add-on: 2 o 3 lineas al costado", category: "custom-pantalon", description: "2 o 3 lineas al costado.", basePriceCents: 4000 },
  { sku: "PANT-ADD-NUM-PIERNA", slug: "custom-pantalon-numeros-pierna", name: "Pantalon - Add-on: numeros en 1 pierna", category: "custom-pantalon", description: "Numeros en 1 pierna.", basePriceCents: 4000 },
  { sku: "PANT-ADD-LOGO-SUBL", slug: "custom-pantalon-logo-sublimado", name: "Pantalon - Add-on: logo/publicidad por pierna (max 30cm), sublimado", category: "custom-pantalon", description: "Logo o publicidad por pierna, maximo 30cm, sublimado.", basePriceCents: 4000 },
  { sku: "PANT-ADD-LOGO-BORD", slug: "custom-pantalon-logo-bordado", name: "Pantalon - Add-on: logo/publicidad por pierna (max 30cm), bordado", category: "custom-pantalon", description: "Logo o publicidad por pierna, maximo 30cm, bordado.", basePriceCents: 8000 },

  // Complementos
  { sku: "COMP-CINTO-ELAS", slug: "custom-cinto-elastico", name: "Cinto elastico con puntas de piel", category: "custom-complemento", description: "Cinto elastico con puntas de piel.", basePriceCents: 10000 },
  { sku: "COMP-CINTO-SINT", slug: "custom-cinto-sintetico", name: "Cinto sintetico o charol", category: "custom-complemento", description: "Cinto todo sintetico o charol.", basePriceCents: 20000 },
  { sku: "COMP-MEDIA-LISA", slug: "custom-medias-lisas", name: "Medias lisas", category: "custom-complemento", description: "Medias lisas.", basePriceCents: 7000 },
  { sku: "COMP-MEDIA-RAY", slug: "custom-medias-rayadas", name: "Medias rayadas (3 lineas)", category: "custom-complemento", description: "Medias rayadas, 3 lineas.", basePriceCents: 10000 },
  { sku: "COMP-PLAYERA-LIC", slug: "custom-playera-interior-licra", name: "Playera interior, mangas de licra", category: "custom-complemento", description: "Playera interior, mangas de licra.", basePriceCents: 25000 },

  // Chamarras
  { sku: "CHAM-BASE-ADL", slug: "custom-chamarra-adl", name: "Chamarra tela repelente, letrero bordado al frente - ADL", category: "custom-chamarra", description: "Tela repelente, letrero bordado al frente.", basePriceCents: 90000 },
  { sku: "CHAM-BASE-JR", slug: "custom-chamarra-jr", name: "Chamarra tela repelente, letrero bordado al frente - JR", category: "custom-chamarra", description: "Tela repelente, letrero bordado al frente.", basePriceCents: 80000 },
  { sku: "CHAM-ADD-ESCUDO", slug: "custom-chamarra-escudo-manga", name: "Chamarra - Add-on: escudo manga", category: "custom-chamarra", description: "Escudo manga.", basePriceCents: 4000 },
  { sku: "CHAM-ADD-NUM", slug: "custom-chamarra-numeros", name: "Chamarra - Add-on: numeros", category: "custom-chamarra", description: "Numeros.", basePriceCents: 4000 },
  { sku: "CHAM-ADD-PERSONAL", slug: "custom-chamarra-personalizacion-espalda", name: "Chamarra - Add-on: personalizacion en espalda", category: "custom-chamarra", description: "Personalizacion en espalda.", basePriceCents: 8000 },

  // Sudadera felpa con gorro / Hoodies
  { sku: "SUD-SUBL-ADL", slug: "custom-sudadera-sublimada-adl", name: "Sudadera sublimada full color - ADL", category: "custom-sudadera", description: "Sublimada full color.", basePriceCents: 50000 },
  { sku: "SUD-SUBL-JR", slug: "custom-sudadera-sublimada-jr", name: "Sudadera sublimada full color - JR", category: "custom-sudadera", description: "Sublimada full color.", basePriceCents: 40000 },
  { sku: "SUD-BORD-ADL", slug: "custom-sudadera-bordada-adl", name: "Sudadera felpa, tela color solido, bordada - ADL", category: "custom-sudadera", description: "Felpa tela color solido, bordada.", basePriceCents: 50000 },
  { sku: "SUD-BORD-JR", slug: "custom-sudadera-bordada-jr", name: "Sudadera felpa, tela color solido, bordada - JR", category: "custom-sudadera", description: "Felpa tela color solido, bordada.", basePriceCents: 40000 },
  { sku: "SUD-ADD-EFECTO", slug: "custom-sudadera-efectos-sublimados", name: "Sudadera - Add-on: efectos sublimados en tela", category: "custom-sudadera", description: "Efectos sublimados en tela.", basePriceCents: 10000 },
];

// Generates a fresh, random per-run password instead of a fixed, publicly-known
// default. Only meaningful the first time an account is created - upsert()
// leaves the password untouched on later re-runs, so we only print credentials
// for accounts that didn't already exist (see security-checklist.md: "No
// default admin credentials in production").
function generateStaffPassword(): string {
  return crypto.randomBytes(15).toString("base64url");
}

async function upsertStaffUser(email: string, role: "admin" | "sales") {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { user: existing, generatedPassword: null as string | null };
  }

  const generatedPassword = generateStaffPassword();
  const passwordHash = await bcrypt.hash(generatedPassword, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
  });
  return { user, generatedPassword };
}

async function main() {
  const { user: staff, generatedPassword: staffPassword } = await upsertStaffUser(
    "sales@rosalessport.com",
    "admin"
  );

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

  for (const product of CUSTOM_DECORATION_PRODUCTS) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: product.slug,
        category: product.category,
        description: product.description,
        basePriceCents: product.basePriceCents,
        active: false,
      },
      create: {
        ...product,
        active: false,
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
          createdById: staff.id,
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
  if (staffPassword) {
    console.log("");
    console.log("Generated staff credentials (shown once here only - not stored anywhere, save them now):");
    console.log(`  sales@rosalessport.com / ${staffPassword}`);
  } else {
    console.log("Staff account already existed - password unchanged, not shown.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
