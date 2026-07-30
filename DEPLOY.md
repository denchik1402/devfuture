# Ручной bootstrap VPS (один раз)

Ежедневный деплой — только через GitHub: **[CICD.md](./CICD.md)**.

Этот файл — запасной вариант, если `bootstrap-server.sh` недоступен.

```bash
ssh root@132.243.16.225
export REPO_URL="https://github.com/ВАШ_ЛОГИН/devfuture.git"
# предпочтительно:
bash /var/www/devfuture/scripts/bootstrap-server.sh
# или:
curl -fsSL "https://raw.githubusercontent.com/ВАШ_ЛОГИН/devfuture/main/scripts/bootstrap-server.sh" | bash
```

Потом:

```bash
nano /var/www/devfuture/.env.local   # TELEGRAM_* и username
certbot --nginx -d devfuture.ru -d www.devfuture.ru
cd /var/www/devfuture && npm run tg:set-webhook
```

Обновление вручную (обычно не нужно):

```bash
cd /var/www/devfuture && bash scripts/deploy.sh
```

## Бэкап данных бота (`.data`)

Заявки и пользователи бота лежат в `/var/www/devfuture/.data`. Деплой каталог не затирает, но нужен cron-бэкап:

```bash
chmod +x /var/www/devfuture/scripts/backup-bot-data.sh
# ежедневно в 03:15
crontab -e
# 15 3 * * * /var/www/devfuture/scripts/backup-bot-data.sh >> /var/log/devfuture-backup.log 2>&1
```

Архивы: `/var/backups/devfuture/bot-data-*.tar.gz` (хранятся 14 дней по умолчанию).

Проверка живости после деплоя:

```bash
curl -sS https://devfuture.ru/api/health
```

Ожидаем `"ok":true`, `telegramToken`, `dataWritable`.

CRM (опционально): задайте `LEADS_WEBHOOK_URL` в `.env.local` (Make/Zapier/Sheets) — см. `.env.example` и **[OPS.md](./OPS.md)** (пошагово cron + webhook). Цели Метрики: `METRIKA.md`.
