const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const MAX_ENTRIES = 5_000;

const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory limiter, enough for a demo on one instance. On serverless every
 * instance has its own map, so production needs a shared store such as
 * Upstash Redis or Vercel KV, plus a daily spending cap at the model provider.
 */
export function isRateLimited(key: string): boolean {
  const now = Date.now();

  if (hits.size > MAX_ENTRIES) {
    for (const [k, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(k);
    }
  }

  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}
