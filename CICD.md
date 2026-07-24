# CI/CD DevFuture — только автоматизация

**Цель:** один раз настроить → дальше только `git push`.  
Сайт сам обновляется на FirstByte (`132.243.16.225`, `devfuture.ru`).

```text
git push origin main
  → GitHub Actions: lint / test / build
  → если OK → SSH на VPS → git pull → npm ci → build → pm2 restart
```

Ручной деплой каждый раз **не нужен**. Ниже — только **разовые** шаги.

---

## Разово: 6 шагов

### Шаг 1. Запушь код на GitHub

На ПК в папке проекта (`D:\razrabotka\DevFuture`):

```powershell
cd D:\razrabotka\DevFuture
git remote -v
```

Если remote нет — создай репозиторий на [github.com/new](https://github.com/new) (имя например `devfuture`, без README), затем:

```powershell
git remote add origin https://github.com/ВАШ_ЛОГИН/devfuture.git
git branch -M main
git add .
git commit -m "CI/CD ready"
git push -u origin main
```

Замени `ВАШ_ЛОГИН` на свой логин GitHub.

---

### Шаг 2. SSH-ключ для Actions (на ПК, не в SSH)

В PowerShell:

```powershell
cd D:\razrabotka\DevFuture
powershell -ExecutionPolicy Bypass -File .\scripts\setup-deploy-key.ps1
```

Скрипт:

1. Создаст ключ `C:\Users\Dubko\.ssh\devfuture_deploy`
2. Напечатает **публичный** ключ (для сервера)
3. Напечатает **приватный** ключ (для GitHub Secret)

**На сервер** (скопируй публичную строку `ssh-ed25519 ...`):

```powershell
ssh root@132.243.16.225
```

На сервере одной командой (подставь свой ключ целиком):

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAA...твой_ключ... github-actions-devfuture' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

Проверка с ПК:

```powershell
ssh -i $env:USERPROFILE\.ssh\devfuture_deploy root@132.243.16.225
```

Должен пустить **без пароля**.

---

### Шаг 3. Secrets в GitHub (3 штуки)

Репозиторий → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|------|--------|
| `SSH_HOST` | `132.243.16.225` |
| `SSH_USER` | `root` |
| `SSH_PRIVATE_KEY` | весь приватный ключ из вывода скрипта (от `BEGIN` до `END`) |

---

### Шаг 4. DNS один раз

У регистратора домена (или DNS FirstByte) A-записи:

| Host | → |
|------|---|
| `@` | `132.243.16.225` |
| `www` | `132.243.16.225` |

Проверка: `nslookup devfuture.ru` → должен показать этот IP.

---

### Шаг 5. Bootstrap сервера один раз

На сервере (SSH):

```bash
export REPO_URL="https://github.com/ВАШ_ЛОГИН/devfuture.git"
curl -fsSL "https://raw.githubusercontent.com/ВАШ_ЛОГИН/devfuture/main/scripts/bootstrap-server.sh" | bash
```

Если репозиторий **приватный**, сначала клонируй с Deploy Key (ниже) или временно сделай Public, затем:

```bash
export REPO_URL="git@github.com:ВАШ_ЛОГИН/devfuture.git"
# клон вручную, если curl raw недоступен:
git clone "$REPO_URL" /var/www/devfuture
bash /var/www/devfuture/scripts/bootstrap-server.sh
```

Скрипт сам поставит Node 20, Nginx, PM2, UFW, соберёт сайт, запустит PM2.

Допиши секреты бота:

```bash
nano /var/www/devfuture/.env.local
```

Минимум заполни:

- `NEXT_PUBLIC_TELEGRAM_USERNAME` / `NEXT_PUBLIC_TELEGRAM_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`  
(`TELEGRAM_WEBHOOK_SECRET` уже сгенерирован автоматически)

HTTPS (когда DNS уже указывает на сервер):

```bash
certbot --nginx -d devfuture.ru -d www.devfuture.ru
```

Бот:

```bash
cd /var/www/devfuture && npm run tg:set-webhook
```

---

### Шаг 6. Проверка автодеплоя

На ПК:

```powershell
cd D:\razrabotka\DevFuture
# любое мелкое изменение, например пробел в README
git add .
git commit -m "chore: trigger auto deploy"
git push
```

GitHub → вкладка **Actions** → workflow **CI/CD**:

1. Job **Lint, test, build** — зелёный
2. Job **Deploy to FirstByte** — зелёный

Сайт обновился: https://devfuture.ru

Дальше **только** `git push`. Больше ничего руками на сервере не нужно.

Ручной деплой из GitHub (если надо без push): **Actions** → **CI/CD** → **Run workflow**.

---

## Приватный репозиторий: Deploy Key (разово)

Чтобы сервер мог `git pull` без пароля:

```bash
ssh-keygen -t ed25519 -C "vps-devfuture" -f /root/.ssh/github_devfuture -N ""
cat /root/.ssh/github_devfuture.pub
```

GitHub → repo → **Settings** → **Deploy keys** → **Add deploy key** → вставь `.pub` (без write).

```bash
cat > ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile /root/.ssh/github_devfuture
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
cd /var/www/devfuture
git remote set-url origin git@github.com:ВАШ_ЛОГИН/devfuture.git
git fetch
```

---

## Что автоматизировано

| Действие | Кто делает |
|----------|------------|
| lint / test / typecheck / build | GitHub Actions |
| выкладка на VPS | GitHub Actions → `scripts/deploy.sh` |
| pm2 restart | автоматом при деплое |
| обновление Telegram webhook | автоматом при деплое (если токен+секрет в `.env.local`) |
| HTTPS renewal | certbot timer на сервере |

| Только руками (один раз) | Почему |
|--------------------------|--------|
| DNS | нельзя из репозитория |
| SSH-ключ + 3 Secrets | доступ к твоему серверу |
| `.env.local` с токенами | секреты не должны быть в Git |
| первый bootstrap / certbot | установка ОС-пакетов |

---

## Если что-то красное в Actions

| Ошибка | Что проверить |
|--------|----------------|
| `Permission denied (publickey)` | Secret `SSH_PRIVATE_KEY` = приватный ключ; публичный на сервере в `authorized_keys` |
| Deploy OK, сайт старый | на сервере другой путь / другой pm2-процесс |
| `git pull` auth failed | Deploy Key (блок выше) |
| Build fail в CI | смотри лог job Check — чини код локально |
| Бот молчит | `.env.local` + `npm run tg:set-webhook` |

Логи на сервере: `pm2 logs devfuture`

Старый длинный ручной гайд больше не нужен для ежедневной работы. Шпаргалка VPS: [DEPLOY.md](./DEPLOY.md).
