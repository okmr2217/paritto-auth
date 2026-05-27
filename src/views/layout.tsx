import type { FC } from "hono/jsx";

type Props = {
  title: string;
  children: unknown;
};

export const Layout: FC<Props> = ({ title, children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | Paritto Auth</title>
        {/* TODO: 本番前に CDN Tailwind をビルド済み CSS（wrangler assets 経由等）に差し替える。CSP 設定にも注意。 */}
        <script src="https://cdn.tailwindcss.com" />
      </head>
      <body class="bg-gray-50 min-h-screen flex items-center justify-center">
        <div class="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm">
          <div class="text-center mb-6 font-bold text-xl tracking-tight">Paritto</div>
          {children}
        </div>
      </body>
    </html>
  );
};
