import type { FC } from "hono/jsx";
import { Layout } from "./layout";

type Props = {
  error?: string | undefined;
  token: string;
};

export const ResetPassword: FC<Props> = (props) => {
  return (
    <Layout title="Paritto のパスワードをリセット">
      <h1 class="text-xl font-bold mb-6 text-center">Paritto のパスワードをリセット</h1>
      {props.error && (
        <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {props.error}
        </div>
      )}
      <form method="post" action="/reset-password">
        <input type="hidden" name="token" value={props.token} />
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            新しいパスワード
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="8文字以上"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            autocomplete="new-password"
            required
          />
        </div>
        <div class="mb-6">
          <label for="passwordConfirm" class="block text-sm font-medium text-gray-700 mb-1">
            パスワード（確認）
          </label>
          <input
            id="passwordConfirm"
            type="password"
            name="passwordConfirm"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            autocomplete="new-password"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          設定する
        </button>
      </form>
    </Layout>
  );
};
