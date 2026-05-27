import type { Context, MiddlewareHandler } from "hono";
import type { Env as WorkerEnv } from "../types/env";

declare module "hono" {
  interface ContextVariableMap {
    rateLimitExceeded: boolean;
    rateLimitSilent: boolean;
    parsedBody: Record<string, string>;
  }
}

type HonoEnv = { Bindings: WorkerEnv };

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

type RateLimitRule = {
  key: (c: Context<HonoEnv>) => Promise<string | null>;
  limit: number | ((env: WorkerEnv) => number);
  windowSeconds: number;
  isApi?: boolean;
  silent?: boolean;
};

async function getParsedBody(c: Context<HonoEnv>): Promise<Record<string, string>> {
  const cached = c.get("parsedBody");
  if (cached !== undefined) return cached;
  const formData = await c.req.raw.clone().formData();
  const body: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") {
      body[k] = v;
    }
  }
  c.set("parsedBody", body);
  return body;
}

export function createRateLimitMiddleware(rules: RateLimitRule[]): MiddlewareHandler<HonoEnv> {
  return async (c, next) => {
    for (const rule of rules) {
      const key = await rule.key(c);
      if (key === null) continue;

      const limit = typeof rule.limit === "function" ? rule.limit(c.env) : rule.limit;
      const result = await rateLimit(c.env.RATE_LIMIT, key, limit, rule.windowSeconds);

      if (!result.allowed) {
        if (rule.isApi) {
          const retryAfter = Math.max(0, result.resetAt - Math.floor(Date.now() / 1000));
          c.header("Retry-After", String(retryAfter));
          return c.json({ error: "Too Many Requests" }, 429);
        }
        if (rule.silent) {
          c.set("rateLimitSilent", true);
        } else {
          c.set("rateLimitExceeded", true);
        }
        return next();
      }
    }
    return next();
  };
}

export const loginRateLimit = createRateLimitMiddleware([
  {
    key: async (c) => `ip:login:${c.req.header("CF-Connecting-IP") ?? "unknown"}`,
    limit: (env) => parseInt(env.RATE_LIMIT_LOGIN_PER_MIN, 10),
    windowSeconds: 60,
  },
  {
    key: async (c) => {
      const body = await getParsedBody(c);
      const email = body.email;
      return email ? `email:login:${email}` : null;
    },
    limit: (env) => parseInt(env.RATE_LIMIT_LOGIN_PER_MIN, 10),
    windowSeconds: 900,
  },
]);

export const registerRateLimit = createRateLimitMiddleware([
  {
    key: async (c) => `ip:register:${c.req.header("CF-Connecting-IP") ?? "unknown"}`,
    limit: (env) => parseInt(env.RATE_LIMIT_REGISTER_PER_HOUR, 10),
    windowSeconds: 3600,
  },
  {
    key: async (c) => {
      const body = await getParsedBody(c);
      const email = body.email;
      return email ? `email:register:${email}` : null;
    },
    limit: 1,
    windowSeconds: 86400,
  },
]);

export const forgotPasswordRateLimit = createRateLimitMiddleware([
  {
    key: async (c) => `ip:forgot-password:${c.req.header("CF-Connecting-IP") ?? "unknown"}`,
    limit: (env) => parseInt(env.RATE_LIMIT_PASSWORD_RESET_PER_HOUR, 10),
    windowSeconds: 3600,
  },
  {
    key: async (c) => {
      const body = await getParsedBody(c);
      const email = body.email;
      return email ? `email:forgot-password:${email}` : null;
    },
    limit: (env) => parseInt(env.RATE_LIMIT_PASSWORD_RESET_PER_HOUR, 10),
    windowSeconds: 3600,
    silent: true,
  },
]);

export const resetPasswordRateLimit = createRateLimitMiddleware([
  {
    key: async (c) => `ip:reset-password:${c.req.header("CF-Connecting-IP") ?? "unknown"}`,
    limit: 5,
    windowSeconds: 900,
  },
]);

export const verifyEmailResendRateLimit = createRateLimitMiddleware([
  {
    key: async (c) => {
      const body = await getParsedBody(c);
      const email = body.email;
      return email ? `email:verify-resend:${email}` : null;
    },
    limit: 3,
    windowSeconds: 3600,
    silent: true,
  },
]);

export const tokenRateLimit = createRateLimitMiddleware([
  {
    key: async (c) => `ip:token:${c.req.header("CF-Connecting-IP") ?? "unknown"}`,
    limit: (env) => parseInt(env.RATE_LIMIT_TOKEN_PER_MIN, 10),
    windowSeconds: 60,
    isApi: true,
  },
  {
    key: async (c) => {
      const body = await getParsedBody(c);
      const clientId = body.client_id;
      return clientId ? `client_id:token:${clientId}` : null;
    },
    limit: 60,
    windowSeconds: 60,
    isApi: true,
  },
]);

export const authorizeRateLimit = createRateLimitMiddleware([
  {
    key: async (c) => `ip:authorize:${c.req.header("CF-Connecting-IP") ?? "unknown"}`,
    limit: 60,
    windowSeconds: 60,
    isApi: true,
  },
]);
