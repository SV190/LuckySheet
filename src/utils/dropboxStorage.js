// Dropbox Storage Service
export class DropboxStorageService {
  constructor() {
    this.clientId = '8nw2cgvlalf08um'; // Dropbox App Key
    this.redirectUri = window.location.origin + '/';
    this.dbx = null;
    this.accessToken = null;
    this.isAuthenticated = false;
    this.userInfo = null;
    this.Dropbox = null; // Будет загружен динамически
  }

  // Определяем базовый URL API в зависимости от окружения
  getApiBaseUrl() {
    if (import.meta.env.DEV) {
      return 'http://localhost:3000/api'
    }
    return '/api'
  }

  // Динамическая загрузка Dropbox SDK
  async loadDropboxSDK() {
    if (this.Dropbox) {
      return this.Dropbox;
    }

    try {
      console.log('Загружаем Dropbox SDK...');
      const dropboxModule = await import('dropbox');
      this.Dropbox = dropboxModule.Dropbox;
      console.log('Dropbox SDK загружен успешно');
      return this.Dropbox;
    } catch (error) {
      console.error('Ошибка загрузки Dropbox SDK:', error);
      throw new Error('Не удалось загрузить Dropbox SDK: ' + error.message);
    }
  }

  // Создание экземпляра Dropbox с проверкой
  async createDropboxInstance(options) {
    const Dropbox = await this.loadDropboxSDK();
    
    try {
      console.log('Создаем экземпляр Dropbox с опциями:', options);
      const instance = new Dropbox(options);
      console.log('Экземпляр Dropbox создан успешно');
      return instance;
    } catch (error) {
      console.error('Ошибка создания экземпляра Dropbox:', error);
      throw error;
    }
  }

  // Получение URL для авторизации (authorization code flow)
  async getAuthUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      token_access_type: 'offline', // чтобы получить refresh token
    });
    const authUrl = `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
    return authUrl;
  }

  // Обработка ответа от OAuth (authorization code flow)
  async handleAuthResponse() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    if (error) {
      console.error('Ошибка OAuth Dropbox:', error);
      throw new Error(`Ошибка авторизации: ${error}`);
    }
    if (code) {
      // Отправляем code на сервер для обмена на refresh token
      try {
        const userToken = localStorage.getItem('user_token');
        const response = await fetch(`${this.getApiBaseUrl()}/dropbox`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ code, redirect_uri: this.redirectUri })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Ошибка сохранения refresh token');
        // Очищаем URL
        window.history.replaceState({}, document.title, window.location.pathname);
        this.isAuthenticated = true;
        return true;
      } catch (e) {
        throw new Error('Ошибка обмена кода на refresh token: ' + e.message);
      }
    }
    return false;
  }

  // Получить access token с сервера (заглушка для тестирования)
  async getAccessTokenFromServer() {
    // Для тестирования возвращаем заглушку
    return 'test-dropbox-token';
  }

  // Инициализация сервиса (заглушка для тестирования)
  async initialize() {
    console.log('Initializing Dropbox service (mock mode)');
    this.isAuthenticated = true; // Для тестирования считаем авторизованным
    return true;
  }

  // Перед каждым вызовом Dropbox API — обновлять access token (заглушка)
  async safeApiCall(apiCall) {
    // Для тестирования не делаем реальные вызовы
    console.log('Mock safeApiCall - skipping real Dropbox API calls');
    throw new Error('Dropbox API calls disabled for testing');
  }

  // Аутентификация пользователя
  async authenticate() {
    if (this.isAuthenticated) {
      return true;
    }
    const authUrl = await this.getAuthUrl();
    window.location.href = authUrl;
  }

  // Получение информации о пользователе (заглушка)
  async getUserInfo() {
    console.log('Getting user info (mock)');
    // Для тестирования возвращаем заглушку
    this.userInfo = {
      name: 'Test User',
      email: 'test@example.com',
      spaceUsed: 1024 * 1024 * 100, // 100 MB
      spaceTotal: 1024 * 1024 * 1024 * 2 // 2 GB
    };
    return this.userInfo;
  }

  // Получение списка файлов (через сервер)
  async getUserFiles() {
    console.log('Getting user files (mock)');
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка получения файлов');
      return data;
    } catch (error) {
      console.error('Error fetching files from server, using mock data:', error);
      // Возвращаем заглушку
      return [
        { id: 1, name: 'document1.xlsx', path: '/documents/document1.xlsx', updatedAt: '2024-01-15T10:30:00Z' },
        { id: 2, name: 'document2.xlsx', path: '/documents/document2.xlsx', updatedAt: '2024-01-14T15:45:00Z' },
        { id: 3, name: 'folder1', path: '/documents/folder1', updatedAt: '2024-01-13T09:20:00Z', isFolder: true }
      ];
    }
  }

  // Получение папок (заглушка)
  async getFolders(parentPath = '') {
    console.log('Getting folders (mock) for path:', parentPath);
    // Возвращаем заглушку папок
    return [
      { id: 1, name: 'Documents', path: '/documents', isFolder: true },
      { id: 2, name: 'Work', path: '/work', isFolder: true },
      { id: 3, name: 'Personal', path: '/personal', isFolder: true }
    ];
  }

  // Выход из Dropbox
  logout() {
    console.log('Logging out from Dropbox (mock)');
    this.isAuthenticated = false;
    this.userInfo = null;
    this.accessToken = null;
    this.dbx = null;
  }

  // Проверка конфигурации
  checkConfiguration() {
    return {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      isAuthenticated: this.isAuthenticated
    };
  }

  // Получение информации о пользователе синхронно
  getUserInfoSync() {
    return this.userInfo;
  }
}

// Экспортируем экземпляр сервиса
export const dropboxStorage = new DropboxStorageService(); 