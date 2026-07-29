# Telegram Bot API proxy — полная инструкция

Прокси для сайта на FirstByte (`devfuture.ru`), где исходящий доступ к
`api.telegram.org` заблокирован. Webhook по-прежнему принимает Telegram на
FirstByte; исходящие `sendMessage` / `setWebhook` идут через зарубежный VPS.

## Что понадобится

1. Зарубежный VPS (NL/DE/FI и т.п.), где работает:
   `curl -4 --max-time 10 https://api.telegram.org` → не таймаут
2. Поддомен, например `tg-proxy.ВАШ_ДОМЕН` → A-запись на IP зарубежного VPS
   (можно взять отдельный дешёвый домен только под прокси)
3. IP FirstByte: `132.243.16.225` (проверьте: на FirstByte `curl -4 ifconfig.me`)

Файлы в этом каталоге:
- `server.js` — прокси
- `tg-proxy.service` — systemd
- `nginx.tg-proxy.conf` — nginx

---

## Часть A. Зарубежный VPS

### A1. Система

```bash
ssh root@IP_ЗАРУБЕЖНОГО_VPS

apt update && apt install -y nginx certbot python3-certbot-nginx curl
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
```

Проверка Telegram:

```bash
curl -4 -sS --max-time 15 https://api.telegram.org | head -c 200
# должно ответить быстро (HTML/JSON), не timeout
```

### A2. Код прокси

С ПК (из папки проекта), подставьте IP:

```powershell
scp D:\razrabotka\DevFuture\scripts\telegram-bot-api-proxy\server.js root@IP_ЗАРУБЕЖНОГО:/opt/tg-proxy/server.js
```

Или на VPS:

```bash
mkdir -p /opt/tg-proxy
# вставьте содержимое server.js (nano /opt/tg-proxy/server.js)
```

### A3. Секрет и .env

```bash
cd /opt/tg-proxy
SECRET=$(openssl rand -hex 32)
echo "PROXY_SECRET=$SECRET"
# СОХРАНИТЕ SECRET — он же пойдёт на FirstByte как TELEGRAM_PROXY_SECRET

cat > /opt/tg-proxy/.env <<EOF
PORT=8080
PROXY_SECRET=$SECRET
ALLOWED_IPS=132.243.16.225
WEBHOOK_RELAY_URL=https://devfuture.ru/api/telegram/webhook
EOF
chmod 600 /opt/tg-proxy/.env
```

Если у FirstByte другой исходящий IP — узнайте `curl -4 ifconfig.me` на FirstByte и впишите его.

### A4. systemd

```bash
cat > /etc/systemd/system/tg-proxy.service <<'EOF'
[Unit]
Description=DevFuture Telegram Bot API proxy
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/tg-proxy
EnvironmentFile=/opt/tg-proxy/.env
ExecStart=/usr/bin/node /opt/tg-proxy/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now tg-proxy
systemctl status tg-proxy --no-pager
curl -sS http://127.0.0.1:8080/health
# {"ok":true,"service":"telegram-bot-api-proxy"}
```

### A5. DNS

В панели DNS домена:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `tg-proxy` | IP зарубежного VPS |

Подождите 1–5 минут. Проверка: `ping tg-proxy.ВАШ_ДОМЕН`

### A6. nginx + HTTPS

```bash
cat > /etc/nginx/sites-available/tg-proxy <<EOF
server {
    listen 80;
    server_name tg-proxy.ВАШ_ДОМЕН;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        client_max_body_size 20m;
    }
}
EOF

ln -sf /etc/nginx/sites-available/tg-proxy /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

certbot --nginx -d tg-proxy.ВАШ_ДОМЕН
```

### A7. Проверка прокси с секретом

На зарубежном VPS (подставьте SECRET и TOKEN бота):

```bash
curl -4 -sS --max-time 20 \
  -H "X-Telegram-Proxy-Secret: ВАШ_SECRET" \
  "https://tg-proxy.ВАШ_ДОМЕН/botВАШ_ТОКЕН/getMe"
```

Ожидается `"ok":true` и username бота. Без заголовка — `403`.

---

