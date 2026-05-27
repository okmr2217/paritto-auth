import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { Env } from "@/types/env";

export function createDb(env: Env) {
  const pool = new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
    max: 5,
  });
  const db = drizzle(pool);
  return { db, pool };
}

export type Db = ReturnType<typeof createDb>["db"];
