import fs from "fs";
import fetch from "node-fetch";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

async function fetchHackerNewsTopStories(limit = 10) {
  console.log("📡 Fetching top stories from Hacker News...");
  const topIdsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  const ids = await topIdsRes.json();

  const stories = await Promise.all(
    ids.slice(0, limit).map(async (id) => {
      const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const story = await storyRes.json();
      return story;
    })
  );

  return stories.filter((s) => s && s.title && s.url);
}

async function translateWithClaude(text) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `次の英文ニュースタイトルと概要を日本語に翻訳し、短く要約してください:\n\n${text}`
        }
      ]
    })
  });

  const data = await res.json();
  if (!data.content || !data.content[0]) {
    console.error("⚠️ Claude APIの応答が無効:", data);
    return "翻訳エラー";
  }
  return data.content[0].text.trim();
}

async function generateArticle() {
  const stories = await fetchHackerNewsTopStories(10);

  let markdown = `# 🌍 Hacker News Top 10 (翻訳版)\n\n`;
  markdown += `更新日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}\n\n`;

  for (const story of stories) {
    const content = `${story.title}\n${story.url}`;
    const translation = await translateWithClaude(content);

    markdown += `## [${story.title}](${story.url})\n`;
    markdown += `📰 翻訳・要約:\n${translation}\n\n`;
  }

  fs.writeFileSync("public/news.md", markdown);
  console.log("✅ news.md generated successfully!");
}

generateArticle().catch((e) => {
  console.error("❌ Error generating article:", e);
  process.exit(1);
});
