import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { saveDropboxToken, getDropboxToken, updateDropboxAccessToken, getUserById } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;

const DROPBOX_CONFIG = {
  clientId: '8nw2cgvlalf08um',
  clientSecret: process.env.DROPBOX_CLIENT_SECRET,
  redirectUri: 'https://lucky-sheet-main-n1whci05i-shahroms-projects-7403ea57.vercel.app/'
};

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

// Обмен authorization code на refresh token
async function exchangeCodeForToken(code, redirectUri) {
  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: DROPBOX_CONFIG.clientId,
      client_secret: DROPBOX_CONFIG.clientSecret,
      redirect_uri: DROPBOX_CONFIG.redirectUri
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox token exchange failed: ${error}`);
  }

  return await response.json();
}

// Обновление access token
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: DROPBOX_CLIENT_ID,
      client_secret: DROPBOX_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox token refresh failed: ${error}`);
  }

  return await response.json();
}

// Получение информации о пользователе Dropbox
async function getDropboxUserInfo(accessToken) {
  const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Dropbox user info');
  }

  return await response.json();
}

// Получение списка файлов
async function getDropboxFiles(accessToken, path = '') {
  const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path,
      recursive: false,
      include_media_info: false,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      include_non_downloadable_files: true,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Dropbox files');
  }

  return await response.json();
}

export default async function handler(req, res) {
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

  // Проверяем авторизацию
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  // Обработка GET запроса для получения файлов
  if (req.method === 'GET') {
    try {
      // Получаем токен пользователя из БД
      const tokenData = await getDropboxToken(user.userId);
      if (!tokenData) {
        return res.status(401).json({ error: 'Dropbox не подключен' });
      }

      // Проверяем, нужен ли новый access token
      let accessToken = tokenData.access_token;
      if (!accessToken || (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date())) {
        console.log('Refreshing Dropbox access token...');
        const refreshResult = await refreshAccessToken(tokenData.refresh_token);
        
        accessToken = refreshResult.access_token;
        const expiresAt = new Date(Date.now() + refreshResult.expires_in * 1000);
        
        // Обновляем токен в БД
        await updateDropboxAccessToken(user.userId, accessToken, expiresAt);
      }

      // Получаем файлы из Dropbox
      const filesResponse = await getDropboxFiles(accessToken);
      
      const files = filesResponse.entries.map(entry => ({
        id: entry.id,
        name: entry.name,
        path: entry.path_lower,
        updatedAt: entry.server_modified,
        size: entry.size || 0,
        isFolder: entry['.tag'] === 'folder'
      }));

      console.log('Returning Dropbox files:', files);
      res.status(200).json(files);
    } catch (error) {
      console.error('Dropbox files error:', error);
      
      if (error.message.includes('invalid_access_token') || error.message.includes('expired_access_token')) {
        return res.status(401).json({ error: 'Требуется повторная авторизация в Dropbox' });
      }
      
      res.status(500).json({ error: 'Ошибка получения файлов из Dropbox' });
    }
  }
  // Обработка POST запроса для сохранения refresh token
  else if (req.method === 'POST') {
    try {
      const { code, redirect_uri } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Необходим код авторизации' });
      }

      if (!DROPBOX_CLIENT_ID || !DROPBOX_CLIENT_SECRET) {
        return res.status(500).json({ error: 'Dropbox не настроен на сервере' });
      }

      // Обмениваем код на токены
      const tokenResponse = await exchangeCodeForToken(code, redirect_uri);
      
      // Сохраняем токены в БД
      const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
      await saveDropboxToken(
        user.userId, 
        tokenResponse.refresh_token, 
        tokenResponse.access_token, 
        expiresAt
      );

      console.log('Dropbox refresh token saved successfully');
      
      res.status(200).json({ 
        success: true, 
        message: 'Dropbox подключен успешно' 
      });
    } catch (error) {
      console.error('Dropbox token error:', error);
      res.status(500).json({ error: 'Ошибка подключения Dropbox' });
    }
  } else {
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
}

// Получить URL для авторизации Dropbox
app.get('/api/dropbox/auth-url', (req, res) => {
  try {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CONFIG.clientId}&response_type=code&redirect_uri=${encodeURIComponent(DROPBOX_CONFIG.redirectUri)}`;
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
}); 