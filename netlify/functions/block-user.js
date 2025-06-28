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

  // POST - блокировка/разблокировка пользователя
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { block } = body;
      const userId = event.path.split('/').pop(); // Получаем ID из URL

      console.log('Blocking user:', { userId, block });

      // Простая симуляция блокировки пользователя
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: `Пользователь ${block ? 'заблокирован' : 'разблокирован'}` 
        })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Ошибка блокировки пользователя' })
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