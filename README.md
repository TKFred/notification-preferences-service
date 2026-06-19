# Notification Preferences Service

Сервис управления пользовательскими настройками уведомлений.

Он хранит пользовательские предпочтения, quiet hours и глобальные политики, а также отвечает на вопрос: можно ли отправить конкретное уведомление пользователю.

## Стек

- Node.js
- TypeScript
- Express
- PostgreSQL
- TypeORM
- Zod
- Luxon
- Vitest
- Pino
- Docker Compose

## Возможности

- дефолтные настройки для новых пользователей;
- пользовательские переопределения настроек;
- quiet hours с учётом таймзоны;
- глобальные политики запрета по типу уведомления, каналу и региону;
- идемпотентное обновление настроек;
- API для проверки `allow` / `deny` с причиной решения.

## Запуск

### 1. Установить зависимости

```bash
npm install
```

### 2. Создать `.env`

```env
PORT=3000
DATABASE_URL=postgres://app:app@localhost:15432/notification_preferences
```

### 3. Запустить PostgreSQL

```bash
docker compose up -d
```

### 4. Накатить миграции

```bash
npm run migration:run
```

### 5. Заполнить тестовые данные

```bash
npm run seed
```

Seed добавляет глобальную политику:

```txt
marketing + sms + EU = blocked_by_global_policy
```

### 6. Запустить сервис

```bash
npm run dev
```

Сервис будет доступен на:

```txt
http://localhost:3000
```

## Скрипты

```bash
npm run dev
```

Запуск в режиме разработки.

```bash
npm run build
```

Сборка проекта.

```bash
npm test
```

Запуск unit и integration тестов.

```bash
npm run migration:run
```

Накатить миграции.

```bash
npm run migration:revert
```

Откатить последнюю миграцию.

```bash
npm run seed
```

Заполнить тестовые данные.

## API

### Health check

```http
GET /health
```

### Получить настройки пользователя

```http
GET /users/:userId/preferences
```

Ответ содержит итоговые настройки пользователя.

Для каждой настройки указывается источник:

```txt
default
user
```

### Обновить настройки пользователя

```http
POST /users/:userId/preferences
```

Пример тела запроса:

```json
{
  "preferences": [
    {
      "notificationType": "marketing",
      "channel": "email",
      "enabled": true
    }
  ],
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "Asia/Almaty"
  }
}
```

Операция идемпотентна: повторный такой же запрос не создаёт дубликаты и не ломает состояние.

### Проверить возможность отправки

```http
POST /evaluate
```

Пример тела запроса:

```json
{
  "userId": "user-1",
  "notificationType": "marketing",
  "channel": "sms",
  "region": "EU",
  "datetime": "2026-05-21T12:00:00Z"
}
```

Пример ответа:

```json
{
  "decision": "deny",
  "reason": "blocked_by_global_policy"
}
```

Возможные причины:

```txt
blocked_by_global_policy
blocked_by_quiet_hours
allowed_by_user_preference
disabled_by_user_preference
allowed_by_default
disabled_by_default
no_matching_preference
```

## Бизнес-правила

Правила применяются в таком порядке:

```txt
1. Глобальная политика запрета
2. Quiet hours
3. Пользовательская настройка
4. Дефолтная настройка
5. Безопасный fallback deny
```

Quiet hours применяются только к маркетинговым уведомлениям в каналах:

```txt
push
sms
telegram
```

Транзакционные уведомления не блокируются quiet hours.

## Архитектура

Проект разделён на слои:

```txt
http          — routes, DTO, validation, presenters
application   — сервисы и use cases
domain        — бизнес-сущности и дефолтные настройки
typeorm       — модели БД, миграции, репозитории, адаптеры
helpers       — общие утилиты
```

Бизнес-логика отделена от Express и TypeORM.

## База данных

Используются таблицы:

```txt
user_preferences
user_quiet_hours
global_policies
```

Дефолтные настройки лежат в коде.

Пользовательские настройки хранятся как sparse overrides: в БД сохраняются только те комбинации `notificationType + channel`, которые пользователь изменил.

## Тесты

Тестами покрыто:

- дефолты для нового пользователя;
- изменение пользовательских настроек;
- идемпотентность обновления;
- пользовательские overrides;
- quiet hours;
- транзакционные уведомления во время quiet hours;
- глобальные политики;
- приоритет глобальной политики над пользовательским разрешением;
- ошибки валидации.

## Полная локальная проверка

```bash
docker compose up -d
npm run migration:revert
npm run migration:run
npm run seed
npm test
npm run build
npm run dev
```

## Postman

Для ручной проверки можно импортировать Postman collection:

```txt
notification_preferences.postman_collection.json
```

## Что можно улучшить для production

- добавить авторизацию;
- добавить admin API для глобальных политик;
- добавить audit log изменений настроек;
- добавить Redis cache для resolved preferences;
- добавить метрики и трассировку через OpenTelemetry;
- добавить outbox events при изменении настроек;
- расширить модель политик приоритетами и датами действия;
- добавить отдельную тестовую БД или Testcontainers.

