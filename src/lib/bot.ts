import {
  adminKeyboard,
  adminWelcomeText,
  formatAdminStats,
  formatRecentLeads,
  getAdminIds,
  isAdmin,
  leadNotifyMarkup,
  leadsManageKeyboard,
  parseLeadStatusCallback,
  questionNotifyMarkup,
} from "@/lib/bot-admin";
import {
  faqAnswer,
  faqKeyboard,
  faqListText,
  packageKeyboard,
  packagesKeyboard,
  packagesListText,
  packageText,
  parseStartPayload,
  serviceBotKeyboard,
  serviceBotText,
} from "@/lib/bot-content";
import { pushLeadStatusToCrm, pushLeadToCrm } from "@/lib/bot-crm";
import {
  clearAllDrafts,
  deleteDraft,
  getDraft,
  setDraft,
  type LeadDraft,
} from "@/lib/bot-drafts";
import {
  addLead,
  deleteLead,
  getLead,
  listLeads,
  STATUS_LABEL,
  updateLeadStatus,
} from "@/lib/bot-leads";
import {
  clearSession,
  getSession,
  setSession,
} from "@/lib/bot-sessions";
import { listUserChatIds, touchUser, usersCount } from "@/lib/bot-users";
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

function mainKeyboard(admin = false) {
  const rows: { text: string; callback_data?: string; url?: string }[][] = [
    [
      { text: "🚀 Оставить заявку", callback_data: "order" },
      { text: "🛠 Услуги", callback_data: "services" },
    ],
    [
      { text: "⚡ Демо за 1 день", callback_data: "speed" },
      { text: "💰 Пакеты", callback_data: "packages" },
    ],
    [
      { text: "❓ FAQ", callback_data: "faq" },
      { text: "💬 Задать вопрос", callback_data: "ask" },
    ],
    [{ text: "🌐 Сайт", url: siteUrl("/") }],
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
          callback_data: `svc:${s.slug}`.slice(0, 64),
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

async function startOrder(
  chatId: number,
  source?: string,
  preface?: string
) {
  setDraft(chatId, { step: "name", source });
  const head = preface ? `${preface}\n\n` : "Давайте оформим заявку.\n\n";
  await sendMessage(
    chatId,
    `${head}Как к вам обращаться? <b>Напишите имя:</b>`,
    { reply_markup: cancelKeyboard() }
  );
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

  touchUser(chatId, message.from?.username);

  if (userId && isAdmin(userId)) {
    const session = getSession(userId);
    if (session?.type === "reply") {
      if (text === "/cancel" || text === "отмена") {
        clearSession(userId);
        await sendMessage(chatId, "Ответ отменён.", {
          reply_markup: adminKeyboard(),
        });
        return;
      }
      const result = await sendMessage(
        session.targetChatId,
        [
          "<b>Ответ от DevFuture</b>",
          "",
          escapeHtml(text.slice(0, 3500)),
        ].join("\n")
      );
      clearSession(userId);
      await sendMessage(
        chatId,
        result.ok
          ? "✅ Отправлено."
          : `Не удалось отправить: ${escapeHtml(result.description || "error")}`,
        { reply_markup: adminKeyboard() }
      );
      return;
    }
    if (session?.type === "broadcast" && !session.text) {
      if (text === "/cancel" || text === "отмена") {
        clearSession(userId);
        await sendMessage(chatId, "Рассылка отменена.", {
          reply_markup: adminKeyboard(),
        });
        return;
      }
      const body = text.slice(0, 3500);
      setSession(userId, { type: "broadcast", text: body });
      const n = usersCount();
      await sendMessage(
        chatId,
        [
          "<b>Подтверждение рассылки</b>",
          "",
          escapeHtml(body),
          "",
          `Получателей: <b>${n}</b>`,
          "Отправить?",
        ].join("\n"),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Да, отправить",
                  callback_data: "admin:broadcast:yes",
                },
                { text: "❌ Отмена", callback_data: "admin:broadcast:no" },
              ],
            ],
          },
        }
      );
      return;
    }
  }

  const askSession = getSession(chatId);
  if (askSession?.type === "ask") {
    if (text === "/cancel" || text === "отмена") {
      clearSession(chatId);
      await sendMessage(chatId, "Вопрос отменён.", {
        reply_markup: mainKeyboard(isAdmin(userId)),
      });
      return;
    }
    clearSession(chatId);
    await deliverQuestion(chatId, text, message.from);
    return;
  }

  if (text === "/start" || text.startsWith("/start ") || text.startsWith("/start@")) {
    deleteDraft(chatId);
    clearSession(chatId);
    if (userId) clearSession(userId);
    await handleStart(chatId, userId, firstName, text);
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
    clearSession(chatId);
    await showClientMenu(chatId, userId, firstName);
    return;
  }

  if (text === "/cancel") {
    deleteDraft(chatId);
    clearSession(chatId);
    if (userId) clearSession(userId);
    await sendMessage(chatId, "Отменил. Чем ещё помочь?", {
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

async function deliverQuestion(chatId: number, question: string, from?: TgUser) {
  await sendMessage(
    chatId,
    [
      "✅ <b>Вопрос отправлен</b>",
      "",
      "Менеджер ответит здесь же в боте.",
    ].join("\n"),
    { reply_markup: mainKeyboard(isAdmin(from?.id)) }
  );

  const when = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
  const who = from?.username
    ? `@${escapeHtml(from.username)} (id: ${from.id})`
    : `id ${from?.id ?? chatId}`;
  const name = from?.first_name
    ? escapeHtml(from.first_name)
    : "Клиент";
  const notify = [
    "💬 <b>Вопрос из бота</b>",
    `🕐 ${escapeHtml(when)} (МСК)`,
    `👤 ${name} · ${who}`,
    "",
    escapeHtml(question.slice(0, 3500)),
  ].join("\n");

  const markup = questionNotifyMarkup(chatId);
  const admins = Array.from(getAdminIds());
  const owner = getOwnerChatId();
  const targets = new Set<string>();
  if (owner) targets.add(owner);
  for (const id of admins) targets.add(String(id));

  if (!targets.size) {
    console.error("[bot] no admin to receive question");
    return;
  }

  for (const target of Array.from(targets)) {
    await sendMessage(target, notify, { reply_markup: markup });
  }
}

async function handleStart(
  chatId: number,
  userId: number | undefined,
  firstName: string | undefined,
  text: string
) {
  const payload = parseStartPayload(text);

  if (payload.kind === "order") {
    await startOrder(chatId, "start_order");
    return;
  }
  if (payload.kind === "speed") {
    await sendSpeed(chatId);
    return;
  }
  if (payload.kind === "faq") {
    await sendMessage(chatId, faqListText(), { reply_markup: faqKeyboard() });
    return;
  }
  if (payload.kind === "packages") {
    await sendMessage(chatId, packagesListText(), {
      reply_markup: packagesKeyboard(),
    });
    return;
  }
  if (payload.kind === "package") {
    const body = packageText(payload.id);
    if (body) {
      await sendMessage(chatId, body, {
        reply_markup: packageKeyboard(payload.id),
      });
      return;
    }
  }
  if (payload.kind === "service") {
    const body = serviceBotText(payload.slug);
    if (body) {
      await sendMessage(chatId, body, {
        reply_markup: serviceBotKeyboard(payload.slug),
      });
      return;
    }
  }

  await showClientMenu(chatId, userId, firstName);
}

async function sendSpeed(chatId: number, messageId?: number) {
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
  const markup = {
    inline_keyboard: [
      [{ text: "🚀 Оставить заявку", callback_data: "order" }],
      [{ text: "⬅️ В меню", callback_data: "menu" }],
    ],
  };
  if (messageId) {
    await editMessageText(chatId, messageId, text, { reply_markup: markup });
  } else {
    await sendMessage(chatId, text, { reply_markup: markup });
  }
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
    const source = draft.source;
    deleteDraft(chatId);

    const lead = addLead({
      chatId,
      name,
      contact,
      task,
      fromId: from?.id,
      username: from?.username,
      source,
    });
    void pushLeadToCrm(lead);

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
        source ? `🏷 Источник: <code>${escapeHtml(source)}</code>` : "",
        "",
        `👤 <b>Имя:</b> ${escapeHtml(name)}`,
        `📱 <b>Контакт:</b> ${escapeHtml(contact)}`,
        from?.username
          ? `🔗 TG: @${escapeHtml(from.username)} (id: ${from.id})`
          : `🔗 TG id: ${from?.id ?? chatId}`,
        "",
        "<b>Задача:</b>",
        escapeHtml(task),
        "",
        `ID: <code>${escapeHtml(lead.id)}</code>`,
      ]
        .filter(Boolean)
        .join("\n");

      await sendMessage(owner, notify, {
        reply_markup: leadNotifyMarkup(lead),
      });
    }
  }
}

