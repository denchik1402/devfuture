export type DemoStatusStep = {
  label: string;
  done: boolean;
};

export type DemoStatusOrder = {
  token: string;
  title: string;
  statusLabel: string;
  steps: DemoStatusStep[];
  updatedAt: string;
};

export const DEMO_STATUS_ORDERS: DemoStatusOrder[] = [
  {
    token: "demo-alpha",
    title: "Заявка #A-1042 · запись в салон",
    statusLabel: "Подтверждена",
    updatedAt: "2026-07-28T14:20:00+03:00",
    steps: [
      { label: "Заявка создана", done: true },
      { label: "Админ подтвердил слот", done: true },
      { label: "Напоминание клиенту", done: true },
      { label: "Визит состоялся", done: false },
    ],
  },
  {
    token: "demo-beta",
    title: "Заказ #B-331 · доставка",
    statusLabel: "В пути",
    updatedAt: "2026-07-29T11:05:00+03:00",
    steps: [
      { label: "Оформлен", done: true },
      { label: "Собран на складе", done: true },
      { label: "Передан курьеру", done: true },
      { label: "Доставлен", done: false },
    ],
  },
  {
    token: "demo-gamma",
    title: "Тикет #G-88 · кабинет статусов",
    statusLabel: "В работе",
    updatedAt: "2026-07-30T09:40:00+03:00",
    steps: [
      { label: "Создан менеджером", done: true },
      { label: "Назначен исполнитель", done: true },
      { label: "В работе", done: true },
      { label: "Проверка / закрытие", done: false },
    ],
  },
];

export function getDemoStatus(token: string): DemoStatusOrder | undefined {
  return DEMO_STATUS_ORDERS.find((o) => o.token === token);
}

export function getAllDemoStatusTokens(): string[] {
  return DEMO_STATUS_ORDERS.map((o) => o.token);
}
