import { Hono } from "hono";
import { createAuth } from "../auth";
import { validateContinueUrl } from "../lib/continue";
import {
  forgotPasswordRateLimit,
  loginRateLimit,
  registerRateLimit,
  resetPasswordRateLimit,
  verifyEmailResendRateLimit,
} from "../middleware/rate-limit";
import type { Env } from "../types/env";
import { ErrorView } from "../views/error";
import { ForgotPassword } from "../views/forgot-password";
import { ForgotPasswordSent } from "../views/forgot-password-sent";
import { Login } from "../views/login";
import { Register } from "../views/register";
import { ResetPassword } from "../views/reset-password";
import { ResetPasswordDone } from "../views/reset-password-done";
import { VerifyEmailDone } from "../views/verify-email-done";
import { VerifyEmailSent } from "../views/verify-email-sent";

const app = new Hono<{ Bindings: Env }>();

function getTrustedOrigins(env: Env): string[] {
  return env.TRUSTED_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// GET /login
app.get("/login", (c) => {
  const continueUrl = validateContinueUrl(
    c.req.query("continue"),
    c.env.BETTER_AUTH_URL,
    getTrustedOrigins(c.env)
  );
  return c.html(<Login continue={continueUrl ?? undefined} />);
});

// POST /login
app.post("/login", loginRateLimit, async (c) => {
  const trustedOrigins = getTrustedOrigins(c.env);
  const body = c.get("parsedBody") ?? {};
  const continueUrl = validateContinueUrl(body.continue, c.env.BETTER_AUTH_URL, trustedOrigins);

  if (c.get("rateLimitExceeded")) {
    return c.html(
      <Login
        error="しばらく時間をおいてから再度お試しください"
        email={body.email}
        continue={continueUrl ?? undefined}
      />,
      429
    );
  }

  const auth = createAuth(c.env);
  const res = await auth.api.signInEmail({
    body: { email: body.email ?? "", password: body.password ?? "" },
    asResponse: true,
  });

  if (!res.ok) {
    const json = (await res.json()) as { code?: string };
    let errorMsg = "メールアドレスまたはパスワードが正しくありません";
    if (json.code === "EMAIL_NOT_VERIFIED") {
      errorMsg = "メール確認が完了していません。確認メールをご確認ください。";
    } else if (json.code === "USER_BANNED") {
      errorMsg = "このアカウントは現在ご利用いただけません";
    }
    return c.html(
      <Login error={errorMsg} email={body.email} continue={continueUrl ?? undefined} />
    );
  }

  for (const [key, value] of res.headers.entries()) {
    if (key === "set-cookie") {
      c.header(key, value, { append: true });
    }
  }
  return c.redirect(continueUrl ?? "/login");
});

// GET /register
app.get("/register", (c) => {
  const continueUrl = validateContinueUrl(
    c.req.query("continue"),
    c.env.BETTER_AUTH_URL,
    getTrustedOrigins(c.env)
  );
  return c.html(<Register continue={continueUrl ?? undefined} />);
});

// POST /register
app.post("/register", registerRateLimit, async (c) => {
  const trustedOrigins = getTrustedOrigins(c.env);
  const body = c.get("parsedBody") ?? {};
  const continueUrl = validateContinueUrl(body.continue, c.env.BETTER_AUTH_URL, trustedOrigins);

  if (c.get("rateLimitExceeded")) {
    return c.html(
      <Register
        error="しばらく時間をおいてから再度お試しください"
        email={body.email}
        continue={continueUrl ?? undefined}
      />,
      429
    );
  }

  const email = body.email ?? "";
  const password = body.password ?? "";

  if (password.length < 8) {
    return c.html(
      <Register
        error="パスワードは8文字以上で入力してください"
        email={email}
        continue={continueUrl ?? undefined}
      />
    );
  }

  const auth = createAuth(c.env);
  const res = await auth.api.signUpEmail({
    body: { email, password, name: email },
    asResponse: true,
  });

  if (!res.ok) {
    const json = (await res.json()) as { code?: string };
    let errorMsg = "登録に失敗しました。しばらく時間をおいてから再度お試しください。";
    if (json.code === "USER_ALREADY_EXISTS") {
      errorMsg = "このメールアドレスはすでに登録されています";
    }
    return c.html(<Register error={errorMsg} email={email} continue={continueUrl ?? undefined} />);
  }

  return c.redirect(`/verify-email/sent?email=${encodeURIComponent(email)}`);
});

// GET /verify-email/sent
app.get("/verify-email/sent", (c) => {
  const email = c.req.query("email");
  return c.html(<VerifyEmailSent email={email} />);
});

// GET /verify-email/resend
// TODO: better-auth でセッションなしの sendVerificationEmail が利用可能になったら実装する。
// 現状セッションが必要なため、新規登録からやり直す案内を表示する。
app.get("/verify-email/resend", verifyEmailResendRateLimit, (c) => {
  return c.html(
    <ErrorView message="確認メールの再送は現在サポートしていません。お手数ですが新規登録からやり直してください。" />
  );
});

// GET /verify-email/done
// better-auth の emailVerification.callbackURL がここを指す
app.get("/verify-email/done", (c) => {
  const trustedOrigins = getTrustedOrigins(c.env);
  const continueUrl = validateContinueUrl(
    c.req.query("continue"),
    c.env.BETTER_AUTH_URL,
    trustedOrigins
  );
  return c.html(<VerifyEmailDone continue={continueUrl ?? undefined} />);
});

// GET /forgot-password
app.get("/forgot-password", (c) => {
  const continueUrl = validateContinueUrl(
    c.req.query("continue"),
    c.env.BETTER_AUTH_URL,
    getTrustedOrigins(c.env)
  );
  return c.html(<ForgotPassword continue={continueUrl ?? undefined} />);
});

// POST /forgot-password
app.post("/forgot-password", forgotPasswordRateLimit, async (c) => {
  const exceeded = c.get("rateLimitExceeded");
  const silent = c.get("rateLimitSilent");

  if (exceeded || silent) {
    return c.redirect("/forgot-password/sent");
  }

  const body = c.get("parsedBody") ?? {};
  const email = body.email ?? "";
  const auth = createAuth(c.env);

  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${c.env.BETTER_AUTH_URL}/reset-password`,
      },
    });
  } catch {
    // 列挙攻撃対策: エラーでも同じページへリダイレクト
  }

  return c.redirect("/forgot-password/sent");
});

// GET /forgot-password/sent
app.get("/forgot-password/sent", (c) => {
  return c.html(<ForgotPasswordSent />);
});

// GET /reset-password
// better-auth が生成するリセットURLは /reset-password?token=xxx 形式
app.get("/reset-password", (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.redirect("/forgot-password");
  }
  return c.html(<ResetPassword token={token} />);
});

// POST /reset-password
app.post("/reset-password", resetPasswordRateLimit, async (c) => {
  const body = c.get("parsedBody") ?? {};

  if (c.get("rateLimitExceeded")) {
    return c.html(
      <ResetPassword error="しばらく時間をおいてから再度お試しください" token={body.token ?? ""} />,
      429
    );
  }

  const password = body.password ?? "";
  const passwordConfirm = body.passwordConfirm ?? "";
  const token = body.token ?? "";

  if (password !== passwordConfirm) {
    return c.html(<ResetPassword error="パスワードが一致しません" token={token} />);
  }

  const auth = createAuth(c.env);
  const res = await auth.api.resetPassword({
    body: { token, newPassword: password },
    asResponse: true,
  });

  if (!res.ok) {
    return c.html(
      <ResetPassword error="リンクの有効期限が切れています。再度お試しください。" token={token} />
    );
  }

  return c.redirect("/reset-password/done");
});

// GET /reset-password/done
app.get("/reset-password/done", (c) => {
  return c.html(<ResetPasswordDone />);
});

// POST /logout
app.post("/logout", async (c) => {
  const auth = createAuth(c.env);
  try {
    await auth.api.signOut({ headers: c.req.raw.headers });
  } catch {
    // セッションがなくてもログインページへ
  }
  return c.redirect("/login");
});

export const pagesRouter = app;