async function runBroadcast(adminChatId: number, text: string) {
  const ids = listUserChatIds().filter((id) => id !== adminChatId);
  let ok = 0;
  let fail = 0;
  await sendMessage(adminChatId, `📣 Рассылка началась (${ids.length})…`);
  for (const id of ids) {
    const res = await sendMessage(id, text);
    if (res.ok) ok += 1;
    else fail += 1;
    await new Promise((r) => setTimeout(r, 45));
  }
  await sendMessage(
    adminChatId,
    `Готово. Успешно: <b>${ok}</b>, ошибок: <b>${fail}</b>.`,
    { reply_markup: adminKeyboard() }
  );
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
    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: adminKeyboard(),
      });
    } else {
      await sendMessage(chatId, text, { reply_markup: adminKeyboard() });
    }
    return;
  }

  if (data === "admin:leads") {
    const leads = listLeads(5);
    const text = formatRecentLeads(5);
    const markup = leads.length
      ? leadsManageKeyboard(leads)
      : adminKeyboard();
    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: markup,
      });
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
    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: adminKeyboard(),
      });
    } else {
      await sendMessage(chatId, text, { reply_markup: adminKeyboard() });
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
    return;
  }

  if (data === "admin:broadcast") {
    setSession(userId, { type: "broadcast" });
    await sendMessage(
      chatId,
      [
        "<b>📣 Рассылка</b>",
        "",
        `Получателей сейчас: <b>${usersCount()}</b>`,
        "Пришлите текст одним сообщением (HTML не нужен).",
        "Отмена: /cancel",
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "❌ Отмена", callback_data: "admin:broadcast:no" }],
          ],
        },
      }
    );
    return;
  }

  if (data === "admin:broadcast:no") {
    clearSession(userId);
    await sendMessage(chatId, "Рассылка отменена.", {
      reply_markup: adminKeyboard(),
    });
    return;
  }

  if (data === "admin:broadcast:yes") {
    const session = getSession(userId);
    if (session?.type !== "broadcast" || !session.text) {
      await sendMessage(chatId, "Нет текста для рассылки. Начните снова.", {
        reply_markup: adminKeyboard(),
      });
      return;
    }
    const body = session.text;
    clearSession(userId);
    await runBroadcast(chatId, body);
  }
}

