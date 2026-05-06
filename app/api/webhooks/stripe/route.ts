import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) break;

        await prisma.user.update({
          where: { id: userId },
          data: { plan },
        });

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const subAny = subscription as unknown as { current_period_end?: number; items?: { data: { current_period_end?: number }[] } };
          const periodEnd = subAny.current_period_end
            ? new Date(subAny.current_period_end * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: subscription.id,
              plan,
              status: subscription.status,
              currentPeriodEnd: periodEnd,
            },
            update: {
              stripeSubscriptionId: subscription.id,
              plan,
              status: subscription.status,
              currentPeriodEnd: periodEnd,
            },
          });
        }

        await prisma.site.updateMany({
          where: { userId },
          data: { plan },
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if (customer.deleted) break;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customer.id },
        });

        if (!user) break;

        const priceId = subscription.items.data[0]?.price.id;
        let plan = user.plan;

        const planMap: Record<string, string> = {
          [process.env.STRIPE_STARTER_PRICE_ID ?? ""]: "starter",
          [process.env.STRIPE_PRO_PRICE_ID ?? ""]: "pro",
          [process.env.STRIPE_ELITE_PRICE_ID ?? ""]: "elite",
        };

        if (priceId && planMap[priceId]) {
          plan = planMap[priceId];
        }

        const subAny2 = subscription as unknown as { current_period_end?: number };
        const periodEnd2 = subAny2.current_period_end
          ? new Date(subAny2.current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: subscription.status,
            plan,
            currentPeriodEnd: periodEnd2,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { plan },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if (customer.deleted) break;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customer.id },
        });

        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: { plan: "starter" },
        });

        await prisma.subscription.update({
          where: { userId: user.id },
          data: { status: "canceled", plan: "starter" },
        }).catch(() => {});

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}
