import fs from "fs";

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
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
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

    if (!res.ok) {
      console.error("❌ Claude API error:", res.status, data);
      return "翻訳エラー (APIエラー)";
    }

    // 安全に翻訳結果を取得
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text.trim();
    } else if (data.completion) {
      return data.completion.trim();
    } else {
      console.warn("⚠️ Claude APIの応答形式が不明:", JSON.stringify(data, null, 2));
      return "翻訳エラー (応答不明)";
    }

  } catch (err) {
    console.error("❌ Claude API request failed:", err);
    return "翻訳エラー (通信失敗)";
  }
}

async function generateArticle() {
  const stories = await fetchHackerNewsTopStories(10);

  let markdown = `# 🌍 Hacker News Top 10 (翻訳版)\n\n`;
  markdown += `更新日時: ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}\n\n`;

  // 並列で翻訳
  const translations = await Promise.all(
    stories.map((story) => translateWithClaude(`${story.title}\n${story.url}`))
  );

  stories.forEach((story, i) => {
    markdown += `## [${story.title}](${story.url})\n`;
    markdown += `📰 翻訳・要約:\n${translations[i]}\n\n`;
  });

  fs.writeFileSync("public/news.md", markdown);
  console.log("✅ news.md generated successfully!");
}

generateArticle().catch((e) => {
  console.error("❌ Error generating article:", e);
  process.exit(1);
});
