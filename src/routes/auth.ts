import { Hono } from "hono";
import type { Auth } from "../auth";
import type { Env } from "../types/env";

type Variables = { auth: Auth };

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.all("/api/auth/*", async (c) => {
  return c.get("auth").handler(c.req.raw);
});

app.all("/.well-known/*", async (c) => {
  return c.get("auth").handler(c.req.raw);
});

app.get("/jwks", async (c) => {
  return c.get("auth").handler(c.req.raw);
});

export const authRouter = app;
