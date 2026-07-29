import {
  adminKeyboard,
  adminWelcomeText,
  formatAdminStats,
  formatRecentLeads,
  isAdmin,
} from "@/lib/bot-admin";
import {
  clearAllDrafts,
  deleteDraft,
  getDraft,
  setDraft,
  type LeadDraft,
} from "@/lib/bot-drafts";
import { addLead } from "@/lib/bot-leads";
import { siteConfig } from "@/lib/site";
import { SERVICE_PAGES } from "@/lib/services";
import {
  answerCallbackQuery,
  editMessageText,
  escapeHtml,
  getOwnerChatId,
  sendMessage,
} from "@/lib/telegram";

type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TgMessage = {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
  from?: TgUser;
};

type TgCallback = {
  id: string;
  data?: string;
  from: TgUser;
  message?: TgMessage;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallback;
};

function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).replace(
    /\/$/,
    ""
  );
  return `${base}${path}`;
}

function managerUrl() {
  return siteConfig.telegramUrl;
}

function mainKeyboard(admin = false) {
  const rows = [
    [
      { text: "🚀 Оставить заявку", callback_data: "order" },
      { text: "🛠 Услуги", callback_data: "services" },
    ],
    [
      { text: "⚡ Демо за 1 день", callback_data: "speed" },
      { text: "💰 Пакеты и цены", url: siteUrl("/#packages") },
    ],
    [
      { text: "🌐 Сайт", url: siteUrl("/") },
      { text: "👤 Написать менеджеру", url: managerUrl() },
    ],
  ];
  if (admin) {
    rows.push([{ text: "🔐 Админ", callback_data: "admin" }]);
  }
  return { inline_keyboard: rows };
}

function servicesKeyboard() {
  return {
    inline_keyboard: [
      ...SERVICE_PAGES.map((s) => [
        {
          text: s.shortName,
          url: siteUrl(`/uslugi/${s.slug}`),
        },
      ]),
      [
        { text: "🚀 Оставить заявку", callback_data: "order" },
        { text: "⬅️ В меню", callback_data: "menu" },
      ],
    ],
  };
}

function cancelKeyboard() {
  return {
    inline_keyboard: [[{ text: "❌ Отмена", callback_data: "cancel" }]],
  };
}

function welcomeText(name?: string) {
  const hi = name ? `, ${escapeHtml(name)}` : "";
  return [
    `<b>DevFuture</b>${hi} 👋`,
    "",
    "Делаем сайты, веб и десктоп, Telegram-ботов и автоматизацию.",
    "Простой бот / MVP часто показываем <b>в день обращения</b>.",
    "",
    "Выберите действие на кнопках ниже:",
  ].join("\n");
}

async function showClientMenu(
  chatId: number,
  userId: number | undefined,
  firstName: string | undefined,
  messageId?: number
) {
  const text = welcomeText(firstName);
  const markup = mainKeyboard(isAdmin(userId));
  if (messageId) {
    await editMessageText(chatId, messageId, text, { reply_markup: markup });
  } else {
    await sendMessage(chatId, text, { reply_markup: markup });
  }
}

async function showAdminPanel(
  chatId: number,
  userId: number,
  messageId?: number
) {
  if (!isAdmin(userId)) {
    await sendMessage(chatId, "Недостаточно прав.", {
      reply_markup: mainKeyboard(false),
    });
    return;
  }
  const text = adminWelcomeText();
  const markup = adminKeyboard();
  if (messageId) {
    await editMessageText(chatId, messageId, text, { reply_markup: markup });
  } else {
    await sendMessage(chatId, text, { reply_markup: markup });
  }
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  if (update.message?.text) {
    await handleMessage(update.message);
  }
}

async function handleMessage(message: TgMessage) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();
  const firstName = message.from?.first_name;
  const userId = message.from?.id;

  if (text === "/start" || text.startsWith("/start ")) {
    deleteDraft(chatId);
    await showClientMenu(chatId, userId, firstName);
    return;
  }

  if (text === "/admin") {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Команда недоступна.", {
        reply_markup: mainKeyboard(false),
      });
      return;
    }
    deleteDraft(chatId);
    await showAdminPanel(chatId, userId!);
    return;
  }

  if (text === "/help" || text === "/menu") {
    deleteDraft(chatId);
    await showClientMenu(chatId, userId, firstName);
    return;
  }

  if (text === "/cancel") {
    deleteDraft(chatId);
    await sendMessage(chatId, "Заявку отменил. Чем ещё помочь?", {
      reply_markup: mainKeyboard(isAdmin(userId)),
    });
    return;
  }

  const draft = getDraft(chatId);
  if (draft) {
    await handleDraftStep(chatId, draft, text, message.from);
    return;
  }

  await sendMessage(
    chatId,
    "Напишите /start или нажмите кнопку ниже — так удобнее 👇",
    { reply_markup: mainKeyboard(isAdmin(userId)) }
  );
}

