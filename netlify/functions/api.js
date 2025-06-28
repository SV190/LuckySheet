const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Настройка CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Простой тестовый эндпоинт
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API работает!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Простой эндпоинт логина (без БД пока)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Простая проверка для тестирования
  if (username === 'admin' && password === 'admin') {
    res.json({
      token: 'test-token-123',
      user: {
        id: 1,
        username: 'admin',
        is_admin: true
      }
    });
  } else {
    res.status(403).json({ error: 'Неверный логин или пароль' });
  }
});

// Проверка токена
app.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token === 'test-token-123') {
    res.json({ 
      valid: true, 
      user: {
        id: 1,
        username: 'admin',
        is_admin: true
      }
    });
  } else {
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// Получить список пользователей (простой тест)
app.get('/users', (req, res) => {
  res.json([
    { id: 1, username: 'admin', is_admin: true, is_blocked: false },
    { id: 2, username: 'user', is_admin: false, is_blocked: false }
  ]);
});

// Обработчик для всех остальных маршрутов
app.all('*', (req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден',
    method: req.method,
    path: req.path,
    available: ['/test', '/login', '/verify', '/users']
  });
});

// Экспортируем функцию для Netlify
module.exports.handler = serverless(app); 