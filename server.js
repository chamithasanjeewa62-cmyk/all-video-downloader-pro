const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = [
    "https://chamithasanjeewa62-cmyk.github.io",
    "https://all-video-downloader-pro.vercel.app"
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Supported platforms
const platforms = {
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

// Identify platform from hostname
function identifyPlatform(host) {
  for (const [domain, name] of Object.entries(platforms)) {
    if (host === domain || host.endsWith("." + domain)) {
      return name;
    }
  }

  return null;
}

// Backend status
app.get("/", (req, res) => {
  res.json({
    name: "ALL VIDEO DOWNLOADER PRO",
    status: "Backend is running",
    features: [
      "Link validation",
      "Platform detection",
      "Direct video link detection",
      "Quality selection input",
      "CORS enabled"
    ]
  });
});

// Check video link
app.post("/api/check-link", (req, res) => {
  const { url, quality = "720p" } = req.body || {};

  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a video URL."
    });
  }

  let parsed;

  try {
    parsed = new URL(url.trim());
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid URL."
    });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({
      success: false,
      message: "Only HTTP and HTTPS links are accepted."
    });
  }

  const host = parsed.hostname
    .toLowerCase()
    .replace(/^www\./, "");

  const platform = identifyPlatform(host);

  const allowedQualities = [
    "360p",
    "480p",
    "720p",
    "1080p",
    "4K"
  ];

  if (!allowedQualities.includes(quality)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported quality selection."
    });
  }

  // Detect direct video file links
  const directVideo = /\.(mp4|webm|ogv|mov)$/i.test(
    parsed.pathname
  );

  if (directVideo) {
    return res.json({
      success: true,
      type: "direct-video",
      platform: platform || "Direct video source",
      selectedQuality: quality,
      message:
        "Direct video link detected. Playback and downloading depend on source access."
    });
  }

  // Reject unsupported platforms
  if (!platform) {
    return res.status(400).json({
      success: false,
      message: "This website is not supported."
    });
  }

  // Recognized platform
  return res.json({
    success: true,
    type: "page-link",
    platform,
    selectedQuality: quality,
    message:
      "Link recognized. A compatible, authorized video service is required to retrieve video formats and download URLs."
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
