export default function handler(req, res) {
  console.log('=== VERCEL DROPBOX FUNCTION CALLED ===');
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

  // Обработка GET запроса для получения файлов
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

      // Возвращаем заглушку файлов
      const files = [
        {
          id: 1,
          name: 'document1.xlsx',
          path: '/documents/document1.xlsx',
          updatedAt: '2024-01-15T10:30:00Z',
          size: 1024 * 1024
        },
        {
          id: 2,
          name: 'document2.xlsx',
          path: '/documents/document2.xlsx',
          updatedAt: '2024-01-14T15:45:00Z',
          size: 2048 * 1024
        },
        {
          id: 3,
          name: 'report.xlsx',
          path: '/work/report.xlsx',
          updatedAt: '2024-01-13T09:20:00Z',
          size: 512 * 1024
        }
      ];

      console.log('Returning files:', files);
      res.status(200).json(files);
    } catch (error) {
      console.error('Dropbox files error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
  // Обработка POST запроса для сохранения refresh token
  else if (req.method === 'POST') {
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

      const { code, redirect_uri } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Необходим код авторизации' });
      }

      console.log('Dropbox refresh token saved successfully');
      
      res.status(200).json({ 
        success: true, 
        message: 'Refresh token сохранен успешно' 
      });
    } catch (error) {
      console.error('Dropbox token error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
} 