import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
    price: 29,
    sites: 1,
    conversations: 500,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    price: 79,
    sites: 3,
    conversations: 2000,
  },
  elite: {
    name: "Elite",
    priceId: process.env.STRIPE_ELITE_PRICE_ID ?? "",
    price: 199,
    sites: -1,
    conversations: -1,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
