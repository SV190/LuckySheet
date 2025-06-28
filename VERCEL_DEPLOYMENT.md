# Деплой на Vercel

## Быстрый старт

1. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Войдите в Vercel:**
   ```bash
   vercel login
   ```

3. **Деплой:**
   ```bash
   vercel
   ```

## Структура проекта

- `api/` - Serverless функции для Vercel
  - `login.js` - Авторизация пользователей
  - `users.js` - Управление пользователями
  - `block-user.js` - Блокировка/разблокировка пользователей
  - `dropbox.js` - Интеграция с Dropbox

- `src/` - Frontend приложение (Vue 3 + Vite)
- `vercel.json` - Конфигурация Vercel

## API Endpoints

- `POST /api/login` - Вход в систему
- `GET /api/users` - Получение списка пользователей
- `POST /api/block-user` - Блокировка/разблокировка пользователя
- `GET /api/dropbox` - Получение файлов из Dropbox
- `POST /api/dropbox` - Сохранение Dropbox токена

## Тестовые данные

**Логин:** admin  
**Пароль:** admin

## Локальная разработка

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Запустите локальный сервер:**
   ```bash
   vercel dev
   ```

3. **Откройте:** http://localhost:3000

## Переменные окружения

Создайте файл `.env.local` для локальной разработки:

```env
# Dropbox App
DROPBOX_CLIENT_ID=your_dropbox_client_id
DROPBOX_CLIENT_SECRET=your_dropbox_client_secret

# JWT Secret
JWT_SECRET=your_jwt_secret
```

## Преимущества Vercel

- ✅ Автоматические деплои из Git
- ✅ Serverless функции
- ✅ Edge сеть для быстрой работы
- ✅ Бесплатный SSL
- ✅ Простая настройка
- ✅ Отличная документация
- ✅ Интеграция с GitHub/GitLab

## Миграция с Netlify

1. Удалите `netlify.toml`
2. Перенесите функции из `netlify/functions/` в `api/`
3. Обновите URL в коде с `/.netlify/functions` на `/api`
4. Деплойте на Vercel

## Поддержка

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/functions) 