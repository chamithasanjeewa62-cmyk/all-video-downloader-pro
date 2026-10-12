const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));

// CORS configuration
const allowedOrigins = [
  "https://chamithasanjeewa62-cmyk.github.io",
  "https://all-video-downloader-pro.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

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

// Identify platform
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
      "Quality selection",
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
      message: "Please enter a video URL."
    });
  }

  let parsed;

  try {
    parsed = new URL(url.trim());
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid URL. Please check the link."
    });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return res.status(400).json({
      success: false,
      message: "Only HTTP and HTTPS links are supported."
    });
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

  // Block local and private network hostnames
  const blockedHosts = [
    "localhost",
    "127.0.0.1",
    "::1"
  ];

  if (
    blockedHosts.includes(host) ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return res.status(400).json({
      success: false,
      message: "This hostname is not allowed."
    });
  }

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
      message: "Please select a supported video quality."
    });
  }

  // Direct video file detection
  const directVideo = /\.(mp4|webm|ogv|mov|m4v)$/i.test(
    parsed.pathname
  );

  if (directVideo) {
    return res.json({
      success: true,
      type: "direct-video",
      platform: platform || "Direct video source",
      selectedQuality: quality,
      videoUrl: parsed.href,
      downloadAvailable: true,
      message:
        "Direct video link detected. Use the video URL to open or download the file if the source permits it."
    });
  }

  if (!platform) {
    return res.status(400).json({
      success: false,
      message: "This website is not supported."
    });
  }

  // Recognized social media link
  return res.json({
    success: true,
    type: "page-link",
    platform,
    selectedQuality: quality,
    downloadAvailable: false,
    message:
      platform +
      " link recognized. A compatible, authorized video service is needed to retrieve the actual video file."
  });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(400).json({
    success: false,
    message: "The request could not be processed."
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`ALL VIDEO DOWNLOADER PRO running on port ${PORT}`);
});
