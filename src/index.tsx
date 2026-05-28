import { Hono } from "hono";
import type { Auth } from "./auth";
import { createAuth } from "./auth";
import { health } from "./routes/health";
import { authRouter } from "./routes/auth";
import { oauthRouter } from "./routes/oauth";
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

app.route("/", authRouter);
app.route("/", oauthRouter);

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
