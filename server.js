const express = require("express");
const https = require("https");

const app = express();

app.get("/", (req, res) => {
  res.send("Telegram Proxy Running ✔️");
});

app.get("/stream", (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).send("Missing url param");

  https.get(fileUrl, { headers: { "Range": req.headers.range || "" } }, (tgRes) => {
    res.writeHead(tgRes.statusCode, {
      "Content-Type": tgRes.headers["content-type"] || "video/mp4",
      "Content-Length": tgRes.headers["content-length"],
      "Accept-Ranges": "bytes",
      ...(tgRes.headers["content-range"]
        ? { "Content-Range": tgRes.headers["content-range"] }
        : {})
    });

    tgRes.pipe(res);
  }).on("error", () => {
    res.sendStatus(500);
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Proxy running on port", PORT);
});
