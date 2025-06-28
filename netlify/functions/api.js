import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fetch from 'node-fetch';
import serverless from 'serverless-http';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Настройка CORS для Netlify - разрешаем все домены Netlify
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, из мобильных приложений)
    if (!origin) return callback(null, true);
    
    // Разрешаем все домены Netlify
    if (origin.includes('netlify.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Добавляем обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Инициализация базы данных
let db;
async function initDB() {
  try {
    if (!db) {
      db = await open({
        filename: '/tmp/users.db', // Используем временную папку для Netlify
        driver: sqlite3.Database
      });
      
      // Создание таблицы пользователей
      await db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        is_admin INTEGER DEFAULT 0,
        is_blocked INTEGER DEFAULT 0,
        dropbox_refresh_token TEXT
      )`);
      
      // Добавляем поле dropbox_refresh_token, если его нет
      try {
        await db.run('ALTER TABLE users ADD COLUMN dropbox_refresh_token TEXT');
      } catch (e) {
        // Игнорируем ошибку, если поле уже существует
      }
      
      // Создание первого админа, если нет
      const admin = await db.get('SELECT * FROM users WHERE is_admin = 1');
      if (!admin) {
        const hash = await bcrypt.hash('admin', 10);
        await db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)', ['admin', hash]);
        console.log('Создан админ: admin / admin');
      }
      
      // Создание тестового пользователя, если нет
      const testUser = await db.get('SELECT * FROM users WHERE username = ?', 'user');
      if (!testUser) {
        const hash = await bcrypt.hash('user', 10);
        await db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)', ['user', hash]);
        console.log('Создан пользователь: user / user');
      }
    }
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Middleware для инициализации БД
app.use(async (req, res, next) => {
  await initDB();
  next();
});

// Middleware для проверки токена
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
}

// Middleware для проверки админа
function adminMiddleware(req, res, next) {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Нет прав' });
  next();
}

// Вход пользователя
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get('SELECT * FROM users WHERE username = ?', username);
  if (!user || user.is_blocked) return res.status(403).json({ error: 'Нет доступа' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(403).json({ error: 'Неверный логин или пароль' });
  const token = jwt.sign({ id: user.id, username: user.username, is_admin: !!user.is_admin }, JWT_SECRET);
  res.json({ 
    token, 
    user: {
      id: user.id,
      username: user.username,
      is_admin: !!user.is_admin
    }
  });
});

// Проверка токена
app.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      username: req.user.username,
      is_admin: req.user.is_admin
    }
  });
});

// Получить список пользователей (только для админа)
app.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const users = await db.all('SELECT id, username, is_admin, is_blocked FROM users');
  res.json(users);
});

// Создать пользователя (только для админа)
app.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, password, is_admin } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', [username, hash, is_admin ? 1 : 0]);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Пользователь уже существует' });
  }
});

// Блокировка/разблокировка пользователя (только для админа)
app.post('/users/:id/block', authMiddleware, adminMiddleware, async (req, res) => {
  const { block } = req.body;
  await db.run('UPDATE users SET is_blocked = ? WHERE id = ?', [block ? 1 : 0, req.params.id]);
  res.json({ success: true });
});

// Сохранить Dropbox refresh token для пользователя
app.post('/dropbox/save-token', authMiddleware, async (req, res) => {
  const { code, redirect_uri } = req.body;
  if (!code || !redirect_uri) return res.status(400).json({ error: 'Нет code или redirect_uri' });

  console.log('Saving token for user:', req.user.id, req.user.username);

  const client_id = process.env.DROPBOX_CLIENT_ID || '8nw2cgvlalf08um';
  const client_secret = process.env.DROPBOX_CLIENT_SECRET || '0wwkn2pedmy183w';

  console.log('Dropbox OAuth exchange:', { client_id, redirect_uri, code: code.substring(0, 10) + '...' });

  const params = new URLSearchParams();
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('redirect_uri', redirect_uri);

  try {
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const data = await response.json();
    console.log('Dropbox response:', { status: response.status, ok: response.ok, data });
    
    if (!response.ok) {
      return res.status(400).json({ error: data.error_description || 'Ошибка обмена кода' });
    }
    if (!data.refresh_token) {
      return res.status(400).json({ error: 'Нет refresh_token в ответе Dropbox' });
    }
    
    console.log('Saving refresh token to DB for user:', req.user.id);
    await db.run('UPDATE users SET dropbox_refresh_token = ? WHERE id = ?', [data.refresh_token, req.user.id]);
    console.log('Refresh token saved successfully');
    
    res.json({ success: true });
  } catch (e) {
    console.error('Dropbox exchange error:', e);
    res.status(500).json({ error: 'Ошибка обмена кода' });
  }
});

// Получить Dropbox refresh token для пользователя (только для себя)
app.get('/dropbox/refresh-token', authMiddleware, async (req, res) => {
  const user = await db.get('SELECT dropbox_refresh_token FROM users WHERE id = ?', req.user.id);
  if (!user || !user.dropbox_refresh_token) return res.status(404).json({ error: 'Нет refresh token' });
  res.json({ refresh_token: user.dropbox_refresh_token });
});

// Обменять refresh token на access token (и вернуть его клиенту)
app.post('/dropbox/exchange-token', authMiddleware, async (req, res) => {
  console.log('Exchange token request for user:', req.user.id, req.user.username);
  
  const user = await db.get('SELECT dropbox_refresh_token FROM users WHERE id = ?', req.user.id);
  console.log('User from DB:', { id: req.user.id, hasRefreshToken: !!user?.dropbox_refresh_token });
  
  if (!user || !user.dropbox_refresh_token) {
    console.log('No refresh token found for user:', req.user.id);
    return res.status(404).json({ error: 'Нет refresh token' });
  }

  const client_id = process.env.DROPBOX_CLIENT_ID || '8nw2cgvlalf08um';
  const client_secret = process.env.DROPBOX_CLIENT_SECRET || '0wwkn2pedmy183w';

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', user.dropbox_refresh_token);
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);

  console.log('Exchanging refresh token for access token...');

  try {
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const data = await response.json();
    console.log('Dropbox exchange response:', { status: response.status, ok: response.ok, hasAccessToken: !!data.access_token });
    
    if (!response.ok) {
      console.error('Dropbox exchange error:', data);
      return res.status(400).json({ error: data.error_description || 'Ошибка обмена токена' });
    }
    res.json({ access_token: data.access_token, expires_in: data.expires_in });
  } catch (e) {
    console.error('Exchange token error:', e);
    res.status(500).json({ error: 'Ошибка обмена токена' });
  }
});

// Простой тестовый эндпоинт для проверки работы функции
app.get('/test', (req, res) => {
  res.json({ 
    message: 'API работает!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Обработчик для всех остальных маршрутов
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Экспортируем функцию для Netlify
export const handler = serverless(app); 