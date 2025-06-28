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

  // GET - получить файлы (заглушка)
  if (event.httpMethod === 'GET') {
    const files = [
      { id: 1, name: 'document1.xlsx', path: '/documents/document1.xlsx', updatedAt: '2024-01-15T10:30:00Z' },
      { id: 2, name: 'document2.xlsx', path: '/documents/document2.xlsx', updatedAt: '2024-01-14T15:45:00Z' },
      { id: 3, name: 'folder1', path: '/documents/folder1', updatedAt: '2024-01-13T09:20:00Z', isFolder: true }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(files)
    };
  }

  // POST - сохранить токен (заглушка)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('Saving Dropbox token:', body);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Токен сохранен' })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Ошибка сохранения токена' })
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