async function handleCallback(cb: TgCallback) {
  const data = cb.data || "";
  const chatId = cb.message?.chat.id;
  const messageId = cb.message?.message_id;
  const userId = cb.from.id;

  await answerCallbackQuery(cb.id);

  if (!chatId) return;

  touchUser(chatId, cb.from.username);

  if (data.startsWith("ls:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const parsed = parseLeadStatusCallback(data);
    if (!parsed) return;
    const prev = getLead(parsed.id);
    const lead = updateLeadStatus(parsed.id, parsed.status);
    if (!lead) {
      await sendMessage(chatId, "Заявка не найдена.");
      return;
    }
    if (prev) void pushLeadStatusToCrm(lead, prev.status);
    const note = `${STATUS_LABEL[lead.status]} · ${escapeHtml(lead.name)} · <code>${escapeHtml(lead.id)}</code>`;
    await sendMessage(chatId, `Статус обновлён:\n${note}`, {
      reply_markup: leadNotifyMarkup(lead),
    });
    return;
  }

  if (data.startsWith("ld:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const id = data.slice(3);
    const removed = deleteLead(id);
    await sendMessage(
      chatId,
      removed
        ? `🗑 Заявка удалена: <b>${escapeHtml(removed.name)}</b> (<code>${escapeHtml(id)}</code>)`
        : "Заявка не найдена или уже удалена.",
      { reply_markup: adminKeyboard() }
    );
    return;
  }

  if (data.startsWith("reply:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const target = Number(data.slice("reply:".length));
    if (!Number.isFinite(target)) return;
    setSession(userId, { type: "reply", targetChatId: target });
    await sendMessage(
      chatId,
      [
        "<b>Ответ клиенту</b>",
        `Чат: <code>${target}</code>`,
        "Напишите сообщение одним текстом.",
        "Отмена: /cancel",
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Отмена", callback_data: "cancel" }]],
        },
      }
    );
    return;
  }

  if (data === "admin" || data.startsWith("admin:")) {
    await handleAdminCallback(data, chatId, userId, messageId);
    return;
  }

  if (data === "cancel") {
    deleteDraft(chatId);
    clearSession(chatId);
    clearSession(userId);
    await sendMessage(chatId, "Ок, отменил. Выберите действие:", {
      reply_markup: mainKeyboard(isAdmin(userId)),
    });
    return;
  }

  if (data === "ask") {
    deleteDraft(chatId);
    setSession(chatId, { type: "ask" });
    await sendMessage(
      chatId,
      [
        "<b>💬 Задать вопрос</b>",
        "",
        "Напишите вопрос одним сообщением — менеджер ответит здесь же в боте.",
        "Отмена: /cancel",
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Отмена", callback_data: "cancel" }]],
        },
      }
    );
    return;
  }

  if (data === "menu") {
    deleteDraft(chatId);
    clearSession(chatId);
    await showClientMenu(chatId, userId, cb.from.first_name, messageId);
    return;
  }

  if (data === "faq") {
    const text = faqListText();
    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: faqKeyboard(),
      });
    } else {
      await sendMessage(chatId, text, { reply_markup: faqKeyboard() });
    }
    return;
  }

  if (data.startsWith("faq:")) {
    const idx = Number(data.slice(4));
    const answer = faqAnswer(idx);
    if (!answer) return;
    if (messageId) {
      await editMessageText(chatId, messageId, answer, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "❓ Все вопросы", callback_data: "faq" }],
            [
              { text: "🚀 Заявка", callback_data: "order" },
              { text: "⬅️ Меню", callback_data: "menu" },
            ],
          ],
        },
      });
    }
    return;
  }

  if (data === "packages") {
    const text = packagesListText();
    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: packagesKeyboard(),
      });
    } else {
      await sendMessage(chatId, text, { reply_markup: packagesKeyboard() });
    }
    return;
  }

  if (data.startsWith("pkg:")) {
    const id = data.slice(4);
    const body = packageText(id);
    if (!body) return;
    if (messageId) {
      await editMessageText(chatId, messageId, body, {
        reply_markup: packageKeyboard(id),
      });
    } else {
      await sendMessage(chatId, body, { reply_markup: packageKeyboard(id) });
    }
    return;
  }

  if (data.startsWith("svc:")) {
    const slug = data.slice(4);
    const body = serviceBotText(slug);
    if (!body) return;
    if (messageId) {
      await editMessageText(chatId, messageId, body, {
        reply_markup: serviceBotKeyboard(slug),
      });
    } else {
      await sendMessage(chatId, body, {
        reply_markup: serviceBotKeyboard(slug),
      });
    }
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
    await sendSpeed(chatId, messageId);
    return;
  }

  if (data === "order" || data.startsWith("order:")) {
    const source = data.startsWith("order:") ? data.slice(6) : "menu_order";
    let preface: string | undefined;
    if (source.startsWith("pkg_")) {
      const pkgBody = packageText(source.slice(4));
      if (pkgBody) preface = `Заявка по пакету:\n${pkgBody}`;
    }
    if (source.startsWith("svc_")) {
      const svcBody = serviceBotText(source.slice(4));
      if (svcBody) preface = `Заявка по услуге:\n${svcBody}`;
    }
    await startOrder(chatId, source, preface);
  }
}
