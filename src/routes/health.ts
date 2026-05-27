import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "@/db";
import type { Env } from "@/types/env";

const health = new Hono<{ Bindings: Env }>();

health.get("/health", async (c) => {
  const { db, sql: pgSql } = createDb(c.env);
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({ status: "ok", db: "ok" });
  } catch (err) {
    return c.json(
      {
        status: "error",
        db: "error",
        message: err instanceof Error ? err.message : String(err),
      },
      503
    );
  } finally {
    await pgSql.end();
  }
});

export { health };
