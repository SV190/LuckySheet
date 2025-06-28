export default function handler(req, res) {
  console.log('=== VERCEL USERS FUNCTION CALLED ===');
  console.log('Method:', req.method);

  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Обработка GET запроса для получения списка пользователей
  if (req.method === 'GET') {
    try {
      // Проверяем авторизацию
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      const token = authHeader.split(' ')[1];
      if (token !== 'test-token-123') {
        return res.status(401).json({ error: 'Неверный токен' });
      }

      // Возвращаем заглушку пользователей
      const users = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          is_admin: true,
          is_blocked: false,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          username: 'user1',
          email: 'user1@example.com',
          is_admin: false,
          is_blocked: false,
          created_at: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          username: 'user2',
          email: 'user2@example.com',
          is_admin: false,
          is_blocked: true,
          created_at: '2024-01-03T00:00:00Z'
        }
      ];

      console.log('Returning users:', users);
      res.status(200).json(users);
    } catch (error) {
      console.error('Users error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
} 