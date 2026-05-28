import type { FC } from "hono/jsx";
import { Layout } from "./layout";

type Props = {
  message?: string | undefined;
  status?: number | undefined;
};

export const ErrorView: FC<Props> = (props) => {
  return (
    <Layout title="Paritto でエラーが発生しました">
      <h1 class="text-xl font-bold mb-4 text-center">Paritto でエラーが発生しました</h1>
      <p class="text-sm text-gray-600 text-center mb-8">
        {props.message ??
          "予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。"}
      </p>
      <div class="text-center text-sm text-gray-500">
        <a href="/login" class="hover:text-black transition-colors">
          トップへ戻る
        </a>
      </div>
    </Layout>
  );
};
