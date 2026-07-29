/**
 * Minimal HTTPS-ready Telegram Bot API reverse proxy.
 *
 * Forwards:  /botTOKEN/method  →  https://api.telegram.org/botTOKEN/method
 *
 * Env:
 *   PORT=8080
 *   PROXY_SECRET=long-random   (required) — clients send header X-Telegram-Proxy-Secret
 *   ALLOWED_IPS=132.243.16.225 (optional, comma-separated; empty = any IP with valid secret)
 *
 * Run behind nginx/caddy with TLS, or: node server.js (HTTP only — use TLS terminator).
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8080);
const PROXY_SECRET = (process.env.PROXY_SECRET || "").trim();
const ALLOWED_IPS = (process.env.ALLOWED_IPS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const UPSTREAM = "api.telegram.org";

if (!PROXY_SECRET || PROXY_SECRET.length < 16) {
  console.error(
    "Set PROXY_SECRET to a long random string (openssl rand -hex 32)"
  );
  process.exit(1);
}

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) {
    return xf.split(",")[0].trim();
  }
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.length) return real.trim();
  return req.socket.remoteAddress || "";
}

function normalizeIp(ip) {
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

function authorized(req) {
  const secret = req.headers["x-telegram-proxy-secret"];
  if (secret !== PROXY_SECRET) return false;
  if (ALLOWED_IPS.length === 0) return true;
  const ip = normalizeIp(clientIp(req));
  return ALLOWED_IPS.includes(ip);
}

function forward(req, res) {
  if (!authorized(req)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, description: "Forbidden" }));
    return;
  }

  // Only Bot API paths: /bot<token>/<method> or /file/bot...
  if (!/^\/(bot|file\/bot)/.test(req.url || "")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, description: "Not found" }));
    return;
  }

  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    const headers = {
      host: UPSTREAM,
      "content-type":
        req.headers["content-type"] || "application/json",
      "content-length": body.length,
      "user-agent": "DevFuture-Telegram-Proxy/1.0",
      accept: "*/*",
    };

    const upstreamReq = https.request(
      {
        hostname: UPSTREAM,
        port: 443,
        path: req.url,
        method: req.method || "GET",
        headers,
        servername: UPSTREAM,
        family: 4,
        timeout: 30_000,
      },
      (upstreamRes) => {
        const outHeaders = {
          "content-type":
            upstreamRes.headers["content-type"] || "application/json",
        };
        res.writeHead(upstreamRes.statusCode || 502, outHeaders);
        upstreamRes.pipe(res);
      }
    );

    upstreamReq.on("timeout", () => {
      upstreamReq.destroy(new Error("Upstream timeout"));
    });
    upstreamReq.on("error", (err) => {
      console.error("[proxy] upstream error:", err.message);
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            ok: false,
            description: `Upstream error: ${err.message}`,
          })
        );
      }
    });

    if (body.length) upstreamReq.write(body);
    upstreamReq.end();
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "telegram-bot-api-proxy" }));
    return;
  }
  forward(req, res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `Telegram Bot API proxy on 127.0.0.1:${PORT} → https://${UPSTREAM}`
  );
  console.log(
    `ALLOWED_IPS: ${ALLOWED_IPS.length ? ALLOWED_IPS.join(", ") : "(any with secret)"}`
  );
});
