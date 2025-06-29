import jwt from 'jsonwebtoken';
import { getAllUsers, createUser, getUserById } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware для проверки JWT токена
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
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

  // Проверяем авторизацию
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  // Проверяем права администратора
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
  }

  // Обработка GET запроса для получения списка пользователей
  if (req.method === 'GET') {
    try {
      const users = await getAllUsers();
      console.log('Returning users:', users);
      res.status(200).json(users);
    } catch (error) {
      console.error('Users error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  }
  // Обработка POST запроса для создания пользователя
  else if (req.method === 'POST') {
    try {
      const { username, email, password, is_admin } = req.body;

      // Проверяем обязательные поля
      if (!username || !password) {
        return res.status(400).json({ error: 'Логин и пароль обязательны' });
      }

      // Проверяем длину пароля
      if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
      }

      // Создаем пользователя
      const userId = await createUser(username, email, password, is_admin);
      
      // Получаем созданного пользователя
      const newUser = await getUserById(userId);
      
      console.log('User created:', { id: newUser.id, username: newUser.username });
      
      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          is_admin: newUser.is_admin === 1,
          is_blocked: newUser.is_blocked === 1,
          created_at: newUser.created_at
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      
      // Обрабатываем ошибку дублирования
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Пользователь с таким логином или email уже существует' });
      }
      
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
} 