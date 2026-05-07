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
  limit: async () => ({ success: true, limit: 999, remaining: 999, reset: 0, pending: Promise.resolve() }),
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

let _avatarGenUserRL: Ratelimit | null = null;
function getAvatarGenUserRatelimit(): typeof noopRatelimit | Ratelimit {
  if (!hasRedis) return noopRatelimit;
  if (!_avatarGenUserRL) {
    _avatarGenUserRL = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 d"),
      analytics: true,
      prefix: "meetzy:avatar:generate:user",
    });
  }
  return _avatarGenUserRL;
}

export const avatarGenerateUserRatelimit = new Proxy({} as Ratelimit, {
  get(_t, prop) {
    return (getAvatarGenUserRatelimit() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

let _avatarPreviewIpRL: Ratelimit | null = null;
function getAvatarPreviewIpRatelimit(): typeof noopRatelimit | Ratelimit {
  if (!hasRedis) return noopRatelimit;
  if (!_avatarPreviewIpRL) {
    _avatarPreviewIpRL = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "meetzy:avatar:preview:ip",
    });
  }
  return _avatarPreviewIpRL;
}

export const avatarPreviewIpRatelimit = new Proxy({} as Ratelimit, {
  get(_t, prop) {
    return (getAvatarPreviewIpRatelimit() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
