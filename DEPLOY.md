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
