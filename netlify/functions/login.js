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

  // Обработка POST запроса для логина
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { username, password } = body;

      console.log('Login attempt:', { username, password });

      // Простая проверка
      if (username === 'admin' && password === 'admin') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            token: 'test-token-123',
            user: {
              id: 1,
              username: 'admin',
              is_admin: true
            }
          })
        };
      } else {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Неверный логин или пароль' })
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Ошибка сервера' })
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