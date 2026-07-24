#!/usr/bin/env bash
# One-time bootstrap for FirstByte / any Ubuntu VPS.
# After this, GitHub Actions deploys on every push to main.
#
# Usage (on the server as root):
#   export REPO_URL="https://github.com/ВАШ_ЛОГИН/devfuture.git"
#   # or: export REPO_URL="git@github.com:ВАШ_ЛОГИН/devfuture.git"
#   curl -fsSL https://raw.githubusercontent.com/ВАШ_ЛОГИН/devfuture/main/scripts/bootstrap-server.sh | bash
#   # OR after manual clone:
#   bash /var/www/devfuture/scripts/bootstrap-server.sh
set -euo pipefail

DOMAIN="${DOMAIN:-devfuture.ru}"
APP_DIR="${APP_DIR:-/var/www/devfuture}"
APP_NAME="${APP_NAME:-devfuture}"
REPO_URL="${REPO_URL:-}"
NODE_MAJOR="${NODE_MAJOR:-20}"

echo "==> DevFuture bootstrap ($DOMAIN → $APP_DIR)"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Запустите от root: sudo -i"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y git curl nginx certbot python3-certbot-nginx ufw ca-certificates gnupg

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)" -lt "$NODE_MAJOR" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

npm install -g pm2

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

mkdir -p /var/www
if [[ ! -d "$APP_DIR/.git" ]]; then
  if [[ -z "$REPO_URL" ]]; then
    echo "Задайте REPO_URL, например:"
    echo "  export REPO_URL='https://github.com/USER/devfuture.git'"
    echo "  bash scripts/bootstrap-server.sh"
    exit 1
  fi
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin || true
git checkout main 2>/dev/null || git checkout -b main
git pull --ff-only origin main || true

if [[ ! -f .env.local ]]; then
  SECRET="$(openssl rand -hex 32)"
  cat > .env.local <<EOF
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
NEXT_PUBLIC_TELEGRAM_USERNAME=
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/
NEXT_PUBLIC_EMAIL=hello@${DOMAIN}

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=${SECRET}

NEXT_PUBLIC_YANDEX_METRIKA_ID=
NEXT_PUBLIC_YANDEX_WEBVISOR=false
FORMSPREE_ID=
EOF
  chmod 600 .env.local
  echo "==> создан $APP_DIR/.env.local (допишите TELEGRAM_* и username)"
fi

chmod +x scripts/deploy.sh 2>/dev/null || true

cat > /etc/nginx/sites-available/devfuture <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/devfuture /etc/nginx/sites-enabled/devfuture
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> npm ci + build + pm2"
npm ci
npm run build

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start npm --name "$APP_NAME" -- start
fi
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.sh 2>/dev/null || true
# shellcheck disable=SC1091
bash -c "$(pm2 startup systemd -u root --hp /root | tail -n 1)" || true

echo ""
echo "==> Bootstrap почти готов."
echo "1) Отредактируйте секреты:  nano $APP_DIR/.env.local"
echo "2) Когда DNS A-записи ${DOMAIN} → этот IP уже работают:"
echo "     certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m hello@${DOMAIN} --redirect || certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "3) После заполнения TELEGRAM_*:  cd $APP_DIR && npm run tg:set-webhook"
echo "4) Дальше деплой только через GitHub: git push origin main"
echo ""
pm2 status
