import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only instantiate when both env vars are present (not during local dev without Redis).
const isConfigured =
  !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

function makeRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Limiters (created lazily so they don't throw at import time in local dev).
 *
 * admin_login  – 5 attempts per 15 minutes per IP  (brute-force guard)
 * upload       – 15 uploads per hour per IP
 * contact      – 5 submissions per hour per IP
 * api          – 120 requests per minute per IP   (general API guard)
 */
let _limiters = null;

function getLimiters() {
  if (!isConfigured) return null;
  if (_limiters) return _limiters;

  const redis = makeRedis();

  _limiters = {
    admin_login: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, '15 m'),
      prefix: 'rl:login',
      analytics: false,
    }),
    upload: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(30, '1 h'),
      prefix: 'rl:upload',
      analytics: false,
    }),
    contact: new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, '1 h'),
      prefix: 'rl:contact',
      analytics: false,
    }),
    api: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, '1 m'),
      prefix: 'rl:api',
      analytics: false,
    }),
  };

  return _limiters;
}

/**
 * Picks the appropriate rate limiter for a given pathname.
 * Returns null when rate limiting is not configured.
 */
export function getLimiterForPath(pathname) {
  const limiters = getLimiters();
  if (!limiters) return null;

  if (pathname === '/api/admin/login')     return limiters.admin_login;
  if (pathname.startsWith('/api/upload'))  return limiters.upload;
  if (pathname.startsWith('/api/contact')) return limiters.contact;
  if (pathname.startsWith('/api/'))        return limiters.api;

  return null;
}
