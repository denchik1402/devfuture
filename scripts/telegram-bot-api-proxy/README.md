# Telegram Bot API proxy (зарубежный VPS)

Проксирует `https://api.telegram.org` для сайта на FirstByte, где исходящий доступ к Telegram заблокирован.

```text
Пользователь → Telegram → webhook https://devfuture.ru/...  (FirstByte, входящий)
FirstByte → https://tg-proxy.ВАШ_ДОМЕН/bot...  →  api.telegram.org
```

Подробная инструкция — в ответе ассистента и ниже кратко.

## Быстрый старт на зарубежном VPS

```bash
# Node 20+
mkdir -p /opt/tg-proxy && cd /opt/tg-proxy
# скопируйте server.js сюда (из репо scripts/telegram-bot-api-proxy/server.js)

export PROXY_SECRET=$(openssl rand -hex 32)
export ALLOWED_IPS=132.243.16.225   # IP FirstByte
export PORT=8080

# systemd + nginx + certbot — см. полную инструкцию
node server.js
```

На FirstByte в `/var/www/devfuture/.env.local`:

```env
TELEGRAM_API_BASE=https://tg-proxy.ВАШ_ДОМЕН
TELEGRAM_PROXY_SECRET=<тот же PROXY_SECRET>
```

Затем: `pm2 restart devfuture --update-env && npm run tg:set-webhook`
