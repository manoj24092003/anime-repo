const express = require("express");
const request = require("request");
const app = express();

// Simple Telegram streaming proxy
app.get("/stream", (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).send("Missing 'url'");

  const range = req.headers.range;

  const options = {
    url: fileUrl,
    headers: {
      "Range": range || "",
      "User-Agent": "Mozilla/5.0"
    }
  };

  request
    .get(options)
    .on("response", (remote) => {
      res.writeHead(remote.statusCode, {
        "Content-Type": remote.headers["content-type"] || "video/mp4",
        "Content-Length": remote.headers["content-length"],
        "Accept-Ranges": "bytes",
        ...(remote.headers["content-range"]
          ? { "Content-Range": remote.headers["content-range"] }
          : {})
      });
    })
    .pipe(res)
    .on("error", () => res.sendStatus(500));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
