// NextAuth replaced by Clerk — this route is kept for backwards compatibility
// but does nothing. Auth is handled by Clerk via root proxy.ts (Next.js 16 convention).
export async function GET() {
  return new Response("Auth handled by Clerk", { status: 200 });
}
export async function POST() {
  return new Response("Auth handled by Clerk", { status: 200 });
}
