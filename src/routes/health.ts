import { Hono } from "hono";
import type { Env, Variables } from "@/types/env";

const health = new Hono<{ Bindings: Env; Variables: Variables }>();

health.get("/health", (c) => {
  // TODO: DB 接続確認を追加する
  return c.json({ status: "ok" });
});

export { health };
