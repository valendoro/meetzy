import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/auth/signin",
  "/auth/verify",
  "/api/chat",
  "/api/scrape",
  "/api/webhooks/stripe",
  "/widget.js",
];

const PUBLIC_PREFIXES = ["/api/sites/", "/_next/", "/favicon"];

export default auth(function proxy(req: NextRequest & { auth: unknown }) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.match(/^\/api\/sites\/[^/]+\/config$/);

  if (isPublic) return NextResponse.next();

  const session = (req as { auth: { user?: { id: string } } | null }).auth;

  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
