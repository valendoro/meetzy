import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let customerId = dbUser.stripeCustomerId;

    if (!customerId) {
      // Create a customer first if they don't have one (edge case)
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name ?? undefined,
        metadata: { userId: dbUser.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/account`,
    });

    return NextResponse.redirect(session.url, { status: 303 });
  } catch (e) {
    console.error("POST /api/stripe/portal", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
