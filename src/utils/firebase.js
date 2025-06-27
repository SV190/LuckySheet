// Firebase конфигурация
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Инициализация Firebase
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

// Сервис для работы с файлами
export class CloudStorageService {
  constructor() {
    this.userId = null;
    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      const userCredential = await signInAnonymously(auth);
      this.userId = userCredential.user.uid;
      console.log('Анонимная авторизация успешна:', this.userId);
    } catch (error) {
      console.error('Ошибка авторизации:', error);
    }
  }

  // Загрузка файла в облако
  async uploadFile(fileName, fileData) {
    if (!this.userId) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      // Создаем Blob из данных файла
      const blob = new Blob([JSON.stringify(fileData)], { type: 'application/json' });
      
      // Создаем ссылку на файл в Firebase Storage
      const fileRef = ref(storage, `users/${this.userId}/files/${fileName}`);
      
      // Загружаем файл
      const snapshot = await uploadBytes(fileRef, blob);
      
      // Получаем URL для скачивания
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Файл успешно загружен:', downloadURL);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        size: snapshot.metadata.size
      };
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      throw error;
    }
  }

  // Скачивание файла из облака
  async downloadFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      const downloadURL = await getDownloadURL(fileRef);
      
      // Скачиваем файл
      const response = await fetch(downloadURL);
      const blob = await response.blob();
      
      // Преобразуем обратно в JSON
      const text = await blob.text();
      return JSON.parse(text);
    } catch (error) {
      console.error('Ошибка скачивания файла:', error);
      throw error;
    }
  }

  // Получение списка файлов пользователя
  async getUserFiles() {
    if (!this.userId) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      const userFilesRef = ref(storage, `users/${this.userId}/files`);
      const result = await listAll(userFilesRef);
      
      const files = [];
      for (const item of result.items) {
        const downloadURL = await getDownloadURL(item);
        files.push({
          name: item.name,
          path: item.fullPath,
          url: downloadURL
        });
      }
      
      return files;
    } catch (error) {
      console.error('Ошибка получения списка файлов:', error);
      throw error;
    }
  }

  // Удаление файла из облака
  async deleteFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      console.log('Файл успешно удален:', filePath);
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      throw error;
    }
  }

  // Синхронизация с localStorage
  async syncWithLocalStorage() {
    try {
      const cloudFiles = await this.getUserFiles();
      const localFiles = JSON.parse(localStorage.getItem('excelFiles') || '[]');
      
      // Объединяем файлы, приоритет у облачных
      const mergedFiles = [...cloudFiles];
      
      // Добавляем локальные файлы, которых нет в облаке
      localFiles.forEach(localFile => {
        const existsInCloud = cloudFiles.some(cloudFile => cloudFile.name === localFile.name);
        if (!existsInCloud) {
          mergedFiles.push(localFile);
        }
      });
      
      return mergedFiles;
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      return JSON.parse(localStorage.getItem('excelFiles') || '[]');
    }
  }
}

// Экспортируем экземпляр сервиса
export const cloudStorage = new CloudStorageService(); 