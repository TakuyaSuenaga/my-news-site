import fs from "fs";
import Markdown from "react-markdown";

export default function Article({ params }: { params: { slug: string } }) {
  const content = fs.readFileSync(`content/${params.slug}.md`, "utf-8");
  return (
    <main className="p-8">
      <Markdown>{content}</Markdown>
    </main>
  );
}
