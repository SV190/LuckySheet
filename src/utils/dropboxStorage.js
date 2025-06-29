// Dropbox Storage Service
export class DropboxStorageService {
  constructor() {
    this.clientId = '8nw2cgvlalf08um'; // Dropbox App Key
    this.redirectUri = 'https://lucky-sheet-main-2h3am9ski-shahroms-projects-7403ea57.vercel.app/';
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
    // В production используем текущий домен
    return window.location.origin + '/api'
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

  // Инициализация сервиса
  async initialize() {
    try {
      console.log('Initializing Dropbox service...');
      // Проверяем, есть ли сохраненные токены
      const userToken = localStorage.getItem('user_token');
      if (!userToken) {
        console.log('No user token found');
        return false;
      }

      // Проверяем подключение к Dropbox через сервер
      try {
        const response = await fetch(`${this.getApiBaseUrl()}/dropbox`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        
        if (response.ok) {
          this.isAuthenticated = true;
          console.log('Dropbox connection verified');
          return true;
        } else {
          console.log('Dropbox not connected');
          return false;
        }
      } catch (error) {
        console.log('Error checking Dropbox connection:', error);
        return false;
      }
    } catch (error) {
      console.error('Error initializing Dropbox service:', error);
      return false;
    }
  }

  // Аутентификация пользователя
  async authenticate() {
    if (this.isAuthenticated) {
      return true;
    }
    const authUrl = await this.getAuthUrl();
    window.location.href = authUrl;
  }

  // Получение информации о пользователе
  async getUserInfo() {
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox/user-info`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        this.userInfo = userInfo;
        return userInfo;
      } else {
        throw new Error('Failed to get user info');
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Получение списка файлов (через сервер)
  async getUserFiles() {
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка получения файлов');
      }
      
      const files = await response.json();
      return files;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  // Получение папок
  async getFolders(parentPath = '') {
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox/folders?path=${encodeURIComponent(parentPath)}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка получения папок');
      }
      
      const folders = await response.json();
      return folders.filter(f => f.isFolder);
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  // Загрузка файла
  async downloadFile(filePath) {
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ path: filePath })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки файла');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Загрузка файла на Dropbox
  async uploadFile(filePath, fileData) {
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ 
          path: filePath, 
          data: fileData 
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка загрузки файла');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Удаление файла
  async deleteFile(filePath) {
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ path: filePath })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка удаления файла');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Создание папки
  async createFolder(folderPath) {
    try {
      const userToken = localStorage.getItem('user_token');
      const response = await fetch(`${this.getApiBaseUrl()}/dropbox/create-folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ path: folderPath })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка создания папки');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  // Выход из Dropbox
  logout() {
    console.log('Logging out from Dropbox');
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