# Яндекс Метрика — цели DevFuture

Создайте цели типа **JavaScript-событие** в кабинете Метрики
(счётчик = `NEXT_PUBLIC_YANDEX_METRIKA_ID`).

| Идентификатор цели | Когда срабатывает |
|--------------------|-------------------|
| `click_telegram` | Клик в Telegram (nav, hero, float, footer…) |
| `click_phone` | Клик по телефону |
| `submit_brief` | Успешная отправка формы брифа |
| `open_packages` | Переход/интерес к пакетам |
| `open_service` | Открытие услуги |
| `open_demo` | Открытие демо-блока / демо на лендинге |
| `click_package` | Клик по пакету |
| `scroll_75` | Прокрутка 75% главной |
| `quiz_complete` | Завершение квиза (форма или Telegram) |
| `open_contact` | CTA «Оставить бриф» в Hero |
| `lead_handoff` | Handoff заявки в Telegram |
| `open_estimator` | Калькулятор пакетов → бот |
| `view_resheniya` | Просмотр SEO-посадочной (`slug` в параметрах) |
| `view_case` | Просмотр кейса (`slug`) |
| `view_blog` | Просмотр поста блога (`slug`) |
| `funnel_cta` | CTA на посадочной/кейсе (`kind`, `slug`, `cta`) |

## SEO-воронка (как смотреть)

1. Сегмент: источник = поиск / переходы из поисковых систем.
2. Цепочка: `view_resheniya` / `view_case` → `funnel_cta` или `click_telegram` → `submit_brief`.
3. В параметрах визитов смотрите `slug`, `path`, `cta`.
4. Сравнение посадочных: отчёт по `view_resheniya` с группировкой по `slug`, затем конверсия в `funnel_cta`.

У всех `reachGoal` автоматически уходит `path` (текущий URL).

Проверка: после деплоя откройте сайт → выполните действие → «Онлайн» / отчёт по целям.
Параметры (`place`, `channel`, `slug`) уходят вторым аргументом `reachGoal`.
