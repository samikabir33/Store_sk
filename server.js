const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Passenger (Namecheap cPanel's Node.js app manager) sets PORT automatically.
// Fall back to 3000 for local testing of this file.
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Fahmida's Fashion ready on port ${port}`);
  });
});