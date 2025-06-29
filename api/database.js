import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

let db = null;

// Инициализация базы данных
export async function initDatabase() {
  if (db) return db;
  
  console.log('Initializing database...');
  
  db = await open({
    filename: ':memory:', // Используем in-memory базу для Vercel
    driver: sqlite3.Database
  });

  // Создаем таблицы
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      is_blocked BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dropbox_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      refresh_token TEXT NOT NULL,
      access_token TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Создаем индексы
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_dropbox_tokens_user_id ON dropbox_tokens(user_id);
  `);

  // Добавляем тестового админа, если его нет
  const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin', 10);
    await db.run(`
      INSERT INTO users (username, email, password_hash, is_admin) 
      VALUES (?, ?, ?, ?)
    `, ['admin', 'admin@example.com', passwordHash, 1]);
    console.log('Admin user created');
  }

  // Добавляем тестовых пользователей
  const testUsers = [
    { username: 'user1', email: 'user1@example.com', password: 'password1' },
    { username: 'user2', email: 'user2@example.com', password: 'password2' }
  ];

  for (const user of testUsers) {
    const exists = await db.get('SELECT id FROM users WHERE username = ?', [user.username]);
    if (!exists) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await db.run(`
        INSERT INTO users (username, email, password_hash, is_admin) 
        VALUES (?, ?, ?, ?)
      `, [user.username, user.email, passwordHash, 0]);
      console.log(`User ${user.username} created`);
    }
  }

  console.log('Database initialized successfully');
  return db;
}

// Получение подключения к БД
export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

// Закрытие подключения
export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}

// Функции для работы с пользователями
export async function getUserByUsername(username) {
  const database = await getDatabase();
  return await database.get('SELECT * FROM users WHERE username = ?', [username]);
}

export async function getUserById(id) {
  const database = await getDatabase();
  return await database.get('SELECT * FROM users WHERE id = ?', [id]);
}

export async function getAllUsers() {
  const database = await getDatabase();
  return await database.all('SELECT id, username, email, is_admin, is_blocked, created_at FROM users ORDER BY created_at DESC');
}

export async function createUser(username, email, password, isAdmin = false) {
  const database = await getDatabase();
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await database.run(`
    INSERT INTO users (username, email, password_hash, is_admin) 
    VALUES (?, ?, ?, ?)
  `, [username, email, passwordHash, isAdmin ? 1 : 0]);
  
  return result.lastID;
}

export async function updateUserBlockStatus(userId, isBlocked) {
  const database = await getDatabase();
  await database.run(`
    UPDATE users 
    SET is_blocked = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [isBlocked ? 1 : 0, userId]);
}

// Функции для работы с Dropbox токенами
export async function saveDropboxToken(userId, refreshToken, accessToken = null, expiresAt = null) {
  const database = await getDatabase();
  
  // Удаляем старые токены пользователя
  await database.run('DELETE FROM dropbox_tokens WHERE user_id = ?', [userId]);
  
  // Сохраняем новый токен
  await database.run(`
    INSERT INTO dropbox_tokens (user_id, refresh_token, access_token, expires_at) 
    VALUES (?, ?, ?, ?)
  `, [userId, refreshToken, accessToken, expiresAt]);
}

export async function getDropboxToken(userId) {
  const database = await getDatabase();
  return await database.get(`
    SELECT * FROM dropbox_tokens 
    WHERE user_id = ? 
    ORDER BY updated_at DESC 
    LIMIT 1
  `, [userId]);
}

export async function updateDropboxAccessToken(userId, accessToken, expiresAt) {
  const database = await getDatabase();
  await database.run(`
    UPDATE dropbox_tokens 
    SET access_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = ?
  `, [accessToken, expiresAt, userId]);
} 