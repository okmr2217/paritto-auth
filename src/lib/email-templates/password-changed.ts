export function passwordChangedTemplate(
  name: string,
  changedAtJst: string,
  resetUrl: string
): { subject: string; html: string; text: string } {
  const subject = "[Paritto] パスワードが変更されました";

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:sans-serif;color:#111111;">
  <div style="max-width:560px;margin:40px auto;padding:0 24px;">
    <p style="font-size:20px;font-weight:bold;margin:0 0 32px;">Paritto</p>
    <p style="margin:0 0 16px;">${name} さん</p>
    <p style="margin:0 0 16px;">Paritto アカウントのパスワードが変更されました。</p>
    <p style="margin:0 0 24px;font-size:14px;">変更日時: <strong>${changedAtJst} (JST)</strong></p>
    <p style="margin:0 0 8px;">心当たりがない場合は、すぐにパスワードを再設定してください。</p>
    <p style="margin:0 0 24px;">
      <a href="${resetUrl}"
         style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;">
        パスワードを再設定する
      </a>
    </p>
    <hr style="margin:32px 0;border:none;border-top:1px solid #eeeeee;">
    <p style="margin:0;font-size:12px;color:#888888;">Paritto Auth &nbsp;·&nbsp; <a href="https://auth.paritto.dev" style="color:#888888;">https://auth.paritto.dev</a></p>
  </div>
</body>
</html>`;

  const text = `${name} さん

Paritto アカウントのパスワードが変更されました。

変更日時: ${changedAtJst} (JST)

心当たりがない場合は、すぐにパスワードを再設定してください。
${resetUrl}

---
Paritto Auth
https://auth.paritto.dev
`;

  return { subject, html, text };
}
