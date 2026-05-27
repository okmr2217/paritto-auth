import { Hono } from "hono";
import type { Auth } from "./auth";
import { createAuth } from "./auth";
import { authorizeRateLimit, tokenRateLimit } from "./middleware/rate-limit";
import { health } from "./routes/health";
import { pagesRouter } from "./routes/pages";
import type { Env } from "./types/env";
import { ErrorView } from "./views/error";

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

app.get("/oauth2/authorize", authorizeRateLimit, async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

app.post("/oauth2/token", tokenRateLimit, async (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

app.route("/", health);

app.route("/", pagesRouter);

app.onError((err, c) => {
  const accept = c.req.header("Accept") ?? "";
  if (accept.includes("text/html")) {
    return c.html(<ErrorView message={err.message} />, 500);
  }
  return c.json({ error: "Internal Server Error" }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const { cleanupUnverified } = await import("./jobs/cleanup-unverified");
    ctx.waitUntil(cleanupUnverified(env));
  },
};
