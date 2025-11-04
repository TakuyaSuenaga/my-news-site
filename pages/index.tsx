import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function Home({ news }: { news: string }) {
  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: #f5f5f5;
        }
        h1 {
          color: #333;
          border-bottom: 3px solid #ff6600;
          padding-bottom: 10px;
        }
        h2 {
          color: #444;
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
        a {
          color: #0066cc;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        p {
          line-height: 1.6;
          color: #555;
        }
      `}</style>
      <ReactMarkdown>{news}</ReactMarkdown>
    </div>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "public", "news.md");
  const news = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf-8")
    : "# ニュースを取得中...\n\n初回ビルド時はニュースがまだ生成されていません。";
  return { props: { news } };
}
