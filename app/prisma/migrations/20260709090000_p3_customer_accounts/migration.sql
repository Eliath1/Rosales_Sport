-- AlterTable
ALTER TABLE "customers" ADD COLUMN "password_hash" TEXT;
ALTER TABLE "customers" ADD COLUMN "email_verified_at" TIMESTAMPTZ(6);
ALTER TABLE "customers" ADD COLUMN "is_distributor" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "saved_payment_methods" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_customer_ref" TEXT NOT NULL,
    "provider_payment_method_id" TEXT NOT NULL,
    "brand" TEXT,
    "last4" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_payment_methods_customer_id_idx" ON "saved_payment_methods"("customer_id");

-- AddForeignKey
ALTER TABLE "saved_payment_methods" ADD CONSTRAINT "saved_payment_methods_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
