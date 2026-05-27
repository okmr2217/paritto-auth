// Run: DATABASE_URL=<postgres_url> npx tsx scripts/seed/clients.mts
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

const CLIENTS = [
  {
    clientId: "yarukoto",
    redirectUris: [
      "https://yarukoto.paritto.dev/api/auth/callback/paritto",
      "http://localhost:3000/api/auth/callback/paritto",
    ],
  },
  {
    clientId: "peaklog",
    redirectUris: [
      "https://peaklog.paritto.dev/api/auth/callback/paritto",
      "http://localhost:3000/api/auth/callback/paritto",
    ],
  },
  {
    clientId: "tukekan",
    redirectUris: [
      "https://tukekan.paritto.dev/api/auth/callback/paritto",
      "http://localhost:3000/api/auth/callback/paritto",
    ],
  },
] as const;

export default async function seed(env: SeedEnv): Promise<void> {
  const pgSql = postgres(env.HYPERDRIVE.connectionString, { max: 1 });
  const db = drizzle(pgSql);

  const secrets = CLIENTS.map((c) => ({ clientId: c.clientId, plaintext: crypto.randomUUID() }));

  const rows = await Promise.all(
    CLIENTS.map(async (c, i) => ({
      id: crypto.randomUUID(),
      clientId: c.clientId,
      clientSecret: await hashClientSecret(secrets[i].plaintext),
      redirectUris: c.redirectUris as unknown as string[],
      scopes: ["openid", "profile", "email"],
      skipConsent: true,
      disabled: false,
      grantTypes: ["authorization_code"],
      responseTypes: ["code"],
      requirePKCE: true,
    }))
  );

  try {
    for (const row of rows) {
      await db
        .insert(oauthClient)
        .values(row)
        .onConflictDoUpdate({
          target: oauthClient.clientId,
          set: {
            // clientSecret は更新しない（初回挿入値を維持）
            redirectUris: row.redirectUris,
            scopes: row.scopes,
            skipConsent: row.skipConsent,
            disabled: row.disabled,
            grantTypes: row.grantTypes,
            responseTypes: row.responseTypes,
            requirePKCE: row.requirePKCE,
          },
        });
    }
  } finally {
    await pgSql.end();
  }

  console.log("=== OAuth Client Secrets (copy to each product's .env) ===\n");
  for (const s of secrets) {
    console.log(`PARITTO_CLIENT_ID=${s.clientId}`);
    console.log(`PARITTO_CLIENT_SECRET=${s.plaintext}\n`);
  }
  console.log("==========================================");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");
  await seed({ HYPERDRIVE: { connectionString: DATABASE_URL } });
}
