import type { FC } from "hono/jsx";
import { Layout } from "./layout";

type Props = {
  email?: string | undefined;
};

export const VerifyEmailSent: FC<Props> = (props) => {
  return (
    <Layout title="Paritto のメール認証">
      <h1 class="text-xl font-bold mb-4 text-center">確認メールを送信しました</h1>
      <p class="text-sm text-gray-600 text-center mb-2">
        {props.email ? (
          <>
            <span class="font-medium">{props.email}</span> に確認メールを送信しました。
          </>
        ) : (
          "確認メールを送信しました。"
        )}
      </p>
      <p class="text-sm text-gray-600 text-center mb-6">メール内のリンクをクリックしてください。</p>
      <p class="text-xs text-gray-400 text-center mb-6">リンクの有効期限は 3 時間です。</p>
      {/* TODO: better-auth でセッションなしの再送APIが利用可能になったら実装する */}
      <div class="text-center text-sm text-gray-500">
        <a href="/verify-email/resend" class="hover:text-black transition-colors">
          確認メールを再送する
        </a>
      </div>
    </Layout>
  );
};
