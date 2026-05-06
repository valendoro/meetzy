import { Redis } from "@upstash/redis";

const hasRedis = !!(process.env.REDIS_URL && process.env.REDIS_TOKEN);

let _redis: Redis | null = null;
function redis(): Redis {
  if (!_redis) {
    _redis = new Redis({ url: process.env.REDIS_URL!, token: process.env.REDIS_TOKEN! });
  }
  return _redis;
}

export const TTL_TOP_QUESTIONS_SEC = 3600;

export async function getCachedJson<T>(key: string): Promise<T | null> {
  if (!hasRedis) return null;
  try {
    const raw = await redis().get<string>(key);
    if (typeof raw !== "string") return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSec: number): Promise<void> {
  if (!hasRedis) return;
  try {
    await redis().set(key, JSON.stringify(value), { ex: ttlSec });
  } catch {
    /* ignore */
  }
}

export function topQuestionsCacheKey(siteInternalId: string): string {
  return `meetzy:tq:${siteInternalId}`;
}
