import { escapeHtml } from "@/lib/telegram";

export type DemoKind = "booking" | "shop" | "qualify";

export function isDemoKind(v: string): v is DemoKind {
  return v === "booking" || v === "shop" || v === "qualify";
}

export function demoIntro(kind: DemoKind) {
  if (kind === "booking") {
    return [
      "<b>Демо: бот записи</b>",
      "",
      "Это учебный сценарий — как у салона или клиники.",
      "Выберите услугу:",
    ].join("\n");
  }
  if (kind === "qualify") {
    return [
      "<b>Демо: квалификация лида</b>",
      "",
      "Короткий опрос как на сайте — ниша и бюджет.",
      "Выберите нишу:",
    ].join("\n");
  }
  return [
    "<b>Демо: мини-магазин</b>",
    "",
    "Учебный сценарий витрины в Telegram.",
    "Выберите товар:",
  ].join("\n");
}

export function demoKeyboard(kind: DemoKind) {
  if (kind === "booking") {
    return {
      inline_keyboard: [
        [{ text: "✂️ Стрижка", callback_data: "demo:booking:cut" }],
        [{ text: "💅 Маникюр", callback_data: "demo:booking:nails" }],
        [{ text: "⬅️ Меню", callback_data: "menu" }],
      ],
    };
  }
  if (kind === "qualify") {
    return {
      inline_keyboard: [
        [{ text: "Салон / услуги", callback_data: "demo:qualify:salon" }],
        [{ text: "Магазин / доставка", callback_data: "demo:qualify:shop" }],
        [{ text: "B2B / заявки", callback_data: "demo:qualify:b2b" }],
        [{ text: "⬅️ Меню", callback_data: "menu" }],
      ],
    };
  }
  return {
    inline_keyboard: [
      [{ text: "🎧 Наушники", callback_data: "demo:shop:headphones" }],
      [{ text: "⌨️ Клавиатура", callback_data: "demo:shop:keyboard" }],
      [{ text: "⬅️ Меню", callback_data: "menu" }],
    ],
  };
}

