import { Hono } from "hono";
import type { Auth } from "@/auth";
import type { Env } from "@/types/env";

type Variables = { auth: Auth };

const health = new Hono<{ Bindings: Env; Variables: Variables }>();

health.get("/health", (c) => {
  // TODO: DB 接続確認を追加する
  return c.json({ status: "ok" });
});

export { health };
