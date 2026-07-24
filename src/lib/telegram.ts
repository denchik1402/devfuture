const TELEGRAM_API = "https://api.telegram.org";

export function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

export function getOwnerChatId() {
  return process.env.TELEGRAM_CHAT_ID?.trim() || "";
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

  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as TelegramResponse;
  if (!res.ok || !data.ok) {
    console.error("[telegram]", method, data.description || res.status);
  }
  return data;
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
