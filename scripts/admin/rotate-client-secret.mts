// Usage:
//   DATABASE_URL=<postgres_url> npx tsx scripts/admin/rotate-client-secret.ts <clientId>
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { oauthClient } from "../../src/db/schema";

type SeedEnv = { HYPERDRIVE: { connectionString: string } };

// better-auth oauth-provider と同じハッシュ方式（SHA-256 + base64url）
async function hashClientSecret(secret: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const clientId = process.argv[2];

export default async function rotateClientSecret(env: SeedEnv): Promise<void> {
  if (!clientId) {
    console.error("Usage: rotate-client-secret.ts <clientId>");
    console.error("Available clientIds: yarukoto, peaklog, tukekan");
    process.exit(1);
  }

  const pgSql = postgres(env.HYPERDRIVE.connectionString, { max: 1 });
  const db = drizzle(pgSql);

  try {
    const existing = await db
      .select({ clientId: oauthClient.clientId })
      .from(oauthClient)
      .where(eq(oauthClient.clientId, clientId));

    if (existing.length === 0) {
      console.error(`Client not found: ${clientId}`);
      process.exit(1);
    }

    const plaintext = crypto.randomUUID();
    const hashed = await hashClientSecret(plaintext);

    await db
      .update(oauthClient)
      .set({ clientSecret: hashed })
      .where(eq(oauthClient.clientId, clientId));

    console.log(`\nSecret rotated for client: ${clientId}`);
    console.log(`Set this in the app's environment:\n`);
    console.log(`PARITTO_CLIENT_ID=${clientId}`);
    console.log(`PARITTO_CLIENT_SECRET=${plaintext}`);
  } finally {
    await pgSql.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
  await rotateClientSecret({ HYPERDRIVE: { connectionString: DATABASE_URL } });
}
