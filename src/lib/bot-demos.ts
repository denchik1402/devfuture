import { escapeHtml } from "@/lib/telegram";

export type DemoKind = "booking" | "shop";

export function isDemoKind(v: string): v is DemoKind {
  return v === "booking" || v === "shop";
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
      [{ text: "⬅️ Меню", callback_data: "menu" }],
    ],
  };
}
