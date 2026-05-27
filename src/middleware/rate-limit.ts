export async function rateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(now / windowSeconds);
  const kvKey = `rl:${key}:${bucket}`;

  const current = parseInt((await kv.get(kvKey)) ?? "0", 10);

  if (current >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: (bucket + 1) * windowSeconds,
    };
  }

  await kv.put(kvKey, String(current + 1), {
    expirationTtl: windowSeconds + 60,
  });

  return {
    allowed: true,
    remaining: limit - current - 1,
    resetAt: (bucket + 1) * windowSeconds,
  };
}
