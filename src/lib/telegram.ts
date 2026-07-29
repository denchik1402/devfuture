import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

/** Many VPS prefer broken IPv6 routes — force IPv4 first */
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* older Node */
}

/** Read at call-time — Next may inline module-level process.env at build */
function telegramApiBase() {
  return (
    process.env["TELEGRAM_API_BASE"]?.trim() || "https://api.telegram.org"
  ).replace(/\/$/, "");
}

export function getBotToken() {
  return process.env["TELEGRAM_BOT_TOKEN"]?.trim() || "";
}

export function getOwnerChatId() {
  return process.env["TELEGRAM_CHAT_ID"]?.trim() || "";
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type TelegramResponse = {
  ok: boolean;
  description?: string;
  result?: unknown;
};

/**
 * Prefer Node https with family:4 over fetch.
 * On FirstByte, fetch often hangs on broken IPv6 while curl -4 works.
 */
function postJson(
  urlStr: string,
  headers: Record<string, string>,
  body: string
): Promise<{ status: number; data: TelegramResponse }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers: {
          ...headers,
          "content-length": Buffer.byteLength(body),
        },
        family: 4,
        servername: url.hostname,
        timeout: 25_000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let data: TelegramResponse;
          try {
            data = JSON.parse(raw) as TelegramResponse;
          } catch {
            data = {
              ok: false,
              description: `Non-JSON ${res.statusCode}: ${raw.slice(0, 180)}`,
            };
          }
          resolve({ status: res.statusCode || 0, data });
        });
      }
    );
    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function tgApi(
  method: string,
  body: Record<string, unknown>
): Promise<TelegramResponse> {
  const token = getBotToken();
  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN не задан" };
  }

  const api = telegramApiBase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const proxySecret = process.env["TELEGRAM_PROXY_SECRET"]?.trim();
  if (proxySecret) {
    headers["X-Telegram-Proxy-Secret"] = proxySecret;
  }

  try {
    const { status, data } = await postJson(
      `${api}/bot${token}/${method}`,
      headers,
      JSON.stringify(body)
    );
    if (status < 200 || status >= 300 || !data.ok) {
      console.error(
        "[telegram]",
        method,
        data.description || status,
        `(api=${api})`
      );
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      "[telegram]",
      method,
      "network error:",
      message,
      `(api=${api}). Check TELEGRAM_API_BASE / TELEGRAM_PROXY_SECRET.`
    );
    return { ok: false, description: message };
  }
}

export async function sendMessage(
  chatId: number | string,
  text: string,
  extra?: Record<string, unknown>
) {
  return tgApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
) {
  return tgApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function editMessageText(
  chatId: number | string,
  messageId: number,
  text: string,
  extra?: Record<string, unknown>
) {
  return tgApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}
