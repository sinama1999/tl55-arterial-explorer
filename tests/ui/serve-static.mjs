import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.argv[2];
const port = Number(process.argv[3] ?? 4173);
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };

createServer((request, response) => {
  const relative = normalize(decodeURIComponent(request.url.split("?")[0])).replace(/^[/\\]+/, "");
  let file = join(root, relative || "index.html");
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404); response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`Static test server: http://127.0.0.1:${port}/`));

