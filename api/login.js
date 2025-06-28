export default function handler(req, res) {
  console.log('=== VERCEL LOGIN FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);

  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  // Обработка POST запроса для логина
  if (req.method === 'POST') {
    try {
      console.log('Processing POST request');
      const { username, password } = req.body;

      console.log('Login attempt:', { 
        username, 
        password: password ? '***' : 'undefined',
        bodyKeys: Object.keys(req.body || {})
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
        res.status(200).json(response);
      } else {
        console.log('Login failed - invalid credentials');
        res.status(401).json({ error: 'Неверный логин или пароль' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
  } else {
    // Для других методов
    console.log('Unsupported method:', req.method);
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
} 