import { Hono } from "hono";
import type { Auth } from "../auth";
import { authorizeRateLimit, tokenRateLimit } from "../middleware/rate-limit";
import type { Env } from "../types/env";

type Variables = { auth: Auth };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get("/oauth2/authorize", authorizeRateLimit, async (c) => {
  return c.get("auth").handler(c.req.raw);
});

app.post("/oauth2/token", tokenRateLimit, async (c) => {
  return c.get("auth").handler(c.req.raw);
});

export const oauthRouter = app;
