import {
  adminKeyboard,
  adminWelcomeText,
  formatAdminStats,
  formatRecentLeads,
  formatSearchResults,
  formatWeeklyDigest,
  isAdmin,
  leadDeleteConfirmKeyboard,
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
import { pushLeadStatusToCrm } from "@/lib/bot-crm";
import {
  demoIntro,
  demoKeyboard,
  demosMenuKeyboard,
  demosMenuText,
  demoStep,
  isDemoKind,
} from "@/lib/bot-demos";
import {
  clearAllDrafts,
  deleteDraft,
  getDraft,
  setDraft,
  type LeadDraft,
} from "@/lib/bot-drafts";
import {
  addLeadNote,
  addLeadTag,
  deleteLead,
  findLeadByIdPrefix,
  getLead,
  listLeads,
  searchLeads,
  setLeadAssignee,
  setLeadRemindAt,
  STATUS_LABEL,
  updateLeadStatus,
} from "@/lib/bot-leads";
import { ingestLeadAndNotify, notifyAdmins } from "@/lib/bot-notify";
import { flushCrmQueue } from "@/lib/bot-crm";
import {
  clearSession,
  getSession,
  setSession,
} from "@/lib/bot-sessions";
import { formatSlaReport, maybePingSla, maybePingSla24 } from "@/lib/bot-sla";
import { listUserChatIds, touchUser, usersCount } from "@/lib/bot-users";
import { getReplyTemplate } from "@/lib/reply-templates";
import { PACKAGES } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { SERVICE_PAGES } from "@/lib/services";
import {
  answerCallbackQuery,
  editMessageText,
  escapeHtml,
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

function miniAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return siteUrl("/tg");
}

function mainKeyboard(admin = false) {
  const rows: {
    text: string;
    callback_data?: string;
    url?: string;
    web_app?: { url: string };
  }[][] = [
    [
      {
        text: "📱 Приложение",
        web_app: { url: miniAppUrl() },
      },
      { text: "🚀 Заявка", callback_data: "order" },
    ],
    [
      { text: "🛠 Услуги", callback_data: "services" },
      { text: "💰 Пакеты", callback_data: "packages" },
    ],
    [
      { text: "⚡ Демо за 1 день", callback_data: "speed" },
      { text: "🎮 Попробовать демо", callback_data: "demos" },
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
  const privacy = siteUrl("/privacy");
  await sendMessage(
    chatId,
    [
      head.trimEnd(),
      "",
      `Отправляя данные, вы соглашаетесь с <a href="${privacy}">политикой конфиденциальности</a>.`,
      "",
      "Как к вам обращаться? <b>Напишите имя:</b>",
    ].join("\n"),
    { reply_markup: cancelKeyboard() }
  );
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  void maybePingSla(4).catch((err) =>
    console.error("[bot-sla]", err)
  );
  void maybePingSla24().catch((err) =>
    console.error("[bot-sla-24]", err)
  );
  void flushCrmQueue().catch((err) =>
    console.error("[bot-crm] flush", err)
  );
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
    if (session?.type === "note") {
      if (text === "/cancel" || text === "отмена") {
        clearSession(userId);
        await sendMessage(chatId, "Заметка отменена.", {
          reply_markup: adminKeyboard(),
        });
        return;
      }
      const lead = addLeadNote(session.leadId, text, userId);
      clearSession(userId);
      await sendMessage(
        chatId,
        lead
          ? `📝 Заметка сохранена · <code>${escapeHtml(lead.id)}</code>`
          : "Заявка не найдена.",
        {
          reply_markup: lead
            ? leadNotifyMarkup(lead)
            : adminKeyboard(),
        }
      );
      return;
    }
    if (session?.type === "find") {
      if (text === "/cancel" || text === "отмена") {
        clearSession(userId);
        await sendMessage(chatId, "Поиск отменён.", {
          reply_markup: adminKeyboard(),
        });
        return;
      }
      clearSession(userId);
      const hits = searchLeads(text, 8);
      await sendMessage(chatId, formatSearchResults(hits, text), {
        reply_markup: hits.length
          ? leadsManageKeyboard(hits)
          : adminKeyboard(),
      });
      return;
    }
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

  await notifyAdmins(notify, {
    reply_markup: questionNotifyMarkup(chatId),
  });
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
  if (payload.kind === "estimate") {
    await startOrder(
      chatId,
      `estimate_${payload.packageId}`,
      payload.summary + "\n\nОформим заявку с этой оценкой."
    );
    return;
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
  if (payload.kind === "demos") {
    await sendMessage(chatId, demosMenuText(), {
      reply_markup: demosMenuKeyboard(),
    });
    return;
  }
  if (payload.kind === "demo") {
    await sendMessage(chatId, demoIntro(payload.demo), {
      reply_markup: demoKeyboard(payload.demo),
    });
    return;
  }
  if (payload.kind === "support") {
    const body = packageText("support");
    if (body) {
      await sendMessage(chatId, body, {
        reply_markup: packageKeyboard("support"),
      });
      return;
    }
  }
  if (payload.kind === "lead") {
    const lead = findLeadByIdPrefix(payload.id) || getLead(payload.id);
    if (!lead) {
      await sendMessage(
        chatId,
        "Заявка не найдена. Можете оформить новую:",
        { reply_markup: mainKeyboard(isAdmin(userId)) }
      );
      return;
    }
    await sendMessage(
      chatId,
      [
        "<b>Заявка с сайта</b>",
        `ID: <code>${escapeHtml(lead.id)}</code>`,
        `Статус: ${STATUS_LABEL[lead.status]}`,
        "",
        `👤 ${escapeHtml(lead.name)}`,
        `📱 ${escapeHtml(lead.contact)}`,
        "",
        escapeHtml(lead.task.slice(0, 800)),
        "",
        "Мы уже получили её. Можете дополнить вопрос или ждать ответа.",
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💬 Задать вопрос", callback_data: "ask" }],
            [{ text: "⬅️ Меню", callback_data: "menu" }],
          ],
        },
      }
    );
    return;
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

function clampScore(n: number) {
  return Math.max(0, Math.min(10, n));
}

function scoreUrgency(urgency: string): number {
  const u = urgency.toLowerCase();
  if (/asap|скорее|сегодня/.test(u)) return 3;
  if (/week|недел/.test(u)) return 2;
  return 1;
}

function scoreBudget(budget: string): number {
  const b = budget.toLowerCase().replace(/\s+/g, "");
  if (/100/.test(b)) return 3;
  if (/50.?100|80/.test(b)) return 2;
  if (/20.?50|35/.test(b)) return 2;
  if (/до20|15/.test(b)) return 1;
  return 1;
}

function qualifyScore(niche: string, urgency: string, budget: string) {
  let score = 0;
  if (niche.trim()) score += 2;
  score += scoreUrgency(urgency);
  score += scoreBudget(budget);
  score = clampScore(score);
  const tag = score >= 7 ? "hot" : score >= 4 ? "warm" : "cold";
  return { score, tag } as const;
}

function thankByTag(tag: "hot" | "warm" | "cold") {
  if (tag === "hot") return "Поставили в приоритет — ответим быстрее.";
  if (tag === "warm") return "Уже смотрим детали.";
  return "Мы получили её и скоро ответим.";
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
    draft.task = text.slice(0, 2000);
    draft.step = "niche";
    setDraft(chatId, draft);
    await sendMessage(
      chatId,
      "Ниша / тип бизнеса? (салон, клиника, доставка, школа, другое — одним словом)",
      { reply_markup: cancelKeyboard() }
    );
    return;
  }

  if (draft.step === "niche") {
    draft.niche = text.slice(0, 120);
    draft.step = "urgency";
    setDraft(chatId, draft);
    await sendMessage(
      chatId,
      "Срочность? (asap / week / month или своими словами)",
      { reply_markup: cancelKeyboard() }
    );
    return;
  }

  if (draft.step === "urgency") {
    draft.urgency = text.slice(0, 120);
    draft.step = "budget";
    setDraft(chatId, draft);
    await sendMessage(
      chatId,
      "Ориентир бюджета? (до 20к / 20–50к / 50–100к / 100к+ / не знаю)",
      { reply_markup: cancelKeyboard() }
    );
    return;
  }

  if (draft.step === "budget") {
    draft.budget = text.slice(0, 120);
    const niche = (draft.niche || "").trim();
    const urgency = (draft.urgency || "").trim();
    const budget = draft.budget.trim();
    const { score, tag } = qualifyScore(niche, urgency, budget);

    const baseTask = (draft.task || "").trim();
    const task = [
      baseTask,
      "",
      "— Квалификация —",
      `Ниша: ${niche || "—"}`,
      `Срочность: ${urgency || "—"}`,
      `Бюджет: ${budget || "—"}`,
    ]
      .join("\n")
      .slice(0, 3500);

    const name = draft.name || from?.first_name || "Клиент";
    const contact =
      draft.contact || (from?.username ? `@${from.username}` : "—");
    const source = draft.source;
    deleteDraft(chatId);

    await ingestLeadAndNotify({
      chatId,
      name,
      contact,
      task,
      fromId: from?.id,
      username: from?.username,
      source,
      title: "🆕 <b>Заявка из Telegram-бота</b>",
      tags: [tag],
      score,
    });

    await sendMessage(
      chatId,
      [
        "✅ <b>Заявка принята!</b>",
        "",
        thankByTag(tag),
        "Можно также задать вопрос через меню бота.",
      ].join("\n"),
      { reply_markup: mainKeyboard(isAdmin(from?.id)) }
    );
  }
}

async function runBroadcast(adminChatId: number, text: string) {
  const ids = listUserChatIds().filter((id) => id !== adminChatId);
  let ok = 0;
  let fail = 0;
  const safe = escapeHtml(text);
  await sendMessage(adminChatId, `📣 Рассылка началась (${ids.length})…`);
  for (const id of ids) {
    const res = await sendMessage(id, safe);
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

  if (data === "admin:sla") {
    const text = formatSlaReport(4);
    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: adminKeyboard(),
      });
    } else {
      await sendMessage(chatId, text, { reply_markup: adminKeyboard() });
    }
    return;
  }

  if (data === "admin:find") {
    setSession(userId, { type: "find" });
    await sendMessage(
      chatId,
      [
        "<b>🔎 Поиск заявок</b>",
        "Пришлите фрагмент: имя, контакт, тег, id или текст задачи.",
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

  if (data === "admin:digest") {
    const text = [formatWeeklyDigest(), "", formatSlaReport(4)].join("\n\n");
    if (messageId) {
      await editMessageText(chatId, messageId, text, {
        reply_markup: adminKeyboard(),
      });
    } else {
      await sendMessage(chatId, text, { reply_markup: adminKeyboard() });
    }
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
    // Don't block webhook — Telegram may time out on long sends
    void runBroadcast(chatId, body).catch((err) =>
      console.error("[bot] broadcast failed", err)
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
    if (
      parsed.status === "done" &&
      lead.chatId &&
      lead.chatId !== 0 &&
      prev?.status !== "done"
    ) {
      const support = PACKAGES.find((p) => p.id === "support");
      await sendMessage(
        lead.chatId,
        [
          "✅ <b>Заявка закрыта</b>",
          "",
          "Если понадобится сопровождение после релиза — пакет поддержки:",
          support
            ? `<b>${escapeHtml(support.name)}</b> · от ${escapeHtml(support.priceFrom)}`
            : "Сопровождение по retainer.",
        ].join("\n"),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛡 Поддержка",
                  callback_data: "order:pkg_support",
                },
              ],
              [{ text: "⬅️ Меню", callback_data: "menu" }],
            ],
          },
        }
      );
    }
    return;
  }

  if (data.startsWith("ldc:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const id = data.slice(4);
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

  if (data.startsWith("ld:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const id = data.slice(3);
    const lead = getLead(id);
    if (!lead) {
      await sendMessage(chatId, "Заявка не найдена.", {
        reply_markup: adminKeyboard(),
      });
      return;
    }
    await sendMessage(
      chatId,
      [
        "<b>Удалить заявку?</b>",
        `${escapeHtml(lead.name)} · <code>${escapeHtml(lead.id)}</code>`,
      ].join("\n"),
      { reply_markup: leadDeleteConfirmKeyboard(id) }
    );
    return;
  }

  if (data.startsWith("reply:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const parts = data.slice("reply:".length).split(":");
    const target = Number(parts[0]);
    const leadId = parts[1];
    if (!Number.isFinite(target)) return;
    setSession(userId, {
      type: "reply",
      targetChatId: target,
      leadId: leadId || undefined,
    });
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

  if (data.startsWith("note:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const id = data.slice(5);
    if (!getLead(id)) {
      await sendMessage(chatId, "Заявка не найдена.");
      return;
    }
    setSession(userId, { type: "note", leadId: id });
    await sendMessage(
      chatId,
      [
        "<b>📝 Заметка к заявке</b>",
        `<code>${escapeHtml(id)}</code>`,
        "Напишите текст заметки одним сообщением.",
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

  if (data.startsWith("claim:")) {
    if (!isAdmin(userId) || !userId) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const id = data.slice(6);
    const lead = setLeadAssignee(id, userId);
    await sendMessage(
      chatId,
      lead
        ? `🙋 Заявка <code>${escapeHtml(id)}</code> назначена на вас.`
        : "Заявка не найдена.",
      { reply_markup: lead ? leadNotifyMarkup(lead) : adminKeyboard() }
    );
    return;
  }

  if (data.startsWith("snz:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const m = data.match(/^snz:(\d+):([A-Za-z0-9]+)$/);
    if (!m) return;
    const days = Number(m[1]);
    const id = m[2];
    const when = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const lead = setLeadRemindAt(id, when);
    await sendMessage(
      chatId,
      lead
        ? `⏳ Напомню через ${days} д. · <code>${escapeHtml(id)}</code>`
        : "Заявка не найдена.",
      { reply_markup: lead ? leadNotifyMarkup(lead) : adminKeyboard() }
    );
    return;
  }

  if (data.startsWith("tag:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const m = data.match(/^tag:([a-z0-9_-]+):([A-Za-z0-9]+)$/i);
    if (!m) return;
    const lead = addLeadTag(m[2], m[1]);
    await sendMessage(
      chatId,
      lead
        ? `🏷 Тег «${escapeHtml(m[1])}» · <code>${escapeHtml(m[2])}</code>`
        : "Заявка не найдена.",
      { reply_markup: lead ? leadNotifyMarkup(lead) : adminKeyboard() }
    );
    return;
  }

  if (data.startsWith("tpl:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const m = data.match(/^tpl:([a-z0-9_-]+):([A-Za-z0-9]+)$/i);
    if (!m) return;
    const tpl = getReplyTemplate(m[1]);
    const leadId = m[2];
    if (!tpl) {
      await sendMessage(chatId, "Шаблон не найден.");
      return;
    }
    const lead = getLead(leadId);
    if (!lead) {
      await sendMessage(chatId, "Заявка не найдена.");
      return;
    }
    addLeadNote(leadId, `Шаблон: ${tpl.title}`, userId);
    await sendMessage(
      chatId,
      [
        `<b>${escapeHtml(tpl.title)}</b>`,
        `Заявка: <code>${escapeHtml(leadId)}</code>`,
        "",
        escapeHtml(tpl.text),
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📤 Отправить клиенту",
                callback_data: `tplsend:${m[1]}:${leadId}`,
              },
            ],
            [
              {
                text: "💬 Ответить вручную",
                callback_data: `reply:${lead.chatId}:${leadId}`,
              },
            ],
          ],
        },
      }
    );
    return;
  }

  if (data.startsWith("tplsend:")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "Недостаточно прав.");
      return;
    }
    const m = data.match(/^tplsend:([a-z0-9_-]+):([A-Za-z0-9]+)$/i);
    if (!m) return;
    const tpl = getReplyTemplate(m[1]);
    const leadId = m[2];
    if (!tpl) {
      await sendMessage(chatId, "Шаблон не найден.");
      return;
    }
    const lead = getLead(leadId);
    if (!lead) {
      await sendMessage(chatId, "Заявка не найдена.");
      return;
    }
    const sent = await sendMessage(lead.chatId, escapeHtml(tpl.text));
    if (sent.ok) {
      addLeadNote(leadId, `Отправлен шаблон: ${tpl.title}`, userId);
      if (lead.status === "new") {
        updateLeadStatus(leadId, "progress");
      }
      await sendMessage(
        chatId,
        `✅ Шаблон «${escapeHtml(tpl.title)}» отправлен клиенту.`,
        { reply_markup: leadNotifyMarkup(getLead(leadId) || lead) }
      );
    } else {
      await sendMessage(
        chatId,
        "Не удалось отправить клиенту (возможно, бот заблокирован)."
      );
    }
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

  if (data === "demos") {
    const text = demosMenuText();
    const markup = demosMenuKeyboard();
    if (messageId) {
      await editMessageText(chatId, messageId, text, { reply_markup: markup });
    } else {
      await sendMessage(chatId, text, { reply_markup: markup });
    }
    return;
  }

  if (data.startsWith("demo:")) {
    const parts = data.split(":");
    const kindRaw = parts[1] || "";
    if (!isDemoKind(kindRaw)) return;
    const step = parts.slice(2).join(":");
    if (!step) {
      const text = demoIntro(kindRaw);
      const markup = demoKeyboard(kindRaw);
      if (messageId) {
        await editMessageText(chatId, messageId, text, {
          reply_markup: markup,
        });
      } else {
        await sendMessage(chatId, text, { reply_markup: markup });
      }
      return;
    }
    const next = demoStep(kindRaw, step);
    if (!next) return;
    if (messageId) {
      await editMessageText(chatId, messageId, next.text, {
        reply_markup: next.markup,
      });
    } else {
      await sendMessage(chatId, next.text, { reply_markup: next.markup });
    }
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
      preface = `Заявка по пакету <b>${escapeHtml(source.slice(4))}</b>.`;
    }
    if (source.startsWith("svc_")) {
      preface = `Заявка по услуге <b>${escapeHtml(source.slice(4))}</b>.`;
    }
    await startOrder(chatId, source, preface);
  }
}
