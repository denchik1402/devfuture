# DevFuture

Премиальный лендинг IT-студии: сайты, веб и десктоп, Telegram-боты, автоматизация.

**Прод:** [https://devfuture.ru](https://devfuture.ru) · VPS FirstByte `132.243.16.225`

## Стек

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js
- Lucide Icons

Требуется **Node.js 20+**.

## Запуск локально

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Файл `.env.local` создаётся **в корне проекта** (рядом с `package.json`). Он в `.gitignore` и не попадает в Git.

## Скрипты

| Команда | Назначение |
|---------|------------|
| `npm run dev` | Локальная разработка |
| `npm run build` / `npm start` | Прод-сборка и запуск |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Юнит-тесты |
| `npm run tg:chat-id` | Узнать TELEGRAM_CHAT_ID |
| `npm run tg:set-webhook` | Webhook на прод-домен |
| `npm run tg:menu-button` | Menu button → Mini App (`/tg`) |
| `npm run tg:check` | Диагностика токена / прокси |
| `npm run tg:probe` | Полный прогон Node→прокси→webhook |
| `npm run tg:poll` | Локальный long-poll → webhook |

## Заявки в Telegram-бота

1. [@BotFather](https://t.me/BotFather) → `/newbot` → токен в `TELEGRAM_BOT_TOKEN`
2. Напишите боту `/start`
3. `npm run tg:chat-id` → `TELEGRAM_CHAT_ID`
4. Сгенерируйте секрет: `openssl rand -hex 32` → `TELEGRAM_WEBHOOK_SECRET`
5. Перезапустите `npm run dev`

На проде webhook **обязателен** с секретом. Без `TELEGRAM_WEBHOOK_SECRET` endpoint в production отвечает 500.

## Telegram Mini App

URL: `https://devfuture.ru/tg` (noindex).

1. После деплоя: `npm run tg:menu-button` (или BotFather → Bot Settings → Menu Button → URL)
2. В боте `/start` → кнопка **📱 Приложение**
3. Опционально: `NEXT_PUBLIC_TELEGRAM_MINI_APP_URL=https://devfuture.ru/tg`

## Деплой и CI/CD

- Автодеплой через GitHub (один раз настроить, дальше `git push`): **[CICD.md](./CICD.md)**
- Ручной bootstrap VPS (если нужно): **[DEPLOY.md](./DEPLOY.md)** / `scripts/bootstrap-server.sh`

## Сборка

```bash
npm run build
npm start
```
