import type { FC } from "hono/jsx";
import { Layout } from "./layout";

type Props = {
  error?: string | undefined;
  continue?: string | undefined;
};

export const ForgotPassword: FC<Props> = (props) => {
  const continueParam = props.continue ? `?continue=${encodeURIComponent(props.continue)}` : "";
  return (
    <Layout title="Paritto のパスワードをリセット">
      <h1 class="text-xl font-bold mb-4 text-center">Paritto のパスワードをリセット</h1>
      <p class="text-sm text-gray-600 text-center mb-6">
        登録済みのメールアドレスを入力してください。パスワード再設定のリンクを送信します。
      </p>
      {props.error && (
        <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {props.error}
        </div>
      )}
      <form method="post" action="/forgot-password">
        {props.continue && <input type="hidden" name="continue" value={props.continue} />}
        <div class="mb-6">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            name="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            autocomplete="email"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          送信
        </button>
      </form>
      <div class="mt-5 text-center text-sm text-gray-500">
        <a href={`/login${continueParam}`} class="hover:text-black transition-colors">
          ログインへ戻る
        </a>
      </div>
    </Layout>
  );
};
