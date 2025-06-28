export default function handler(req, res) {
  console.log('=== VERCEL BLOCK-USER FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Обработка POST запроса для блокировки/разблокировки пользователя
  if (req.method === 'POST') {
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

      const { userId, action } = req.body;

      if (!userId || !action) {
        return res.status(400).json({ error: 'Необходимы userId и action' });
      }

      if (!['block', 'unblock'].includes(action)) {
        return res.status(400).json({ error: 'Действие должно быть block или unblock' });
      }

      console.log(`User ${userId} ${action}ed successfully`);
      
      res.status(200).json({ 
        success: true, 
        message: `Пользователь ${action === 'block' ? 'заблокирован' : 'разблокирован'} успешно` 
      });
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
} 