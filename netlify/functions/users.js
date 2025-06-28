exports.handler = async function(event, context) {
  // Настройка CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Обработка preflight запросов
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Проверка токена (простая проверка для тестирования)
  const token = event.headers.authorization?.split(' ')[1];
  if (!token || token !== 'test-token-123') {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Неверный токен' })
    };
  }

  // GET - получить список пользователей
  if (event.httpMethod === 'GET') {
    const users = [
      { id: 1, username: 'admin', is_admin: true, is_blocked: false },
      { id: 2, username: 'user', is_admin: false, is_blocked: false },
      { id: 3, username: 'test', is_admin: false, is_blocked: true }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(users)
    };
  }

  // POST - создать пользователя
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { username, password, is_admin } = body;

      console.log('Creating user:', { username, is_admin });

      // Простая симуляция создания пользователя
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Пользователь создан' })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Ошибка создания пользователя' })
      };
    }
  }

  // Для других методов
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Метод не поддерживается' })
  };
}; 