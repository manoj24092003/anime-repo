const express = require("express");
const request = require("request");
const app = express();

app.get("/", (req, res) => {
  res.send("Telegram Proxy Running ✔️");
});

app.get("/stream", (req, res) => {
  const fileUrl = req.query.url;
  if (!fileUrl) return res.status(400).send("Missing url param");

  request
    .get({
      url: fileUrl,
      headers: {
        "Range": req.headers.range || "",
        "User-Agent": "Mozilla/5.0"
      }
    })
    .on("response", (remoteRes) => {
      res.writeHead(remoteRes.statusCode, {
        "Content-Type": remoteRes.headers["content-type"] || "video/mp4",
        "Content-Length": remoteRes.headers["content-length"],
        "Accept-Ranges": "bytes",
        ...(remoteRes.headers["content-range"]
          ? { "Content-Range": remoteRes.headers["content-range"] }
          : {})
      });
    })
    .pipe(res)
    .on("error", (err) => res.sendStatus(500));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
