import type { FC } from "hono/jsx";
import { Layout } from "./layout";

export const ForgotPasswordSent: FC = () => {
  return (
    <Layout title="メールを送信しました">
      <h1 class="text-xl font-bold mb-4 text-center">メールを送信しました</h1>
      <p class="text-sm text-gray-600 text-center mb-2">
        パスワード再設定のリンクをメールに送信しました。
      </p>
      <p class="text-sm text-gray-600 text-center mb-8">
        メールが届かない場合はスパムフォルダをご確認ください。
      </p>
      <div class="text-center text-sm text-gray-500">
        <a href="/login" class="hover:text-black transition-colors">
          ログインへ戻る
        </a>
      </div>
    </Layout>
  );
};
