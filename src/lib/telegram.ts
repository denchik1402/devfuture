import dns from "node:dns";

/** Many VPS prefer broken IPv6 routes to Telegram — force IPv4 first */
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

export async function tgApi(
  method: string,
  body: Record<string, unknown>
): Promise<TelegramResponse> {
  const token = getBotToken();
  if (!token) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN не задан" };
  }

  const api = telegramApiBase();

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const proxySecret = process.env["TELEGRAM_PROXY_SECRET"]?.trim();
    if (proxySecret) {
      headers["X-Telegram-Proxy-Secret"] = proxySecret;
    }

    const res = await fetch(`${api}/bot${token}/${method}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });

    const data = (await res.json().catch(() => ({}))) as TelegramResponse;
    if (!res.ok || !data.ok) {
      console.error(
        "[telegram]",
        method,
        data.description || res.status,
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
