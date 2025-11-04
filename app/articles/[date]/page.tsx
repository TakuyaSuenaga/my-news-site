import fs from "fs";
import path from "path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    date: string;
  };
}

async function getArticleContent(date: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), "public", "articles", `${date}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.readFileSync(filePath, "utf-8");
}

async function getAllArticleDates(): Promise<string[]> {
  const articlesDir = path.join(process.cwd(), "public", "articles");

  if (!fs.existsSync(articlesDir)) {
    return [];
  }

  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));
}

export async function generateStaticParams() {
  const dates = await getAllArticleDates();
  return dates.map((date) => ({ date }));
}

export default async function ArticlePage({ params }: PageProps) {
  const content = await getArticleContent(params.date);

  if (!content) {
    notFound();
  }

  return (
    <main style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#0066cc",
          textDecoration: "none",
        }}
      >
        ← 記事一覧に戻る
      </Link>

      <article
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
        className="article-content"
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </main>
  );
}
