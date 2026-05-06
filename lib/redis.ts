import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.REDIS_URL ?? "",
      token: process.env.REDIS_TOKEN ?? "",
    });
  }
  return _redis;
}

let _chatRatelimit: Ratelimit | null = null;
let _scrapeRatelimit: Ratelimit | null = null;

export function getChatRatelimit(): Ratelimit {
  if (!_chatRatelimit) {
    _chatRatelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(60, "1 h"),
      analytics: true,
      prefix: "meetzy:chat",
    });
  }
  return _chatRatelimit;
}

export function getScrapeRatelimit(): Ratelimit {
  if (!_scrapeRatelimit) {
    _scrapeRatelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "meetzy:scrape",
    });
  }
  return _scrapeRatelimit;
}

// Legacy named exports using lazy getters
export const chatRatelimit = new Proxy({} as Ratelimit, {
  get(_t, prop) {
    return (getChatRatelimit() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const scrapeRatelimit = new Proxy({} as Ratelimit, {
  get(_t, prop) {
    return (getScrapeRatelimit() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
