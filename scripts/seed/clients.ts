// Run: wrangler exec scripts/seed/clients.ts --env production
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { oauthClient } from "../../src/db/schema";

type SeedEnv = { HYPERDRIVE: { connectionString: string } };

const CLIENTS = [
  {
    clientId: "yarukoto",
    redirectUris: ["https://yarukoto.paritto.dev/api/auth/callback"],
  },
  {
    clientId: "peaklog",
    redirectUris: ["https://peaklog.paritto.dev/api/auth/callback"],
  },
  {
    clientId: "tukekan",
    redirectUris: ["https://tukekan.paritto.dev/api/auth/callback"],
  },
] as const;

export default async function seed(env: SeedEnv): Promise<void> {
  const pgSql = postgres(env.HYPERDRIVE.connectionString, { max: 1 });
  const db = drizzle(pgSql);

  const rows = CLIENTS.map((c) => ({
    id: crypto.randomUUID(),
    clientId: c.clientId,
    clientSecret: crypto.randomUUID(),
    redirectUris: c.redirectUris as unknown as string[],
    scopes: ["openid", "profile", "email"],
    skipConsent: true,
    disabled: false,
    grantTypes: ["authorization_code"],
    responseTypes: ["code"],
    requirePKCE: true,
  }));

  try {
    for (const row of rows) {
      await db
        .insert(oauthClient)
        .values(row)
        .onConflictDoUpdate({
          target: oauthClient.clientId,
          set: {
            clientSecret: row.clientSecret,
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
  for (const row of rows) {
    console.log(`PARITTO_CLIENT_ID=${row.clientId}`);
    console.log(`PARITTO_CLIENT_SECRET=${row.clientSecret}\n`);
  }
  console.log("==========================================");
}
