import { and, eq, lt } from "drizzle-orm";
import { createDb } from "@/db";
import { user } from "@/db/schema";
import type { Env } from "@/types/env";

export async function cleanupUnverified(env: Env): Promise<void> {
  const { db, sql } = createDb(env);
  try {
    const days = parseInt(env.UNVERIFIED_ACCOUNT_RETENTION_DAYS, 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const deleted = await db
      .delete(user)
      .where(and(eq(user.emailVerified, false), lt(user.createdAt, cutoff)))
      .returning({ id: user.id });
    console.log(`[cleanup-unverified] deleted ${deleted.length} users`);
  } catch (err) {
    console.error("[cleanup-unverified] error:", err);
  } finally {
    await sql.end();
  }
}
