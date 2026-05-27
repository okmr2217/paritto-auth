import type { Env } from "@/types/env";

export async function cleanupUnverified(_env: Env): Promise<void> {
  // TODO: emailVerified=false かつ createdAt が UNVERIFIED_ACCOUNT_RETENTION_DAYS 以上前のユーザーを削除する
  console.log("cleanupUnverified triggered");
}
