import fs from "fs";
import Link from "next/link";

export default function Home() {
  const files = fs.readdirSync("content").reverse();
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">🌍 世界の反応まとめ</h1>
      <ul>
        {files.map((f) => (
          <li key={f}>
            <Link href={`/${f.replace(".md", "")}`}>
              {f.replace(".md", "")}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
