import { Hono } from "hono";
import { createDb } from "@/db";
import type { Env, Variables } from "@/types/env";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", async (c, next) => {
  const { db, pool } = createDb(c.env);
  c.set("db", db);
  // レスポンス完了後にプールを閉じる
  c.executionCtx.waitUntil(next().finally(() => pool.end()));
});

// TODO: ルートをマウントする

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    // TODO: cleanup-unverified を実行する
    console.log("Scheduled job triggered", { env });
  },
};
