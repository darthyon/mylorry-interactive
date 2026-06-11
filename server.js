/**
 * MyLorry Flows — Dev Server
 * Zero-dependency Node.js static server
 * Run: node server.js   or   npm run dev
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;
const HOST = 'localhost';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain'
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
<!DOCTYPE html>
<html>
<head><title>404 — Not Found</title></head>
<body style="font-family:system-ui,sans-serif;padding:40px;text-align:center;color:#333;">
  <h1>404 — Not Found</h1>
  <p>The file <code>${filePath}</code> does not exist.</p>
  <p><a href="/">← Back to home</a></p>
</body>
</html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error: ' + err.code);
      }
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Parse URL and decode pathname
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Security: prevent directory traversal
  pathname = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');

  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filePath = path.join(__dirname, pathname);

  // Check if it's a directory and serve index.html
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    serveFile(filePath, res);
  });
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`\n  🚀 MyLorry Flows dev server running at ${url}\n`);
  console.log(`  📁 Project root: ${__dirname}`);
  console.log(`  🔗 Available portals:`);
  console.log(`     • ${url}/              → Homepage (flow directory)`);
  console.log(`     • ${url}/fleet-card/     → Host Portal — Fleet Card — Bulk Actions`);
  console.log(`     • ${url}/agent-portal/   → Agent Portal (placeholder)\n`);
  console.log(`  Press Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n  👋 Server stopped.\n');
  process.exit(0);
});
