import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./db/schema";
import { sendEmail } from "./lib/email";
import { resetPasswordTemplate } from "./lib/email-templates/reset-password";
import { verifyEmailTemplate } from "./lib/email-templates/verify-email";
import type { Env } from "./types/env";

export function createAuth(env: Env) {
  const sql = postgres(env.HYPERDRIVE.connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        jwks: schema.jwks,
        oauthClient: schema.oauthClient,
        oauthAccessToken: schema.oauthAccessToken,
        oauthRefreshToken: schema.oauthRefreshToken,
        oauthConsent: schema.oauthConsent,
      },
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url }) => {
        const { subject, html, text } = resetPasswordTemplate(user.name, url);
        await sendEmail(env, user.email, subject, html, text);
      },
    },

    emailVerification: {
      expiresIn: 60 * 60 * 3, // 3時間
      callbackURL: "/verify-email/done",
      sendVerificationEmail: async ({ user, url }) => {
        const { subject, html, text } = verifyEmailTemplate(user.name, url);
        await sendEmail(env, user.email, subject, html, text);
      },
    },

    user: {
      additionalFields: {
        status: {
          type: "string",
          defaultValue: "active",
          required: true,
          input: false,
        },
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: false,
      },
    },

    trustedOrigins: env.TRUSTED_ORIGINS.split(","),

    plugins: [
      jwt({
        jwt: {
          issuer: env.JWT_ISSUER,
          expirationTime: `${env.ACCESS_TOKEN_TTL_SECONDS}s`,
          definePayload: ({ user }) => ({
            sub: user.id,
            email: user.email,
            name: user.name,
          }),
        },
      }),

      oauthProvider({
        loginPage: "/login",
        consentPage: "/consent",
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
