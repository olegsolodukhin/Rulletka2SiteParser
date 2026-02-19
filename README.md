# Rulletka2 Site Parser

Монорепозиторий, состоящий из серверной и админской части.

## Структура

- **server** — NestJS сервер (API, crawler, Prisma)
- **admin** — Next.js админ-панель

## Установка

```bash
npm install
```

## Запуск

### Сервер (NestJS)

```bash
npm run server:dev
```

### Админ-панель (Next.js)

```bash
npm run admin:dev
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run server:dev` | Запуск сервера в режиме разработки |
| `npm run admin:dev` | Запуск админки в режиме разработки |
| `npm run server:build` | Сборка сервера |
| `npm run admin:build` | Сборка админки |
| `npm run server:start` | Запуск сервера в production |
| `npm run admin:start` | Запуск админки в production |
