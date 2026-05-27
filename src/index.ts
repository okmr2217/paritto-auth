import { Hono } from "hono";
import type { Auth } from "./auth";
import { createAuth } from "./auth";
import type { Env } from "./types/env";

type Variables = {
  auth: Auth;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", async (c, next) => {
  const auth = createAuth(c.env);
  c.set("auth", auth);
  await next();
});

app.all("/api/auth/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

app.all("/.well-known/*", async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

app.get("/health", async (c) => {
  // TODO: DB 疎通確認を追加する
  return c.json({ status: "ok" });
});

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const { cleanupUnverified } = await import("./jobs/cleanup-unverified");
    ctx.waitUntil(cleanupUnverified(env));
  },
};
