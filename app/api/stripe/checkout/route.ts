import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { plan } = (await req.json()) as { plan: string };
    if (!PLANS[plan as PlanKey]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    let customerId = dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: dbUser.email, name: dbUser.name ?? undefined, metadata: { userId: dbUser.id } });
      customerId = customer.id;
      const { prisma } = await import("@/lib/prisma");
      await prisma.user.update({ where: { id: dbUser.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PLANS[plan as PlanKey]!.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { userId: dbUser.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}
