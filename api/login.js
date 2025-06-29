import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByUsername } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
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

      // Проверяем наличие обязательных полей
      if (!username || !password) {
        return res.status(400).json({ error: 'Логин и пароль обязательны' });
      }

      // Получаем пользователя из базы данных
      const user = await getUserByUsername(username);
      
      if (!user) {
        console.log('Login failed - user not found');
        return res.status(401).json({ error: 'Неверный логин или пароль' });
      }

      // Проверяем, не заблокирован ли пользователь
      if (user.is_blocked) {
        console.log('Login failed - user is blocked');
        return res.status(403).json({ error: 'Пользователь заблокирован' });
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        console.log('Login failed - invalid password');
        return res.status(401).json({ error: 'Неверный логин или пароль' });
      }

      // Создаем JWT токен
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          isAdmin: user.is_admin 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful for user:', user.username);
      
      const response = {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_admin: user.is_admin === 1
        }
      };
      
      console.log('Sending response:', { ...response, token: '***' });
      res.status(200).json(response);
      
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