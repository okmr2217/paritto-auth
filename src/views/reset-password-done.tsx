import type { FC } from "hono/jsx";
import { Layout } from "./layout";

export const ResetPasswordDone: FC = () => {
  return (
    <Layout title="Paritto のパスワードを変更しました">
      <h1 class="text-xl font-bold mb-4 text-center">Paritto のパスワードを変更しました</h1>
      <p class="text-sm text-gray-600 text-center mb-8">新しいパスワードでログインしてください。</p>
      <a
        href="/login"
        class="block w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
      >
        ログインへ戻る
      </a>
    </Layout>
  );
};
