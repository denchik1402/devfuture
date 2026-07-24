# Деплой DevFuture на VPS (Ubuntu) — вручную

Краткая шпаргалка. Полный CI/CD с GitHub и FirstByte (IP `132.243.16.225`, домен `devfuture.ru`): см. **[CICD.md](./CICD.md)**.

## Что понадобится

- VPS (Ubuntu 22.04+), от 1 GB RAM
- Домен, DNS A-запись на IP сервера
- Доступ по SSH
- Токен бота от [@BotFather](https://t.me/BotFather)
- Ваш `TELEGRAM_CHAT_ID` (число)
- `TELEGRAM_WEBHOOK_SECRET` (обязателен на проде)

> С локального ПК у вас `api.telegram.org` может быть заблокирован.
> На нормальном зарубежном VPS API Telegram обычно доступен.

---

## 1. Подготовка сервера

```bash
ssh root@132.243.16.225

apt update && apt upgrade -y
apt install -y git curl nginx certbot python3-certbot-nginx

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

npm install -g pm2
```

---

## 2. Загрузить проект

### Вариант A — через Git (удобнее)

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/ВАШ_ЛОГИН/devfuture.git
cd devfuture
```

### Вариант B — архивом

На ПК (из корня проекта):

```powershell
tar --exclude=node_modules --exclude=.next -czf devfuture.tgz .
scp -i $env:USERPROFILE\.ssh\devfuture_deploy devfuture.tgz root@132.243.16.225:/var/www/
```

На сервере:

```bash
mkdir -p /var/www/devfuture && cd /var/www/devfuture
tar -xzf /var/www/devfuture.tgz
```

---

## 3. Переменные окружения

```bash
cd /var/www/devfuture
cp .env.example .env.local
nano .env.local
```

```bash
NEXT_PUBLIC_SITE_URL=https://devfuture.ru
NEXT_PUBLIC_TELEGRAM_USERNAME=ваш_ник
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/ваш_ник
NEXT_PUBLIC_EMAIL=hello@devfuture.ru

TELEGRAM_BOT_TOKEN=токен_от_BotFather
TELEGRAM_CHAT_ID=ваш_числовой_id
TELEGRAM_WEBHOOK_SECRET=openssl_rand_hex_32

NEXT_PUBLIC_YANDEX_METRIKA_ID=
NEXT_PUBLIC_YANDEX_WEBVISOR=false
FORMSPREE_ID=
```

```bash
chmod 600 .env.local
```

---

## 4. Сборка и запуск

```bash
cd /var/www/devfuture
npm ci
npm run build
pm2 start npm --name devfuture -- start
pm2 save
pm2 startup
```

Или одним скриптом после клона:

```bash
bash scripts/deploy.sh
```

---

## 5. Nginx + HTTPS

```bash
nano /etc/nginx/sites-available/devfuture
```

```nginx
server {
    listen 80;
    server_name devfuture.ru www.devfuture.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/devfuture /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d devfuture.ru -d www.devfuture.ru
```

---

## 6. Telegram webhook

```bash
cd /var/www/devfuture
npm run tg:set-webhook
```

Проверка: `curl https://devfuture.ru/api/telegram/webhook`

---

## Обновление

С GitHub Actions — автоматически после push в `main` (см. CICD.md).

Вручную:

```bash
cd /var/www/devfuture
bash scripts/deploy.sh
```

---

## Частые проблемы

| Проблема | Что сделать |
|----------|-------------|
| Бот молчит на /start | `npm run tg:set-webhook` + секрет в `.env.local` |
| Webhook 500 | Нет `TELEGRAM_WEBHOOK_SECRET` на проде |
| `setWebhook` timeout | Сервер не достучится до api.telegram.org |
| Заявки с сайта не приходят | `TELEGRAM_CHAT_ID` / токен; смотрите `pm2 logs` |
| 502 Bad Gateway | `pm2 status` / `pm2 logs devfuture` |
| 429 на форме | Rate limit: 5 заявок / 15 мин с одного IP |
