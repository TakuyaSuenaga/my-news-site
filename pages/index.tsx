import fs from "fs";
import path from "path";

export default function Home({ news }: { news: string }) {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🌍 世界のテックニュース要約</h1>
      <article className="prose">
        <pre>{news}</pre>
      </article>
    </main>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "public", "news.md");
  const news = fs.readFileSync(filePath, "utf-8");
  return { props: { news } };
}
