const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "ALL VIDEO DOWNLOADER PRO",
    status: "Backend is running",
    platforms: [
      "Facebook",
      "TikTok",
      "Instagram",
      "YouTube",
      "X",
      "Reddit"
    ]
  });
});

app.post("/api/check-link", (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Please provide a video URL."
    });
  }

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid URL."
    });
  }

  if (parsed.protocol !== "https:" &&
      parsed.protocol !== "http:") {
    return res.status(400).json({
      success: false,
      message: "Only HTTP and HTTPS links are accepted."
    });
  }

  const hosts = {
    "facebook.com": "Facebook",
    "fb.watch": "Facebook",
    "tiktok.com": "TikTok",
    "instagram.com": "Instagram",
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "x.com": "X",
    "twitter.com": "X",
    "reddit.com": "Reddit"
  };

  const host = parsed.hostname.toLowerCase()
    .replace(/^www\./, "");

  const platform = Object.entries(hosts).find(
    ([domain]) =>
      host === domain || host.endsWith("." + domain)
  );

  if (!platform) {
    return res.json({
      success: false,
      message: "Platform not supported."
    });
  }

  res.json({
    success: true,
    platform: platform[1],
    message: "Video link recognized. Download support must be configured separately."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
