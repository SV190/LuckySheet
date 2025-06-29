import { getDropboxToken, updateDropboxAccessToken } from '../database.js';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  try {
    const tokenData = await getDropboxToken(user.userId);
    if (!tokenData) {
      return res.status(401).json({ error: 'Dropbox не подключен' });
    }
    let accessToken = tokenData.access_token;
    if (!accessToken || (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date())) {
      const refreshResult = await refreshAccessToken(tokenData.refresh_token);
      accessToken = refreshResult.access_token;
      const expiresAt = new Date(Date.now() + refreshResult.expires_in * 1000);
      await updateDropboxAccessToken(user.userId, accessToken, expiresAt);
    }
    const userInfo = await getDropboxUserInfo(accessToken);
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения информации о пользователе Dropbox' });
  }
} 