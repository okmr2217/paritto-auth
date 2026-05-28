import type { FC } from "hono/jsx";
import { Layout } from "./layout";

type Props = {
  error?: string | undefined;
  email?: string | undefined;
  continue?: string | undefined;
};

export const Login: FC<Props> = (props) => {
  const continueParam = props.continue ? `?continue=${encodeURIComponent(props.continue)}` : "";
  return (
    <Layout title="Paritto でログイン">
      <h1 class="text-xl font-bold mb-6 text-center">Paritto でログイン</h1>
      {props.error && (
        <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {props.error}
        </div>
      )}
      <form method="post" action="/login">
        {props.continue && <input type="hidden" name="continue" value={props.continue} />}
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={props.email ?? ""}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            autocomplete="email"
            required
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            name="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            autocomplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Paritto でログイン
        </button>
      </form>
      <div class="mt-5 text-center space-y-2 text-sm text-gray-500">
        <div>
          <a href={`/forgot-password${continueParam}`} class="hover:text-black transition-colors">
            パスワードを忘れた方
          </a>
        </div>
        <div>
          <a href={`/register${continueParam}`} class="hover:text-black transition-colors">
            アカウントを作成
          </a>
        </div>
      </div>
    </Layout>
  );
};
