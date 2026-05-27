export function verifyEmailTemplate(
  name: string,
  verificationUrl: string
): { subject: string; html: string; text: string } {
  const subject = "[Paritto] メールアドレスの確認をお願いします";

  const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:sans-serif;color:#111111;">
  <div style="max-width:560px;margin:40px auto;padding:0 24px;">
    <p style="font-size:20px;font-weight:bold;margin:0 0 32px;">Paritto</p>
    <p style="margin:0 0 16px;">${name} さん</p>
    <p style="margin:0 0 16px;">Paritto アカウントへのご登録ありがとうございます。</p>
    <p style="margin:0 0 24px;">以下のボタンをクリックして、メールアドレスの確認を完了してください。</p>
    <p style="margin:0 0 24px;">
      <a href="${verificationUrl}"
         style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;">
        メールアドレスを確認する
      </a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#555555;">このリンクは 3 時間有効です。<br>有効期限を過ぎた場合は、ログイン画面から確認メールを再送できます。</p>
    <p style="margin:24px 0 0;font-size:13px;color:#555555;">このメールに心当たりがない場合は、破棄してください。</p>
    <hr style="margin:32px 0;border:none;border-top:1px solid #eeeeee;">
    <p style="margin:0;font-size:12px;color:#888888;">Paritto Auth &nbsp;·&nbsp; <a href="https://auth.paritto.dev" style="color:#888888;">https://auth.paritto.dev</a></p>
  </div>
</body>
</html>`;

  const text = `${name} さん

Paritto アカウントへのご登録ありがとうございます。

以下のリンクをクリックして、メールアドレスの確認を完了してください。

${verificationUrl}

このリンクは 3 時間有効です。
有効期限を過ぎた場合は、ログイン画面から確認メールを再送できます。

このメールに心当たりがない場合は、破棄してください。

---
Paritto Auth
https://auth.paritto.dev
`;

  return { subject, html, text };
}
