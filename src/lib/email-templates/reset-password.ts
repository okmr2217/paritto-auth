export function resetPasswordTemplate(
  name: string,
  resetUrl: string
): { subject: string; html: string; text: string } {
  const subject = "[Paritto] パスワードの再設定";

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:sans-serif;color:#111111;">
  <div style="max-width:560px;margin:40px auto;padding:0 24px;">
    <p style="font-size:20px;font-weight:bold;margin:0 0 32px;">Paritto</p>
    <p style="margin:0 0 16px;">${name} さん</p>
    <p style="margin:0 0 16px;">Paritto アカウントのパスワード再設定リクエストを受け付けました。</p>
    <p style="margin:0 0 24px;">以下のボタンから、新しいパスワードを設定してください。</p>
    <p style="margin:0 0 24px;">
      <a href="${resetUrl}"
         style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;">
        パスワードを再設定する
      </a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#555555;">このリンクは 1 時間有効です。</p>
    <p style="margin:16px 0 0;font-size:13px;color:#555555;">このリクエストに心当たりがない場合は、このメールを破棄してください。<br>パスワードは変更されません。</p>
    <hr style="margin:32px 0;border:none;border-top:1px solid #eeeeee;">
    <p style="margin:0;font-size:12px;color:#888888;">Paritto Auth &nbsp;·&nbsp; <a href="https://auth.paritto.dev" style="color:#888888;">https://auth.paritto.dev</a></p>
  </div>
</body>
</html>`;

  const text = `${name} さん

Paritto アカウントのパスワード再設定リクエストを受け付けました。

以下のリンクから、新しいパスワードを設定してください。

${resetUrl}

このリンクは 1 時間有効です。

このリクエストに心当たりがない場合は、このメールを破棄してください。
パスワードは変更されません。

---
Paritto Auth
https://auth.paritto.dev
`;

  return { subject, html, text };
}
