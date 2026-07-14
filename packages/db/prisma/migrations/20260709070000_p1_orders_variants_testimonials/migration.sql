-- AlterEnum
ALTER TYPE "DecorationType" ADD VALUE 'sublimation';

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('unisex', 'dama', 'caballero');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending_payment', 'payment_received', 'in_progress', 'preparing_shipment', 'shipped', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('pending', 'approved', 'hidden');

-- DropIndex
DROP INDEX "product_variants_product_id_size_color_key";

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'unisex';
ALTER TABLE "product_variants" ADD COLUMN "swatch_image_url" TEXT;

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending_payment',
    "subtotal_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_variant_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "line_total_cents" INTEGER NOT NULL,

    CONSTRAINT "order_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line_item_customizations" (
    "id" UUID NOT NULL,
    "line_item_id" UUID NOT NULL,
    "decoration_type" "DecorationType" NOT NULL,
    "size_breakdown" JSONB NOT NULL,
    "roster" JSONB NOT NULL,
    "logo_notes" TEXT,

    CONSTRAINT "order_line_item_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL,
    "author_name" TEXT NOT NULL,
    "team_name" TEXT,
    "quote" TEXT NOT NULL,
    "photo_url" TEXT,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'pending',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_size_color_gender_key" ON "product_variants"("product_id", "size", "color", "gender");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "order_line_item_customizations_line_item_id_key" ON "order_line_item_customizations"("line_item_id");

-- CreateIndex
CREATE INDEX "testimonials_status_sort_order_idx" ON "testimonials"("status", "sort_order");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line_item_customizations" ADD CONSTRAINT "order_line_item_customizations_line_item_id_fkey" FOREIGN KEY ("line_item_id") REFERENCES "order_line_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
