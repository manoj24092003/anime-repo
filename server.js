const express = require("express");
const https = require("https");

const app = express();

app.get("/", (req, res) => {
  res.send("Telegram Proxy Running ✔️");
});

// STREAM TELEGRAM VIDEO
app.get("/stream", (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).send("Missing url param");

  const range = req.headers.range || "";

  const options = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Range": range
    }
  };

  https.get(fileUrl, options, (tgRes) => {

    if (tgRes.statusCode >= 400) {
      return res.status(500).send("Telegram Server Error");
    }

    const headers = {
      "Content-Type": tgRes.headers["content-type"] || "video/mp4",

      // ⭐ Most important headers for streaming
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",

      "Accept-Ranges": "bytes",
    };

    if (tgRes.headers["content-length"]) {
      headers["Content-Length"] = tgRes.headers["content-length"];
    }

    if (tgRes.headers["content-range"]) {
      headers["Content-Range"] = tgRes.headers["content-range"];
    }

    res.writeHead(tgRes.statusCode, headers);
    tgRes.pipe(res);
  }).on("error", () => res.status(500).send("Proxy Error"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Proxy running on port", PORT);
});
