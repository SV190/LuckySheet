import jwt from 'jsonwebtoken';
import { updateUserBlockStatus, getUserById } from './database.js';

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
      const user = verifyToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
      }

      // Проверяем права администратора
      if (!user.isAdmin) {
        return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
      }

      const { userId, action } = req.body;

      if (!userId || !action) {
        return res.status(400).json({ error: 'Необходимы userId и action' });
      }

      if (!['block', 'unblock'].includes(action)) {
        return res.status(400).json({ error: 'Действие должно быть block или unblock' });
      }

      // Проверяем, что пользователь существует
      const targetUser = await getUserById(userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      // Нельзя блокировать самого себя
      if (user.userId === userId) {
        return res.status(400).json({ error: 'Нельзя блокировать самого себя' });
      }

      // Нельзя блокировать других администраторов
      if (targetUser.is_admin && user.userId !== targetUser.id) {
        return res.status(403).json({ error: 'Нельзя блокировать других администраторов' });
      }

      const isBlocked = action === 'block';
      await updateUserBlockStatus(userId, isBlocked);

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