export function demoStep(
  kind: DemoKind,
  step: string
): { text: string; markup: object } | null {
  if (kind === "booking") {
    if (step === "cut" || step === "nails") {
      const label = step === "cut" ? "Стрижка" : "Маникюр";
      return {
        text: [
          `<b>${escapeHtml(label)}</b>`,
          "",
          "Выберите слот:",
        ].join("\n"),
        markup: {
          inline_keyboard: [
            [
              {
                text: "Сегодня 15:00",
                callback_data: `demo:booking:slot:${step}:1500`,
              },
            ],
            [
              {
                text: "Завтра 11:30",
                callback_data: `demo:booking:slot:${step}:1130`,
              },
            ],
            [{ text: "⬅️ Назад", callback_data: "demo:booking" }],
          ],
        },
      };
    }
    if (step.startsWith("slot:")) {
      const parts = step.split(":");
      const service = parts[1] === "nails" ? "Маникюр" : "Стрижка";
      const time = parts[2] === "1130" ? "11:30" : "15:00";
      return {
        text: [
          "✅ <b>Запись создана (демо)</b>",
          "",
          `Услуга: ${escapeHtml(service)}`,
          `Время: ${escapeHtml(time)}`,
          "",
          "Клиент получил бы напоминание, админ — уведомление.",
          "Такой же сценарий собираем под ваш процесс.",
        ].join("\n"),
        markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Хочу такого бота",
                callback_data: "order:demo_booking",
              },
            ],
            [
              { text: "🛒 Другое демо", callback_data: "demo:shop" },
              { text: "⬅️ Меню", callback_data: "menu" },
            ],
          ],
        },
      };
    }
  }

  if (kind === "shop") {
    if (step === "headphones" || step === "keyboard") {
      const label = step === "headphones" ? "Наушники" : "Клавиатура";
      const price = step === "headphones" ? "4 900 ₽" : "7 200 ₽";
      return {
        text: [
          `<b>${escapeHtml(label)}</b> · ${escapeHtml(price)}`,
          "",
          "В реальном боте здесь описание, фото и оплата.",
          "Оформить заказ (демо)?",
        ].join("\n"),
        markup: {
          inline_keyboard: [
            [
              {
                text: "🛒 В корзину",
                callback_data: `demo:shop:cart:${step}`,
              },
            ],
            [{ text: "⬅️ Назад", callback_data: "demo:shop" }],
          ],
        },
      };
    }
    if (step.startsWith("cart:")) {
      const item = step.slice(5) === "keyboard" ? "Клавиатура" : "Наушники";
      return {
        text: [
          "✅ <b>Заказ принят (демо)</b>",
          "",
          `Товар: ${escapeHtml(item)}`,
          "Статус: ожидает оплаты / сборки",
          "",
          "Админ получил бы карточку заказа со статусами.",
          "Сделаем такой поток под вашу витрину.",
        ].join("\n"),
        markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Хочу такой магазин-бот",
                callback_data: "order:demo_shop",
              },
            ],
            [
              { text: "📅 Демо записи", callback_data: "demo:booking" },
              { text: "⬅️ Меню", callback_data: "menu" },
            ],
          ],
        },
      };
    }
  }

  if (kind === "qualify") {
    if (step === "salon" || step === "shop" || step === "b2b") {
      const niche =
        step === "salon"
          ? "Салон / услуги"
          : step === "shop"
            ? "Магазин / доставка"
            : "B2B / заявки";
      return {
        text: [
          `<b>Ниша:</b> ${escapeHtml(niche)}`,
          "",
          "Ориентир по бюджету:",
        ].join("\n"),
        markup: {
          inline_keyboard: [
            [
              {
                text: "15–40 тыс.",
                callback_data: `demo:qualify:budget:${step}:15`,
              },
            ],
            [
              {
                text: "40–100 тыс.",
                callback_data: `demo:qualify:budget:${step}:40`,
              },
            ],
            [
              {
                text: "от 100 тыс.",
                callback_data: `demo:qualify:budget:${step}:100`,
              },
            ],
            [{ text: "⬅️ Назад", callback_data: "demo:qualify" }],
          ],
        },
      };
    }
    if (step.startsWith("budget:")) {
      const parts = step.split(":");
      const nicheKey = parts[1] || "salon";
      const band = parts[2] || "15";
      const niche =
        nicheKey === "shop"
          ? "Магазин"
          : nicheKey === "b2b"
            ? "B2B"
            : "Салон";
      const budget =
        band === "100" ? "от 100 тыс." : band === "40" ? "40–100 тыс." : "15–40 тыс.";
      return {
        text: [
          "✅ <b>Лид квалифицирован (демо)</b>",
          "",
          `Ниша: ${escapeHtml(niche)}`,
          `Бюджет: ${escapeHtml(budget)}`,
          "",
          "Админ получил бы карточку с этими полями и кнопками статусов.",
          "Так же собираем заявки с сайта и Mini App.",
        ].join("\n"),
        markup: {
          inline_keyboard: [
            [
              {
                text: "🚀 Хочу такой опрос",
                callback_data: "order:demo_qualify",
              },
            ],
            [
              { text: "📅 Запись", callback_data: "demo:booking" },
              { text: "⬅️ Меню", callback_data: "menu" },
            ],
          ],
        },
      };
    }
  }

  return null;
}

export function demosMenuText() {
  return [
    "<b>Интерактивные демо</b>",
    "",
    "Потрогайте сценарий как клиент — затем оставьте заявку «такой же под нас».",
  ].join("\n");
}

export function demosMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📅 Запись клиентов", callback_data: "demo:booking" }],
      [{ text: "🛒 Мини-магазин", callback_data: "demo:shop" }],
      [{ text: "🎯 Квалификация лида", callback_data: "demo:qualify" }],
      [{ text: "⬅️ Меню", callback_data: "menu" }],
    ],
  };
}
