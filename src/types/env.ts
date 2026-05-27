import type { Db } from "@/db";

export type Env = {
  // Hyperdrive
  HYPERDRIVE: Hyperdrive;

  // KV
  RATE_LIMIT: KVNamespace;

  // Vars
  BETTER_AUTH_URL: string;
  NODE_ENV: string;
  TRUSTED_ORIGINS: string;
  UNVERIFIED_ACCOUNT_RETENTION_DAYS: string;
  JWT_ISSUER: string;
  ACCESS_TOKEN_TTL_SECONDS: string;
  REFRESH_TOKEN_TTL_SECONDS: string;
  RATE_LIMIT_LOGIN_PER_MIN: string;
  RATE_LIMIT_REGISTER_PER_HOUR: string;
  RATE_LIMIT_PASSWORD_RESET_PER_HOUR: string;
  RATE_LIMIT_TOKEN_PER_MIN: string;

  // Secrets
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
};

export type Variables = {
  db: Db;
};
