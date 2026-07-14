import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mockProvider";
import { MercadoPagoAdapter } from "./mercadoPagoAdapter";

let cachedProvider: PaymentProvider | null = null;

// Config-driven per payment-provider-abstraction.md "Swap providers via
// configuration, not refactor". Defaults to mock so local dev and the demo
// environment work with zero payment credentials configured.
export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;

  const configured = process.env.PAYMENT_PROVIDER ?? "mock";
  if (configured === "mercadopago") {
    cachedProvider = new MercadoPagoAdapter();
  } else {
    cachedProvider = new MockPaymentProvider();
  }
  return cachedProvider;
}

// Webhook routes need to resolve a provider by URL segment (e.g.
// /api/webhooks/payments/mercadopago) independent of PAYMENT_PROVIDER, since
// a provider can still send webhooks for payments made while it was active
// even if the store has since switched providers.
export function getPaymentProviderByName(name: string): PaymentProvider {
  if (name === "mercadopago") return new MercadoPagoAdapter();
  if (name === "mock") return new MockPaymentProvider();
  throw new Error(`Unknown payment provider: ${name}`);
}
