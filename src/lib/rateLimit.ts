/**
 * Best-effort, per-IP fixed-window rate limit for the public demo.
 *
 * Counts live in this server instance's memory, so a visitor whose requests
 * land on different instances gets a little more than the limit. That's fine
 * for its job here, which is stopping one person from hammering the model in a
 * loop. The hard ceiling on spend is the AI Gateway budget, not this.
 */
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;
const MAX_TRACKED_IPS = 5000;

const hits = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** Returns the seconds until the window resets if over the limit, else null. */
export function checkRateLimit(ip: string): number | null {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || entry.resetAt <= now) {
    if (hits.size >= MAX_TRACKED_IPS) hits.clear();
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  if (entry.count >= MAX_REQUESTS) {
    return Math.ceil((entry.resetAt - now) / 1000);
  }
  entry.count += 1;
  return null;
}
