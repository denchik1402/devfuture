/**
 * Minimal HTTPS-ready Telegram Bot API reverse proxy + webhook relay.
 *
 * Bot API forwards:  /botTOKEN/method  →  https://api.telegram.org/botTOKEN/method
 * Webhook relay:     POST /webhook     →  WEBHOOK_RELAY_URL (FirstByte), when Telegram
 *                    cannot reach the site host (Connection timed out on getWebhookInfo).
 *
 * Env:
 *   PORT=8080
 *   PROXY_SECRET=long-random   (required) — clients send header X-Telegram-Proxy-Secret
 *   ALLOWED_IPS=132.243.16.225 (optional, comma-separated; empty = any IP with valid secret)
 *   WEBHOOK_RELAY_URL=https://devfuture.ru/api/telegram/webhook  (optional)
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
const WEBHOOK_RELAY_URL = (process.env.WEBHOOK_RELAY_URL || "").trim();
const UPSTREAM = "api.telegram.org";

/** @type {Map<string, { count: number; resetAt: number }> | null} */
let relayBuckets = null;

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function requestJson(urlStr, { method, headers, body, family = 4 }) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method,
        headers,
        family,
        servername: url.hostname,
        timeout: 25_000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    if (body && body.length) req.write(body);
    req.end();
  });
}

async function relayWebhook(req, res) {
  if (!WEBHOOK_RELAY_URL) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, description: "Webhook relay off" }));
    return;
  }

  const ip = normalizeIp(clientIp(req));
  // Simple in-process rate limit per IP (Telegram + abuse)
  if (!relayBuckets) relayBuckets = new Map();
  const now = Date.now();
  let bucket = relayBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + 60_000 };
    relayBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > 180) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, description: "Too many requests" }));
    return;
  }

  const body = await readBody(req);
  const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
  console.log(
    `[relay] ${ip} POST /webhook → ${WEBHOOK_RELAY_URL} (${body.length}b)`
  );

  try {
    const headers = {
      "content-type": req.headers["content-type"] || "application/json",
      "content-length": body.length,
      "user-agent": "DevFuture-Telegram-Webhook-Relay/1.0",
      accept: "application/json",
    };
    if (typeof secretHeader === "string" && secretHeader) {
      headers["x-telegram-bot-api-secret-token"] = secretHeader;
    }

    const upstream = await requestJson(WEBHOOK_RELAY_URL, {
      method: "POST",
      headers,
      body,
    });

    const outType =
      upstream.headers["content-type"] || "application/json; charset=utf-8";
    res.writeHead(upstream.status || 502, { "content-type": outType });
    res.end(upstream.body);
  } catch (err) {
    console.error("[relay] error:", err.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: false,
        description: `Relay error: ${err.message}`,
      })
    );
  }
}

function forwardBotApi(req, res) {
  const ip = normalizeIp(clientIp(req));
  if (!authorized(req)) {
    console.warn(`[proxy] 403 from ${ip} ${req.method} ${req.url}`);
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

  const methodMatch = (req.url || "").match(/\/bot[^/]+\/([A-Za-z0-9_]+)/);
  const apiMethod = methodMatch ? methodMatch[1] : "?";
  console.log(`[proxy] ${ip} ${req.method} ${apiMethod}`);

  readBody(req).then((body) => {
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
  const pathOnly = (req.url || "").split("?")[0];

  if (req.method === "GET" && (pathOnly === "/" || pathOnly === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "telegram-bot-api-proxy",
        webhookRelay: Boolean(WEBHOOK_RELAY_URL),
      })
    );
    return;
  }

  if (
    WEBHOOK_RELAY_URL &&
    req.method === "POST" &&
    (pathOnly === "/webhook" || pathOnly === "/hook")
  ) {
    relayWebhook(req, res).catch((err) => {
      console.error("[relay] fatal:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false }));
      }
    });
    return;
  }

  forwardBotApi(req, res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(
    `Telegram Bot API proxy on 127.0.0.1:${PORT} → https://${UPSTREAM}`
  );
  console.log(
    `ALLOWED_IPS: ${ALLOWED_IPS.length ? ALLOWED_IPS.join(", ") : "(any with secret)"}`
  );
  if (WEBHOOK_RELAY_URL) {
    console.log(`Webhook relay: POST /webhook → ${WEBHOOK_RELAY_URL}`);
  } else {
    console.log("Webhook relay: off (set WEBHOOK_RELAY_URL to enable)");
  }
});
