import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const hasRedis = !!(process.env.REDIS_URL && process.env.REDIS_TOKEN);

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({ url: process.env.REDIS_URL!, token: process.env.REDIS_TOKEN! });
  }
  return _redis;
}

// No-op ratelimit for when Redis is not configured
const noopRatelimit = {
  limit: async (_id: string) => ({ success: true, limit: 999, remaining: 999, reset: 0, pending: Promise.resolve() }),
};

let _chatRL: Ratelimit | null = null;
function getChatRatelimit(): typeof noopRatelimit | Ratelimit {
  if (!hasRedis) return noopRatelimit;
  if (!_chatRL) {
    _chatRL = new Ratelimit({ redis: getRedis(), limiter: Ratelimit.slidingWindow(60, "1 h"), analytics: true, prefix: "meetzy:chat" });
  }
  return _chatRL;
}

let _scrapeRL: Ratelimit | null = null;
function getScrapeRatelimit(): typeof noopRatelimit | Ratelimit {
  if (!hasRedis) return noopRatelimit;
  if (!_scrapeRL) {
    _scrapeRL = new Ratelimit({ redis: getRedis(), limiter: Ratelimit.slidingWindow(10, "1 h"), analytics: true, prefix: "meetzy:scrape" });
  }
  return _scrapeRL;
}

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
