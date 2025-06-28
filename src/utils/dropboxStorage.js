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
      return 'http://localhost:8888/.netlify/functions/api'
    }
    return '/.netlify/functions/api'
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
        const response = await fetch(`${this.getApiBaseUrl()}/dropbox/save-token`, {
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

  // Получить access token с сервера
  async getAccessTokenFromServer() {
    const userToken = localStorage.getItem('user_token');
    const response = await fetch(`${this.getApiBaseUrl()}/dropbox/exchange-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка получения access token');
    return data.access_token;
  }

  // Инициализация сервиса (через сервер)
  async initialize() {
    try {
      this.accessToken = await this.getAccessTokenFromServer();
      this.dbx = await this.createDropboxInstance({ accessToken: this.accessToken });
      await this.dbx.usersGetCurrentAccount();
      this.isAuthenticated = true;
      return true;
    } catch (e) {
      this.logout();
      return false;
    }
  }

  // Перед каждым вызовом Dropbox API — обновлять access token
  async safeApiCall(apiCall) {
    try {
      this.accessToken = await this.getAccessTokenFromServer();
      this.dbx = await this.createDropboxInstance({ accessToken: this.accessToken });
      return await apiCall();
    } catch (error) {
      if (error.status === 401) {
        this.logout();
        throw new Error('Требуется повторная авторизация в Dropbox');
      }
      throw error;
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
    if (!this.dbx) {
      throw new Error('Необходима аутентификация Dropbox');
    }

    return this.safeApiCall(async () => {
      const accountInfo = await this.dbx.usersGetCurrentAccount();
      const spaceInfo = await this.dbx.usersGetSpaceUsage();
      
      this.userInfo = {
        name: accountInfo.result.name.display_name,
        email: accountInfo.result.email,
        spaceUsed: spaceInfo.result.used,
        spaceTotal: spaceInfo.result.allocation.allocated
      };
      return this.userInfo;
    });
  }

  // Загрузка файла
  async uploadFile(filePath, fileData) {
    if (!this.dbx) {
      throw new Error('Необходима аутентификация Dropbox');
    }

    return this.safeApiCall(async () => {
      const jsonString = JSON.stringify(fileData);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const response = await this.dbx.filesUpload({
        path: filePath,
        contents: blob,
        mode: { '.tag': 'overwrite' }
      });
      
      return response;
    });
  }

  // Получение списка файлов
  async getUserFiles() {
    if (!this.dbx) {
      throw new Error('Необходима аутентификация Dropbox');
    }

    return this.safeApiCall(async () => {
      const response = await this.dbx.filesListFolder({ path: '', recursive: true });
      // Фильтруем файлы с расширениями .json и .xlsx
      const files = response.result.entries.filter(
        entry => entry['.tag'] === 'file' && (entry.name.endsWith('.json') || entry.name.endsWith('.xlsx'))
      );
      return files.map(file => ({
        id: file.id,
        name: file.name,
        path: file.path_lower,
        updatedAt: file.client_modified,
        size: file.size
      }));
    });
  }

  // Скачивание файла
  async downloadFile(filePath) {
    if (!this.dbx) {
      throw new Error('Необходима аутентификация Dropbox');
    }

    return this.safeApiCall(async () => {
      const response = await this.dbx.filesDownload({ path: filePath });
      const fileBlob = response.result.fileBlob;
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const fileData = JSON.parse(reader.result);
            
            // Проверяем структуру данных и приводим к правильному формату
            let processedData = fileData;
            
            // Если данные содержат sheets в корне, используем их
            if (fileData.sheets && Array.isArray(fileData.sheets)) {
              processedData = fileData;
            } else if (fileData.data && fileData.data.sheets) {
              // Если данные вложены в data, извлекаем их
              processedData = fileData.data;
            } else if (Array.isArray(fileData)) {
              // Если данные уже в виде массива листов
              processedData = { sheets: fileData };
            }
            
            resolve({
              name: response.result.name,
              data: processedData
            });
          } catch (e) {
            console.error('Ошибка парсинга JSON файла:', e);
            reject(new Error('Ошибка парсинга JSON файла: ' + e.message));
          }
        };
        reader.onerror = () => {
          reject(new Error('Ошибка чтения файла'));
        };
        reader.readAsText(fileBlob);
      });
    });
  }

  // Удаление файла
  async deleteFile(filePath) {
    if (!this.dbx) {
      throw new Error('Необходима аутентификация Dropbox');
    }

    return this.safeApiCall(async () => {
      await this.dbx.filesDeleteV2({ path: filePath });
      return true;
    });
  }
  
  // Выход из аккаунта
  logout() {
    this.accessToken = null;
    this.isAuthenticated = false;
    this.userInfo = null;
    this.dbx = null;
    localStorage.removeItem('dropbox_token');
    console.log('Выход из Dropbox выполнен');
  }

  // Проверка конфигурации
  checkConfiguration() {
    const issues = [];
    if (!this.clientId || this.clientId === 'YOUR_DROPBOX_CLIENT_ID') {
      issues.push('Client ID не настроен');
    }
    return {
      isValid: issues.length === 0,
      issues
    };
  }
  
  // Получение информации о пользователе
  getUserInfoSync() {
    return this.userInfo;
  }

  // --- СОЗДАНИЕ ПАПКИ ---
  async createFolder(folderPath) {
    if (!this.dbx) throw new Error('Необходима аутентификация Dropbox');
    // Гарантируем правильный формат пути
    let path = folderPath.trim();
    if (!path.startsWith('/')) path = '/' + path;
    path = path.replace(/\/+/g, '/').replace(/\/\//g, '/');
    try {
      const response = await this.dbx.filesCreateFolderV2({ path, autorename: false });
      return response;
    } catch (error) {
      // Если папка уже существует — не считать это ошибкой
      if (error?.error?.error_summary?.includes('conflict/folder')) {
        return null;
      }
      console.error('Ошибка создания папки в Dropbox:', error);
      throw error;
    }
  }

  // --- УДАЛЕНИЕ ПАПКИ ---
  async deleteFolder(folderPath) {
    if (!this.dbx) throw new Error('Необходима аутентификация Dropbox');
    try {
      // Сначала получаем список всех файлов в папке
      const filesResponse = await this.dbx.filesListFolder({ path: folderPath, recursive: true });
      const files = filesResponse.result.entries.filter(entry => entry['.tag'] === 'file');
      
      // Удаляем все файлы в папке параллельно
      const deletePromises = files.map(async (file) => {
        try {
          return await this.dbx.filesDeleteV2({ path: file.path_lower });
        } catch (fileError) {
          // Игнорируем ошибки удаления отдельных файлов
          return null;
        }
      });
      
      await Promise.all(deletePromises);
      
      // Теперь удаляем саму папку
      const response = await this.dbx.filesDeleteV2({ path: folderPath });
      return response;
    } catch (error) {
      console.error('Ошибка удаления папки в Dropbox:', error);
      throw error;
    }
  }

  // --- ПОЛУЧЕНИЕ СПИСКА ПАПОК ---
  async getFolders(parentPath = '') {
    if (!this.dbx) throw new Error('Необходима аутентификация Dropbox');
    
    return this.safeApiCall(async () => {
      const response = await this.dbx.filesListFolder({ path: parentPath, recursive: true });
      
      const folders = response.result.entries.filter(entry => entry['.tag'] === 'folder');
      
      const mappedFolders = folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        path: folder.path_lower
      }));
      
      return mappedFolders;
    });
  }

  // --- ПЕРЕМЕЩЕНИЕ ФАЙЛА ---
  async moveFile(fromPath, toPath) {
    if (!this.dbx) throw new Error('Необходима аутентификация Dropbox');
    try {
      const response = await this.dbx.filesMoveV2({ from_path: fromPath, to_path: toPath, autorename: false });
      return response;
    } catch (error) {
      console.error('Ошибка перемещения файла в Dropbox:', error);
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса
export const dropboxStorage = new DropboxStorageService(); 