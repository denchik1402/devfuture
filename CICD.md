# CI/CD: GitHub → FirstByte VPS (devfuture.ru)

Пошаговая инструкция: от панели [FirstByte](https://firstbyte.ru/) до автоматического деплоя при каждом
`git push` в `main`. Целевые данные:

| Параметр | Значение |
|----------|----------|
| IP сервера | `132.243.16.225` |
| Домен | `devfuture.ru` (+ `www.devfuture.ru`) |
| Хостинг | [FirstByte](https://firstbyte.ru/) (VPS/VDS) |
| Биллинг | [https://billing.firstbyte.ru/](https://billing.firstbyte.ru/) |
| Путь на сервере | `/var/www/devfuture` |
| Процесс | PM2 (`devfuture`) + Nginx + Certbot |

Итоговая схема:

```text
Вы правите код → push в main → GitHub Actions (lint/test/build)
  → если OK → SSH на 132.243.16.225 → git pull → npm ci → build → pm2 restart
```

---

## Часть 0. Что должно быть готово

1. Аккаунт [FirstByte](https://billing.firstbyte.ru/) и VPS с IP `132.243.16.225`.
2. Домен `devfuture.ru` (у вас уже арендован — у FirstByte или другого регистратора).
3. Аккаунт [GitHub](https://github.com/).
4. На ПК: Git, Node.js 20+, SSH-клиент (в Windows 10/11 OpenSSH обычно уже есть).
5. Токен Telegram-бота от [@BotFather](https://t.me/BotFather).

Проверка SSH с вашего ПК (PowerShell или Terminal):

```powershell
ssh root@132.243.16.225
```

Если спрашивает пароль — возьмите root-пароль из биллинга FirstByte (кнопка **«Инструкция»** у сервера; пароль также приходит на почту при активации). После первого входа лучше перейти на ключи (часть 3).

---

## Часть 1. FirstByte: сервер и доступ

### 1.1. Открыть сервер в биллинге

1. Откройте браузер → [https://billing.firstbyte.ru/](https://billing.firstbyte.ru/).
2. Войдите (логин — email, указанный при регистрации).
3. В левом меню откройте **«Виртуальные серверы»** (раздел товаров / услуг).
4. Найдите сервер с IP **132.243.16.225** и выделите его в списке.
5. Сверху на панели инструментов нажмите **«Инструкция»** — там:
   - IP-адрес,
   - логин (обычно `root`),
   - root-пароль,
   - ссылка/кнопка в панель **VMmanager**.
6. Либо нажмите **«Перейти»** — откроется **VMmanager** (управление ВМ: старт/стоп/перезапуск/VNC/переустановка ОС).

Запомните:

- ОС (нужна Ubuntu 22.04 или 24.04; если другая — в VMmanager можно **«Переустановить»**),
- логин `root`,
- пароль из **Инструкции**.

Официальная шпаргалка по кабинету: [firstbyte.ru/info/lichnij-kabinet](https://firstbyte.ru/info/lichnij-kabinet/).

### 1.2. Консоль, если SSH не пускает

1. В биллинге: **Виртуальные серверы** → ваш сервер → **Перейти** (VMmanager).
2. **Управление** → **Виртуальные машины** → выберите ВМ.
3. Для KVM: кнопка **VNC** (консоль в браузере).
4. Для OVZ: часто есть пункт **SSH** (браузерная консоль).
5. Войдите как `root` с паролем из **Инструкции** и продолжайте настройку уже по SSH с ПК.

### 1.3. Порты

Нужны входящие:

| Порт | Зачем |
|------|--------|
| **22** | SSH (деплой и админка) |
| **80** | HTTP (редирект на HTTPS + Certbot) |
| **443** | HTTPS (сайт) |

**Не** открывайте порт `3000` в интернет — сайт должен идти только через Nginx.

У FirstByte отдельного «security group» как у облаков часто нет: порты слушает сам сервер (UFW на Ubuntu — см. часть 4). Если заказывали доп. файрвол / фильтр в панели — разрешите 22/80/443.

---

## Часть 2. DNS для devfuture.ru

DNS настраивается **там, где куплен домен** (регистратор) **или** в DNS-хостинге FirstByte, если вы его заказали и делегировали NS:

- `ns1.firstbytedns.net`
- `ns2.firstbytedns.net`
- `ns3.firstbytedns.net`

### 2.1. Куда заходить

**Вариант A — DNS у регистратора домена**

1. Личный кабинет регистратора `devfuture.ru`.
2. Зона `devfuture.ru` → **DNS-записи** / **Управление зоной**.

**Вариант B — DNS-хостинг FirstByte**

1. [https://billing.firstbyte.ru/](https://billing.firstbyte.ru/) → **DNS хостинг** (или товар DNS).
2. Откройте панель DNSmanager (часто через **Перейти** / **Инструкция**).
3. **Доменные имена** → зона `devfuture.ru` (если нет — **Создать**, укажите домен и IP `132.243.16.225`).
4. Раздел **Записи**.

У регистратора NS должны указывать на FirstByte NS (см. выше), иначе записи в DNSmanager не будут действовать.

### 2.2. Какие записи создать

| Тип | Имя / Host | Значение | TTL |
|-----|------------|----------|-----|
| **A** | `@` (или пусто / `devfuture.ru`) | `132.243.16.225` | 300–3600 |
| **A** | `www` | `132.243.16.225` | 300–3600 |

Сохраните. Проверка с ПК (через 5–30 минут, иногда до 24 ч):

```powershell
nslookup devfuture.ru
nslookup www.devfuture.ru
```

Оба должны показать `132.243.16.225`.

---

## Часть 3. SSH-ключ для GitHub Actions (обязательно)

Парольный SSH из Actions неудобен и менее безопасен. Сделайте отдельный ключ только для деплоя.

### 3.1. На вашем Windows-ПК

В PowerShell:

```powershell
# Папка для ключей (если нет)
mkdir $env:USERPROFILE\.ssh -Force

# Ключ БЕЗ пароля (Actions не умеет интерактивно вводить passphrase)
ssh-keygen -t ed25519 -C "github-actions-devfuture" -f "$env:USERPROFILE\.ssh\devfuture_deploy" -N ""
```

Получите два файла:

- `C:\Users\<Вы>\.ssh\devfuture_deploy` — **приватный** (пойдёт в GitHub Secrets)
- `C:\Users\<Вы>\.ssh\devfuture_deploy.pub` — **публичный** (пойдёт на сервер)

### 3.2. Публичный ключ на сервер

```powershell
type $env:USERPROFILE\.ssh\devfuture_deploy.pub
```

Скопируйте всю строку `ssh-ed25519 AAAA...`.

Подключитесь к серверу:

```powershell
ssh root@132.243.16.225
```

На сервере:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

Вставьте публичный ключ **новой строкой** в конец файла.  
Сохранить в nano: `Ctrl+O` → Enter → `Ctrl+X`.

```bash
chmod 600 ~/.ssh/authorized_keys
exit
```

Проверка с ПК (должен пустить **без пароля**):

```powershell
ssh -i $env:USERPROFILE\.ssh\devfuture_deploy root@132.243.16.225
```

---

## Часть 4. Первый ручной деплой на сервер (база)

Пока CI/CD не настроен, поднимите сайт один раз руками.

### 4.1. Установка ПО на сервере

```bash
ssh -i $env:USERPROFILE\.ssh\devfuture_deploy root@132.243.16.225
```

Дальше все команды — **на сервере**:

```bash
apt update && apt upgrade -y
apt install -y git curl nginx certbot python3-certbot-nginx ufw

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # должно быть v20.x

npm install -g pm2

# Файрвол на самом Ubuntu (UFW)
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status
```

### 4.2. Клонировать репозиторий

Сначала создайте репозиторий на GitHub (часть 5) и запушьте код. Затем:

```bash
mkdir -p /var/www
cd /var/www

# HTTPS-клон (публичный репозиторий):
git clone https://github.com/ВАШ_ЛОГИН/devfuture.git

# Если репозиторий приватный — лучше Deploy Key или HTTPS + PAT.
# Пример с SSH (если настроите deploy key):
# git clone git@github.com:ВАШ_ЛОГИН/devfuture.git

cd /var/www/devfuture
```

> Имя папки должно быть `devfuture`, путь — `/var/www/devfuture` (так зашито в workflow).

### 4.3. Файл окружения

```bash
cd /var/www/devfuture
cp .env.example .env.local
nano .env.local
```

Минимальный прод-конфиг:

```bash
NEXT_PUBLIC_SITE_URL=https://devfuture.ru
NEXT_PUBLIC_TELEGRAM_USERNAME=ваш_ник
NEXT_PUBLIC_TELEGRAM_URL=https://t.me/ваш_ник
NEXT_PUBLIC_EMAIL=hello@devfuture.ru

TELEGRAM_BOT_TOKEN=токен_от_BotFather
TELEGRAM_CHAT_ID=ваш_числовой_id

# ОБЯЗАТЕЛЬНО на проде:
TELEGRAM_WEBHOOK_SECRET=вставьте_случайную_строку

NEXT_PUBLIC_YANDEX_METRIKA_ID=
NEXT_PUBLIC_YANDEX_WEBVISOR=false
FORMSPREE_ID=
```

Секрет можно сгенерировать на сервере:

```bash
openssl rand -hex 32
```

Вставьте результат в `TELEGRAM_WEBHOOK_SECRET`. Сохраните файл.

Права:

```bash
chmod 600 /var/www/devfuture/.env.local
```

### 4.4. Сборка и PM2

```bash
cd /var/www/devfuture
npm ci
npm run build
pm2 start npm --name devfuture -- start
pm2 save
pm2 startup
# Скопируйте и выполните команду, которую выведет pm2 startup
pm2 status
```

Сайт слушает `127.0.0.1:3000`.

### 4.5. Nginx

```bash
nano /etc/nginx/sites-available/devfuture
```

Вставьте:

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

Включите сайт:

```bash
ln -sf /etc/nginx/sites-available/devfuture /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 4.6. HTTPS (Let's Encrypt)

DNS A-записи уже должны указывать на сервер.

```bash
certbot --nginx -d devfuture.ru -d www.devfuture.ru
```

Ответьте:

1. Email — ваш для уведомлений о сроке сертификата.
2. Agree to ToS — `Y`.
3. Share email — по желанию `N`.
4. Redirect HTTP→HTTPS — выберите **2** (Redirect).

Проверка:

- Браузер: `https://devfuture.ru`
- `pm2 logs devfuture`

### 4.7. Telegram webhook

```bash
cd /var/www/devfuture
npm run tg:set-webhook
```

Должно быть `"ok": true`. В Telegram боту: `/start` — появятся кнопки.

---

## Часть 5. GitHub: репозиторий и Secrets

### 5.1. Создать репозиторий

1. Откройте [https://github.com/new](https://github.com/new).
2. **Repository name**: например `devfuture`.
3. Visibility: **Private** (рекомендуется) или Public.
4. **Не** ставьте галочки «Add README / .gitignore / license» — код уже есть локально.
5. Нажмите **Create repository**.

### 5.2. Запушить код с ПК

В PowerShell в папке проекта `D:\razrabotka\DevFuture`:

```powershell
cd D:\razrabotka\DevFuture

git status
git remote -v

# Если remote ещё нет:
git remote add origin https://github.com/ВАШ_ЛОГИН/devfuture.git

# Если ветка не main:
git branch -M main

git add .
git commit -m "Prepare production CI/CD and hardening"
git push -u origin main
```

GitHub попросит авторизацию (браузер / Personal Access Token).

### 5.3. Secrets для деплоя

1. Откройте репозиторий на GitHub.
2. Вкладка **Settings** (сверху).
3. Слева: **Secrets and variables** → **Actions**.
4. Кнопка **New repository secret** — создайте три секрета:

#### Secret `SSH_HOST`

- Name: `SSH_HOST`
- Secret: `132.243.16.225`
- **Add secret**

#### Secret `SSH_USER`

- Name: `SSH_USER`
- Secret: `root`  
  (или другой пользователь, если не root)
- **Add secret**

#### Secret `SSH_PRIVATE_KEY`

1. На ПК откройте **приватный** ключ:

```powershell
Get-Content $env:USERPROFILE\.ssh\devfuture_deploy -Raw
```

2. Скопируйте **весь** текст, включая строки:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

3. Name: `SSH_PRIVATE_KEY`
4. Вставьте содержимое → **Add secret**

> В Secrets **не** кладите `.env.local`, токен бота и т.п. — они живут только на сервере в `/var/www/devfuture/.env.local`.

### 5.4. Права Actions (для workflow_run)

1. **Settings** → **Actions** → **General**.
2. **Workflow permissions**: выберите **Read and write permissions** (или хотя бы Read для contents; для нашего SSH-deploy достаточно Read).
3. Сохраните **Save**.

Убедитесь, что Actions включены: **Allow all actions and reusable workflows**.

---

## Часть 6. Что уже лежит в репозитории

| Файл | Назначение |
|------|------------|
| `.github/workflows/ci.yml` | На каждый push/PR в `main`: lint, test, typecheck, build |
| `.github/workflows/deploy.yml` | После успешного CI на `main` — SSH и `scripts/deploy.sh` |
| `scripts/deploy.sh` | `git pull` → `npm ci` → `build` → `pm2 restart` → webhook |

Ручной деплой на сервере (если нужно без GitHub):

```bash
cd /var/www/devfuture
bash scripts/deploy.sh
```

---

## Часть 7. Проверка CI/CD end-to-end

1. Сделайте мелкое изменение локально (например пробел в README).
2. Закоммитьте и запушьте:

```powershell
git add .
git commit -m "chore: trigger deploy"
git push
```

3. На GitHub: вкладка **Actions**.
4. Сначала должен пройти workflow **CI** (зелёная галочка).
5. Затем стартует **Deploy**.
6. Откройте Deploy → job → лог SSH: должны быть `git pull`, `npm ci`, `build`, `pm2 restart`.
7. Откройте `https://devfuture.ru` — изменение на месте.

Ручной запуск деплоя без push:

1. **Actions** → **Deploy** → **Run workflow** → **Run workflow**.

---

## Часть 8. Приватный репозиторий: доступ сервера к GitHub

Если `git clone` / `git pull` на сервере просит пароль:

### Вариант A — Deploy Key (рекомендуется)

На сервере:

```bash
ssh-keygen -t ed25519 -C "vps-devfuture-ro" -f /root/.ssh/github_devfuture -N ""
cat /root/.ssh/github_devfuture.pub
```

На GitHub:

1. Репозиторий → **Settings** → **Deploy keys** → **Add deploy key**.
2. Title: `firstbyte-vps`.
3. Key: вставьте `.pub`.
4. **Allow write access** — **не** включать (достаточно read).
5. **Add key**.

На сервере `~/.ssh/config`:

```bash
nano ~/.ssh/config
```

```text
Host github.com
  HostName github.com
  User git
  IdentityFile /root/.ssh/github_devfuture
  IdentitiesOnly yes
```

```bash
chmod 600 ~/.ssh/config
cd /var/www/devfuture
git remote set-url origin git@github.com:ВАШ_ЛОГИН/devfuture.git
git fetch
```

### Вариант B — fine-grained / classic PAT

В URL: `https://<TOKEN>@github.com/ВАШ_ЛОГИН/devfuture.git`  
Хуже: токен может светиться в логах. Предпочтите Deploy Key.

---

## Часть 9. Безопасность (краткий чеклист)

- [ ] SSH-вход по ключу; парольный root по возможности отключён
- [ ] Порт 3000 не торчит наружу
- [ ] `.env.local` только на сервере, `chmod 600`
- [ ] `TELEGRAM_WEBHOOK_SECRET` задан и webhook переустановлен
- [ ] GitHub Secrets: только SSH_HOST / SSH_USER / SSH_PRIVATE_KEY
- [ ] Репозиторий Private, если в истории когда-либо светились секреты
- [ ] Certbot автообновление: `systemctl status certbot.timer`

Отключить парольный SSH (только после проверки входа по ключу!):

```bash
nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PermitRootLogin prohibit-password
systemctl reload sshd
```

---

## Часть 10. Типичные проблемы

| Симптом | Что делать |
|---------|------------|
| Actions Deploy: `Permission denied (publickey)` | Неверный `SSH_PRIVATE_KEY` или ключ не в `authorized_keys` |
| Deploy: `npm ci` падает | На сервере старый Node; нужен Node 20 |
| CI зелёный, сайт старый | Deploy не стартовал — смотрите `workflow_run` / вкладку Actions |
| `502 Bad Gateway` | `pm2 status` / `pm2 logs devfuture` |
| Certbot: connection refused | DNS ещё не указывает на IP, или закрыты 80/443 |
| Бот молчит | `TELEGRAM_WEBHOOK_SECRET` + `npm run tg:set-webhook` |
| Webhook 500 | В проде нет `TELEGRAM_WEBHOOK_SECRET` в `.env.local` |
| `git pull` auth failed | Настройте Deploy Key (часть 8) |

Логи:

```bash
pm2 logs devfuture
journalctl -u nginx -n 50 --no-pager
nginx -t
curl -I https://devfuture.ru
curl https://devfuture.ru/api/telegram/webhook
```

---

## Часть 11. Обновление после этой инструкции

Обычный рабочий цикл разработчика:

1. Правки локально → `npm run dev` / `npm test` / `npm run build`.
2. `git push origin main`.
3. GitHub сам прогоняет CI и деплоит на FirstByte VPS.
4. Проверяете `https://devfuture.ru`.

Ручной hotfix на сервере (если GitHub недоступен):

```bash
ssh root@132.243.16.225
cd /var/www/devfuture
bash scripts/deploy.sh
```

Дополнительно по ручному деплою без CI: см. [DEPLOY.md](./DEPLOY.md).
