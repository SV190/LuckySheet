exports.handler = async function(event, context) {
  console.log('=== LOGIN FUNCTION CALLED ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body:', event.body);
  console.log('Query params:', event.queryStringParameters);

  // Настройка CORS
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Обработка preflight запросов
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Обработка POST запроса для логина
  if (event.httpMethod === 'POST') {
    try {
      console.log('Processing POST request');
      const body = JSON.parse(event.body || '{}');
      const { username, password } = body;

      console.log('Login attempt:', { 
        username, 
        password: password ? '***' : 'undefined',
        bodyKeys: Object.keys(body)
      });

      // Простая проверка
      if (username === 'admin' && password === 'admin') {
        console.log('Login successful for admin');
        const response = {
          token: 'test-token-123',
          user: {
            id: 1,
            username: 'admin',
            is_admin: true
          }
        };
        console.log('Sending response:', response);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(response)
        };
      } else {
        console.log('Login failed - invalid credentials');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Неверный логин или пароль' })
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Ошибка сервера: ' + error.message })
      };
    }
  }

  // Для других методов
  console.log('Unsupported method:', event.httpMethod);
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Метод не поддерживается' })
  };
}; 