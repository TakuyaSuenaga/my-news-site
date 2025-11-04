import fs from "fs";
import path from "path";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

async function checkUrlAccessible(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    console.log(`⚠️ URL not accessible: ${url}`);
    return false;
  }
}

async function fetchHackerNewsTopStories(limit = 20) {
  console.log("📡 Fetching top stories from Hacker News...");
  const topIdsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  const ids = await topIdsRes.json();

  const stories = [];
  for (const id of ids.slice(0, 50)) {
    if (stories.length >= limit) break;

    const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const story = await storyRes.json();

    if (!story || !story.title || !story.url) continue;

    // URLがアクセス可能かチェック
    const isAccessible = await checkUrlAccessible(story.url);
    if (isAccessible) {
      stories.push(story);
    }
  }

  console.log(`✅ Found ${stories.length} accessible stories`);
  return stories;
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

function updateIndex(articlesDir) {
  const files = fs.readdirSync(articlesDir)
    .filter(f => f.endsWith(".md"))
    .sort()
    .reverse();

  const indexData = {
    articles: files.map(f => ({
      date: f.replace(".md", ""),
      path: `/articles/${f}`
    }))
  };

  fs.writeFileSync(
    path.join(articlesDir, "index.json"),
    JSON.stringify(indexData, null, 2)
  );
  console.log("✅ Index updated");
}

async function generateArticle() {
  const stories = await fetchHackerNewsTopStories(20);

  const now = new Date();
  const dateStr = now.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).replace(/\//g, "-");

  const timestamp = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  let markdown = `# 🌍 Hacker News Top 20 (翻訳版)\n\n`;
  markdown += `更新日時: ${timestamp}\n\n`;

  // 並列で翻訳
  const translations = await Promise.all(
    stories.map((story) => translateWithClaude(`${story.title}\n${story.url}`))
  );

  stories.forEach((story, i) => {
    markdown += `## [${story.title}](${story.url})\n`;
    markdown += `📰 翻訳・要約:\n${translations[i]}\n\n`;
  });

  // public/articles ディレクトリに日付別に保存
  const articlesDir = path.join(process.cwd(), "public", "articles");
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  const filePath = path.join(articlesDir, `${dateStr}.md`);
  fs.writeFileSync(filePath, markdown);
  console.log(`✅ Article saved: ${dateStr}.md`);

  // インデックスファイルを更新（記事一覧用）
  updateIndex(articlesDir);
}

generateArticle().catch((e) => {
  console.error("❌ Error generating article:", e);
  process.exit(1);
});