## Часть B. FirstByte (devfuture.ru)

### B1. Env

```bash
ssh root@132.243.16.225
nano /var/www/devfuture/.env.local
```

Добавьте / поправьте:

```env
NEXT_PUBLIC_SITE_URL=https://devfuture.ru
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_WEBHOOK_SECRET=...

TELEGRAM_API_BASE=https://tg-proxy.ВАШ_ДОМЕН
TELEGRAM_PROXY_SECRET=тот_же_SECRET_что_на_прокси
TELEGRAM_WEBHOOK_URL=https://tg-proxy.ВАШ_ДОМЕН/webhook
```

Без слэша в конце `TELEGRAM_API_BASE`. `TELEGRAM_WEBHOOK_URL` нужен, если Telegram не достучится до FirstByte напрямую.

### B2. Деплой кода с поддержкой прокси

Нужен коммит с `TELEGRAM_PROXY_SECRET` в клиенте (уже в репо). На сервере:

```bash
cd /var/www/devfuture
git fetch origin && git reset --hard origin/main
# или дождитесь GitHub Actions
bash scripts/deploy.sh
```

Либо вручную:

```bash
pm2 restart devfuture --update-env
npm run tg:check
npm run tg:set-webhook
```

`tg:check` должен показать `Bot OK`.  
`tg:set-webhook` — URL `https://devfuture.ru/api/telegram/webhook`.

### B2.1. Mini App menu button

```bash
npm run tg:menu-button
# Menu button → https://devfuture.ru/tg
```

Либо в BotFather: Bot Settings → Menu Button → `https://devfuture.ru/tg`.

### B3. Тест бота

Напишите боту `/start`. Должны появиться кнопки.

Проверка с FirstByte без скриптов:

```bash
curl -4 -sS --max-time 20 \
  -H "X-Telegram-Proxy-Secret: ВАШ_SECRET" \
  "https://tg-proxy.ВАШ_ДОМЕН/bot$TELEGRAM_BOT_TOKEN/getMe"
# токен лучше взять из .env.local, не светить в history
```

---

## Часть C. Если что-то не работает

| Симптом | Что проверить |
|--------|----------------|
| `403` от прокси | Неверный `TELEGRAM_PROXY_SECRET` или IP не в `ALLOWED_IPS` |
| `502` от прокси | На зарубежном VPS нет доступа к Telegram (`curl api.telegram.org`) |
| `tg:check` timeout | На FirstByte не задан `TELEGRAM_API_BASE` или nginx/DNS прокси |
| Webhook ok, бот молчит | `getWebhookInfo` → `Connection timed out` = Telegram не достучится до FirstByte |
| `Connection timed out` на webhook | Включите relay: `WEBHOOK_RELAY_URL` на прокси + `TELEGRAM_WEBHOOK_URL=…/webhook` |
| `ALLOWED_IPS` режет | На FirstByte: `curl -4 ifconfig.me` — сравнить с `.env` прокси |

### Relay webhook (когда Telegram → FirstByte timeout)

На зарубежном VPS в `/opt/tg-proxy/.env` добавьте:

```env
WEBHOOK_RELAY_URL=https://devfuture.ru/api/telegram/webhook
```

Обновите `server.js`, затем:

```bash
systemctl restart tg-proxy
curl -sS http://127.0.0.1:8080/health
# webhookRelay:true
```

На FirstByte в `.env.local`:

```env
TELEGRAM_WEBHOOK_URL=https://tg-proxy.ВАШ_ДОМЕН/webhook
```

```bash
pm2 restart devfuture --update-env
npm run tg:set-webhook
```

Цепочка: Telegram → зарубежный VPS `/webhook` → FirstByte `/api/telegram/webhook` → ответ через Bot API proxy.

Логи прокси:

```bash
journalctl -u tg-proxy -f
```

---

## Безопасность

- Прокси слушает только `127.0.0.1:8080`, снаружи — nginx HTTPS
- Обязателен заголовок `X-Telegram-Proxy-Secret`
- Желателен `ALLOWED_IPS` = IP FirstByte
- Не коммитьте `.env` прокси в Git
