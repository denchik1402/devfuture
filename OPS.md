# Ops: cron-бэкап и CRM webhook

## 1. Cron бэкапа `.data` (правильно)

Команда вида `15 3 * * * /path/...` **в обычном shell не работает** — это строка для **crontab**, а не bash.

На сервере:

```bash
chmod +x /var/www/devfuture/scripts/backup-bot-data.sh

# открыть редактор crontab текущего пользователя (обычно root)
crontab -e
```

В файл **добавьте одну строку** (сохраните и выйдите из редактора):

```
15 3 * * * /var/www/devfuture/scripts/backup-bot-data.sh >> /var/log/devfuture-backup.log 2>&1
```

Проверка, что задача записалась:

```bash
crontab -l | grep backup-bot-data
```

Прогнать бэкап вручную сейчас:

```bash
/var/www/devfuture/scripts/backup-bot-data.sh
ls -lh /var/backups/devfuture/
```

---

## 2. `LEADS_WEBHOOK_URL` (Google Sheets через Make)

Сейчас `curl /api/health` показывает `"leadsWebhook": false` — переменная не задана. Код уже умеет слать заявки и статусы; при сбое кладёт их в очередь `.data/crm-queue.json` и ретраит.

### Вариант A — Make.com → Google Sheets (проще всего)

1. Зайдите на [make.com](https://www.make.com), создайте Scenario.
2. Триггер: **Webhooks → Custom webhook** → Create → скопируйте URL (`https://hook.eu2.make.com/...`).
3. Следующий модуль: **Google Sheets → Add a row** (или Update).
4. Сопоставьте поля JSON:
   - `event` — `telegram_lead` или `telegram_lead_status`
   - `id`, `name`, `contact`, `task`, `status`, `source`, `at`, `sentAt`
5. Включите scenario (Scheduling: Immediately).
6. На VPS:

```bash
nano /var/www/devfuture/.env.local
```

Добавьте (без кавычек, один URL):

```
LEADS_WEBHOOK_URL=https://hook.eu2.make.com/ВАШ_ID
```

Сохраните, затем:

```bash
cd /var/www/devfuture && pm2 restart devfuture --update-env
curl -sS https://devfuture.ru/api/health
```

Ожидаете: `"leadsWebhook": true`.

7. Тест: отправьте бриф с сайта → в Make должен появиться execution → строка в Sheets.

### Вариант B — Zapier

Zapier → Catch Hook → Google Sheets Create Spreadsheet Row → URL хука в `LEADS_WEBHOOK_URL` → тот же `pm2 restart`.

### Поля JSON (событие заявки)

```json
{
  "event": "telegram_lead",
  "id": "...",
  "at": "...",
  "status": "new",
  "name": "...",
  "contact": "...",
  "task": "...",
  "source": "contact_form|utm:...",
  "sentAt": "..."
}
```

Статус:

```json
{
  "event": "telegram_lead_status",
  "id": "...",
  "status": "done",
  "prevStatus": "progress",
  "name": "...",
  "chatId": 0,
  "sentAt": "..."
}
```

Очередь ретраев: смотрите `crmQueuePending` в `/api/health` и файл `/var/www/devfuture/.data/crm-queue.json`.

---

## 3. Cron ops (SLA + snooze + digest)

После деплоя добавьте в `.env.local`:

```
CRON_SECRET=сгенерируйте_openssl_rand_hex_24
```

```bash
pm2 restart devfuture --update-env
crontab -e
```

Строки:

```
0 * * * * curl -fsS -H "x-cron-secret: ВАШ_CRON_SECRET" https://devfuture.ru/api/cron/ops >/dev/null
0 10 * * 1 curl -fsS -H "x-cron-secret: ВАШ_CRON_SECRET" "https://devfuture.ru/api/cron/ops?digest=1" >/dev/null
```

Первая — каждый час (SLA + напоминания snooze). Вторая — понедельник 10:00 МСК-сервера (дайджест).

---

## 4. Formspree (опциональный fallback)

Если Telegram недоступен, форма может уйти в Formspree:

```
FORMSPREE_ID=xxxxxxxx
```

в `.env.local` + `pm2 restart`. Это запасной канал, не замена боту.

---

## 5. IndexNow (Yandex)

После деплоя `scripts/deploy.sh` вызывает `npm run seo:indexnow`. Нужны:

1. Файл `public/indexnow-key.txt` — одна строка с ключом (уже в репо как плейсхолдер).
2. В `.env.local` на сервере тот же ключ:

```
INDEXNOW_KEY=ваш_ключ_без_пробелов
```

Сгенерировать ключ: `openssl rand -hex 16`. Положите его и в `public/indexnow-key.txt`, и в `INDEXNOW_KEY`. После `git pull` + деплоя файл должен открываться как `https://devfuture.ru/indexnow-key.txt`.

Ручной прогон: `cd /var/www/devfuture && npm run seo:indexnow`. Без `INDEXNOW_KEY` скрипт тихо пропускается.
