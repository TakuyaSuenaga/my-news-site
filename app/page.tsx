import fs from "fs";
import path from "path";
import Link from "next/link";

interface Article {
  date: string;
  path: string;
}

async function getArticles(): Promise<Article[]> {
  const articlesDir = path.join(process.cwd(), "public", "articles");
  const indexPath = path.join(articlesDir, "index.json");

  if (!fs.existsSync(indexPath)) {
    return [];
  }

  const indexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  return indexData.articles || [];
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <main style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{
        color: "#333",
        borderBottom: "3px solid #ff6600",
        paddingBottom: "10px"
      }}>
        🌍 Hacker News 日本語要約
      </h1>

      <p style={{ color: "#666", marginTop: "20px" }}>
        Hacker Newsのトップ記事を毎日自動で日本語に翻訳・要約しています。
      </p>

      {articles.length === 0 ? (
        <div style={{
          padding: "40px",
          textAlign: "center",
          background: "white",
          borderRadius: "8px",
          marginTop: "30px"
        }}>
          <p style={{ color: "#999" }}>記事はまだありません</p>
        </div>
      ) : (
        <div style={{ marginTop: "30px" }}>
          {articles.map((article) => (
            <Link
              key={article.date}
              href={`/articles/${article.date}`}
              style={{
                display: "block",
                padding: "20px",
                marginBottom: "15px",
                background: "white",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#333",
                border: "1px solid #e0e0e0",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#ff6600"
              }}>
                📅 {article.date}
              </div>
              <div style={{
                fontSize: "14px",
                color: "#666",
                marginTop: "5px"
              }}>
                Hacker News Top 20
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
