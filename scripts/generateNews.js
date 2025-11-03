import fetch from "node-fetch";
import fs from "fs";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const REDDIT_URL = "https://www.reddit.com/r/worldnews/hot.json?limit=3";

async function fetchRedditComments() {
  const res = await fetch(REDDIT_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AI-NewsBot/1.0; +https://github.com/takuyasuenaga)"
    }
  });

  const text = await res.text();
  if (text.startsWith("<") || text.includes("<html")) {
    console.error("❌ Reddit APIがHTMLを返しました。Bot制限の可能性があります。");
    return [];
  }

  const json = JSON.parse(text);
  const posts = json.data.children.map(p => ({
    title: p.data.title,
    url: `https://www.reddit.com${p.data.permalink}`,
  }));

  return posts;
}
async function generateArticle() {
  const posts = await fetchRedditComments();
  const prompt = `
あなたは国際ニュース編集者です。
次の記事タイトルに関するReddit上のコメントを、自然な日本語で翻訳し、
代表的な意見を3つ抽出してMarkdown記事を作成してください。
見出し、要約、コメント引用を含めてください。

記事タイトル:
${posts.map(p => `- ${p.title} (${p.url})`).join("\n")}
`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": CLAUDE_API_KEY,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3.5-sonnet",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const markdown = data.content[0].text;

  const date = new Date().toISOString().split("T")[0];
  const filename = `content/${date}.md`;
  fs.writeFileSync(filename, markdown);
  console.log(`✅ Generated article: ${filename}`);
}

generateArticle();