async function handleDraftStep(
  chatId: number,
  draft: LeadDraft,
  text: string,
  from?: TgUser
) {
  if (draft.step === "name") {
    draft.name = text.slice(0, 80);
    draft.step = "contact";
    setDraft(chatId, draft);
    await sendMessage(
      chatId,
      "Отлично. Теперь ваш <b>Telegram или телефон</b> для связи:",
      { reply_markup: cancelKeyboard() }
    );
    return;
  }

  if (draft.step === "contact") {
    draft.contact = text.slice(0, 120);
    draft.step = "task";
    setDraft(chatId, draft);
    await sendMessage(
      chatId,
      "И коротко: <b>что нужно сделать?</b>\n(2–3 предложения)",
      { reply_markup: cancelKeyboard() }
    );
    return;
  }

  if (draft.step === "task") {
    const task = text.slice(0, 2000);
    const name = draft.name || from?.first_name || "Клиент";
    const contact =
      draft.contact || (from?.username ? `@${from.username}` : "—");
    deleteDraft(chatId);

    addLead({
      chatId,
      name,
      contact,
      task,
      fromId: from?.id,
      username: from?.username,
    });

    await sendMessage(
      chatId,
      [
        "✅ <b>Заявка принята!</b>",
        "",
        "Мы получили её и скоро ответим.",
        "Можно также написать менеджеру напрямую.",
      ].join("\n"),
      { reply_markup: mainKeyboard(isAdmin(from?.id)) }
    );

    const owner = getOwnerChatId();
    if (owner) {
      const when = new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      });
      const notify = [
        "🆕 <b>Заявка из Telegram-бота</b>",
        `🕐 ${escapeHtml(when)} (МСК)`,
        "",
        `👤 <b>Имя:</b> ${escapeHtml(name)}`,
        `📱 <b>Контакт:</b> ${escapeHtml(contact)}`,
        from?.username
          ? `🔗 TG: @${escapeHtml(from.username)} (id: ${from.id})`
          : `🔗 TG id: ${from?.id ?? chatId}`,
        "",
        "<b>Задача:</b>",
        escapeHtml(task),
      ].join("\n");

      const replyMarkup = from?.username
        ? {
            inline_keyboard: [
              [
                {
                  text: "Написать клиенту",
                  url: `https://t.me/${from.username}`,
                },
              ],
            ],
          }
        : undefined;

      await sendMessage(owner, notify, { reply_markup: replyMarkup });
    }
  }
}

async function handleAdminCallback(
  data: string,
  chatId: number,
  userId: number,
  messageId?: number
) {
  if (!isAdmin(userId)) {
    await sendMessage(chatId, "Недостаточно прав.");
    return;
  }

  if (data === "admin" || data === "admin:home") {
    await showAdminPanel(chatId, userId, messageId);
    return;
  }

  if (data === "admin:stats") {
    const text = formatAdminStats();
    const markup = adminKeyboard();
    if (messageId) {
      await editMessageText(chatId, messageId, text, { reply_markup: markup });
    } else {
      await sendMessage(chatId, text, { reply_markup: markup });
    }
    return;
  }

  if (data === "admin:leads") {
    const text = formatRecentLeads(5);
    const markup = adminKeyboard();
    if (messageId) {
      await editMessageText(chatId, messageId, text, { reply_markup: markup });
    } else {
      await sendMessage(chatId, text, { reply_markup: markup });
    }
    return;
  }

  if (data === "admin:drafts") {
    const cleared = clearAllDrafts();
    const text = [
      "<b>🧹 Черновики</b>",
      "",
      cleared
        ? `Очищено незавершённых заявок: <b>${cleared}</b>.`
        : "Открытых черновиков не было.",
    ].join("\n");
    const markup = adminKeyboard();
    if (messageId) {
      await editMessageText(chatId, messageId, text, { reply_markup: markup });
    } else {
      await sendMessage(chatId, text, { reply_markup: markup });
    }
    return;
  }

  if (data === "admin:ping") {
    await sendMessage(
      chatId,
      `🔔 Пинг OK · ${new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      })} (МСК)`,
      { reply_markup: adminKeyboard() }
    );
  }
}

async function handleCallback(cb: TgCallback) {
  const data = cb.data || "";
  const chatId = cb.message?.chat.id;
  const messageId = cb.message?.message_id;
  const userId = cb.from.id;

  await answerCallbackQuery(cb.id);

  if (!chatId) return;

  if (data === "admin" || data.startsWith("admin:")) {
    await handleAdminCallback(data, chatId, userId, messageId);
    return;
  }

  if (data === "cancel") {
    deleteDraft(chatId);
    await sendMessage(chatId, "Ок, отменил. Выберите действие:", {
      reply_markup: mainKeyboard(isAdmin(userId)),
    });
    return;
  }

  if (data === "menu") {
    deleteDraft(chatId);
    await showClientMenu(chatId, userId, cb.from.first_name, messageId);
    return;
  }

  if (data === "services") {
    const text = [
      "<b>Наши услуги</b>",
      "",
      ...SERVICE_PAGES.map(
        (s) =>
          `• <b>${escapeHtml(s.shortName)}</b> — от ${escapeHtml(s.priceFrom)}`
      ),
      "",
      "Откройте карточку или оставьте заявку:",
    ].join("\n");

    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: servicesKeyboard(),
      });
    } else {
      await sendMessage(chatId, text, { reply_markup: servicesKeyboard() });
    }
    return;
  }

  if (data === "speed") {
    const text = [
      "<b>Демо в день обращения</b>",
      "",
      "Для простого бота или прототипа:",
      "1) Короткий бриф",
      "2) Сценарий и каркас",
      "3) Рабочее демо в Telegram",
      "",
      "Оставьте заявку — оценим, успеем ли сегодня.",
    ].join("\n");

    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Оставить заявку", callback_data: "order" }],
            [{ text: "⬅️ В меню", callback_data: "menu" }],
          ],
        },
      });
    }
    return;
  }

  if (data === "order") {
    setDraft(chatId, { step: "name" });
    await sendMessage(
      chatId,
      "Давайте оформим заявку.\n\nКак к вам обращаться? <b>Напишите имя:</b>",
      { reply_markup: cancelKeyboard() }
    );
  }
}
