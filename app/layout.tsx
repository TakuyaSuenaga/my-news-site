import "./globals.css";

export const metadata = {
  title: "Hacker News 日本語要約",
  description: "Hacker Newsのトップ記事を日本語で要約",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: system-ui, -apple-system, sans-serif;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
