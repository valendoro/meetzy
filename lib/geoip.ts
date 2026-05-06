type GeoResult = { country?: string; city?: string };

let geoipModule: { lookup: (ip: string) => { country?: string; city?: string } | null } | null = null;

function loadGeoip(): { lookup: (ip: string) => { country?: string; city?: string } | null } {
  if (geoipModule !== null) return geoipModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    geoipModule = require("geoip-lite") as { lookup: (ip: string) => { country?: string; city?: string } | null };
  } catch {
    geoipModule = { lookup: () => null };
  }
  return geoipModule!;
}

/** Best-effort geo from IPv4/IPv6; never throws. */
export function lookupGeo(ip: string | null | undefined): GeoResult | null {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return null;
  try {
    const mod = loadGeoip();
    const r = mod.lookup(ip);
    if (!r) return null;
    return { country: r.country, city: r.city };
  } catch {
    return null;
  }
}

export function clientIpFromRequest(headers: Headers): string | null {
  const xf = headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}
