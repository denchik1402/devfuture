export const REPLY_TEMPLATES = [
  {
    id: "hello",
    title: "Приветствие",
    text: "Здравствуйте! Получили заявку, коротко уточним задачу и вернёмся с ориентиром по сроку и бюджету.",
  },
  {
    id: "brief",
    title: "Нужен бриф",
    text: "Чтобы оценить точнее, напишите: тип продукта (бот/сайт/кабинет), срок, и 2–3 предложения своими словами. Можно пройти квиз на сайте: https://devfuture.ru/#quiz",
  },
  {
    id: "demo",
    title: "Демо",
    text: "Можем показать демо похожего сценария в Telegram. Откройте бота: https://t.me/dfuture_bot?start=demos — и напишите, какой сценарий ближе.",
  },
  {
    id: "wait",
    title: "На паузе",
    text: "Спасибо, зафиксировали. Вернёмся в оговорённый срок. Если срочность изменилась — напишите сюда.",
  },
  {
    id: "done",
    title: "Закрытие",
    text: "Закрываем заявку на нашей стороне. Если понадобится доработка или сопровождение — напишите, подключим retainer.",
  },
] as const;

export type ReplyTemplateId = (typeof REPLY_TEMPLATES)[number]["id"];

export function getReplyTemplate(id: string) {
  return REPLY_TEMPLATES.find((t) => t.id === id);
}
