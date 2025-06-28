# Развертывание на Netlify

Этот проект настроен для работы с Netlify Functions вместо традиционного сервера.

## Предварительные требования

1. Установите Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Установите зависимости проекта:
```bash
npm install
```

3. Установите зависимости для Netlify Functions:
```bash
cd netlify/functions
npm install
cd ../..
```

## Локальная разработка

1. Запустите проект в режиме разработки:
```bash
npm run netlify:dev
```

Это запустит:
- Vite dev server на порту 5173
- Netlify Functions на порту 8888
- Автоматическую прокси-маршрутизацию

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# JWT секрет для токенов
JWT_SECRET=your-super-secret-jwt-key

# Dropbox API credentials
DROPBOX_CLIENT_ID=your-dropbox-client-id
DROPBOX_CLIENT_SECRET=your-dropbox-client-secret
```

## Настройка Dropbox

1. Перейдите в [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Создайте новое приложение
3. В настройках приложения:
   - Установите "OAuth 2" тип
   - Добавьте redirect URI: `https://your-app-name.netlify.app/`
   - Скопируйте App Key и App Secret

## Развертывание на Netlify

### Способ 1: Через Netlify CLI

1. Войдите в Netlify:
```bash
netlify login
```

2. Инициализируйте проект:
```bash
netlify init
```

3. Установите переменные окружения:
```bash
netlify env:set JWT_SECRET "your-super-secret-jwt-key"
netlify env:set DROPBOX_CLIENT_ID "your-dropbox-client-id"
netlify env:set DROPBOX_CLIENT_SECRET "your-dropbox-client-secret"
```

4. Разверните проект:
```bash
npm run netlify:build
netlify deploy --prod
```

### Способ 2: Через GitHub

1. Загрузите код в GitHub репозиторий
2. Подключите репозиторий к Netlify
3. Настройте переменные окружения в панели Netlify
4. Настройте build команды:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

## Структура проекта для Netlify

```
├── netlify.toml              # Конфигурация Netlify
├── netlify/
│   └── functions/
│       ├── api.js            # Основная API функция
│       └── package.json      # Зависимости функций
├── src/                      # Фронтенд код
└── package.json              # Основные зависимости
```

## API Endpoints

После развертывания API будет доступно по адресу:
- Локально: `http://localhost:8888/.netlify/functions/api`
- Продакшн: `https://your-app.netlify.app/.netlify/functions/api`

### Доступные эндпоинты:

- `POST /login` - Вход пользователя
- `GET /verify` - Проверка токена
- `GET /users` - Список пользователей (только админ)
- `POST /users` - Создание пользователя (только админ)
- `POST /users/:id/block` - Блокировка/разблокировка пользователя
- `POST /dropbox/save-token` - Сохранение Dropbox токена
- `GET /dropbox/refresh-token` - Получение refresh токена
- `POST /dropbox/exchange-token` - Обмен refresh токена на access токен

## Важные замечания

1. **База данных**: SQLite файл хранится во временной папке `/tmp` на Netlify. Данные будут сбрасываться при каждом новом развертывании. Для продакшена рекомендуется использовать внешнюю базу данных.

2. **Переменные окружения**: Убедитесь, что все переменные окружения настроены в панели Netlify.

3. **CORS**: Настроен для работы с вашим доменом Netlify. Обновите CORS настройки в `netlify/functions/api.js` если используете кастомный домен.

4. **Dropbox Redirect URI**: Обновите redirect URI в Dropbox App Console на ваш финальный домен.

## Устранение неполадок

### Ошибка "Function not found"
- Убедитесь, что папка `netlify/functions` существует
- Проверьте, что `package.json` в папке функций установлен

### Ошибки CORS
- Проверьте настройки CORS в `api.js`
- Убедитесь, что домен указан правильно

### Ошибки Dropbox
- Проверьте переменные окружения DROPBOX_CLIENT_ID и DROPBOX_CLIENT_SECRET
- Убедитесь, что redirect URI настроен правильно в Dropbox App Console

### Ошибки базы данных
- Проверьте права доступа к папке `/tmp`
- Убедитесь, что SQLite установлен в зависимостях функций 