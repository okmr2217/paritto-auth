import type { FC } from "hono/jsx";
import { Layout } from "./layout";

type Props = {
  continue?: string | undefined;
};

export const VerifyEmailDone: FC<Props> = (props) => {
  return (
    <Layout title="メールアドレスを確認しました">
      <h1 class="text-xl font-bold mb-4 text-center">メールアドレスを確認しました</h1>
      <p class="text-sm text-gray-600 text-center mb-8">メールアドレスの確認が完了しました。</p>
      {props.continue ? (
        <a
          href={props.continue}
          class="block w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
        >
          サービスに戻る
        </a>
      ) : (
        <a
          href="/login"
          class="block w-full py-2 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
        >
          ログインへ
        </a>
      )}
    </Layout>
  );
};
