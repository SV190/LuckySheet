<template>
  <div class="dropbox-auth">
    <div v-if="isAuth" class="auth-success">
      <div class="user-info">
        <svg class="dropbox-icon" viewBox="0 0 24 24">
          <path d="M7.78 21.36l-3.3-2.1L1 15.1l3.3-2.1 3.48 2.1-3.3 2.1zM11.26 17.16l3.3-2.1 3.48 2.1-3.3 2.1-3.48-2.1zM1 8.94l3.3-2.1 3.48 2.1-3.3 2.1-3.48-2.1zm11.48-4.2l-3.3 2.1-3.48-2.1 3.3-2.1 3.48 2.1zm-3.3 10.5l-3.48-2.1 3.3-2.1 3.48 2.1-3.3 2.1zm6.78-4.2l-3.3 2.1-3.48-2.1 3.3-2.1 3.48 2.1z" fill="#0061FE"/>
        </svg>
        <div class="user-details">
          <h4>Подключено к Dropbox</h4>
          <p>{{ userInfo?.email || 'Загрузка...' }}</p>
        </div>
      </div>
      <div class="storage-info">
        <div class="storage-bar">
          <div class="storage-used" :style="{ width: storagePercentage + '%' }"></div>
        </div>
        <p class="storage-text">{{ storageUsed }} из {{ storageTotal }} использовано</p>
      </div>
      <div class="sync-controls">
        <button @click="logout" class="logout-btn">Отключиться</button>
      </div>
    </div>
    <div v-else class="auth-prompt">
      <svg class="dropbox-icon" viewBox="0 0 24 24">
        <path d="M7.78 21.36l-3.3-2.1L1 15.1l3.3-2.1 3.48 2.1-3.3 2.1zM11.26 17.16l3.3-2.1 3.48 2.1-3.3 2.1-3.48-2.1zM1 8.94l3.3-2.1 3.48 2.1-3.3 2.1-3.48-2.1zm11.48-4.2l-3.3 2.1-3.48-2.1 3.3-2.1 3.48 2.1zm-3.3 10.5l-3.48-2.1 3.3-2.1 3.48 2.1-3.3 2.1zm6.78-4.2l-3.3 2.1-3.48-2.1 3.3-2.1 3.48 2.1z" fill="#0061FE"/>
      </svg>
      <h4>Войти в Dropbox</h4>
      <p v-if="authError" class="auth-error">{{ authError }}</p>
      <button @click="login" class="auth-btn" :disabled="isLoading">
        <span v-if="isLoading" class="loading-spinner"></span>
        <span v-else>Войти через Dropbox</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dropboxStorage } from '../utils/dropboxStorage.js'

const emit = defineEmits(['auth-changed'])

const userInfo = ref(null)
const storageUsed = ref('0 B')
const storageTotal = ref('2.0 GB')
const storagePercentage = ref(0)
const isAuth = ref(false)
const isLoading = ref(false)
const authError = ref('')

const logout = () => {
  dropboxStorage.logout()
  userInfo.value = null
  isAuth.value = false
  authError.value = ''
  emit('auth-changed', false)
}

const login = async () => {
  isLoading.value = true
  authError.value = ''
  try {
    await dropboxStorage.authenticate()
  } catch (error) {
    authError.value = 'Ошибка входа в Dropbox. Попробуйте еще раз.'
    console.error('Ошибка входа:', error)
  } finally {
    isLoading.value = false
  }
}

const loadStorageInfo = async () => {
  try {
    const userInfoResult = await dropboxStorage.getUserInfo()
    if (userInfoResult) {
      userInfo.value = userInfoResult
      // Dropbox API возвращает размер в байтах
      const usedBytes = userInfoResult.spaceUsed
      const totalBytes = userInfoResult.spaceTotal
      // Функция для форматирования размера
      const formatSize = (bytes) => {
        if (bytes >= 1024 * 1024 * 1024) {
          return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
        } else if (bytes >= 1024 * 1024) {
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
        } else if (bytes >= 1024) {
          return (bytes / 1024).toFixed(1) + ' KB'
        } else {
          return bytes + ' B'
        }
      }
      storageUsed.value = formatSize(usedBytes)
      storageTotal.value = formatSize(totalBytes)
      storagePercentage.value = Math.round((usedBytes / totalBytes) * 100)
    }
  } catch (error) {
    console.error('Ошибка загрузки информации о хранилище:', error)
    if (error.message.includes('повторная авторизация')) {
      authError.value = 'Сессия истекла. Войдите в Dropbox снова.'
      isAuth.value = false
      emit('auth-changed', false)
    }
  }
}

onMounted(async () => {
  // Если есть code в URL, обработать его
  if (window.location.search.includes('code=')) {
    try {
      const success = await dropboxStorage.handleAuthResponse();
      if (success) {
        isAuth.value = true;
        await loadStorageInfo();
        emit('auth-changed', true);
        return;
      }
    } catch (error) {
      console.error('Ошибка обработки кода:', error)
      authError.value = 'Ошибка авторизации. Попробуйте войти снова.'
    }
  }
  // Обычная инициализация
  try {
    isAuth.value = await dropboxStorage.initialize();
    if (isAuth.value) {
      await loadStorageInfo();
      emit('auth-changed', true);
    }
  } catch (error) {
    console.error('Ошибка инициализации Dropbox:', error)
    authError.value = 'Ошибка подключения к Dropbox. Попробуйте войти снова.'
  }
})
</script>

<style scoped>
.dropbox-auth {
  padding: 24px;
}
.auth-header {
  text-align: center;
  margin-bottom: 24px;
}
.dropbox-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
}
.auth-btn {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #0061FE;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.auth-btn:hover:not(:disabled) {
  background: #0051d4;
}
.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.auth-error {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}
.storage-info {
  margin-top: 16px;
}
.storage-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.storage-used {
  height: 100%;
  background: #0061FE;
  transition: width 0.3s ease;
}
.storage-text {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}
.logout-btn {
  margin-top: 16px;
  width: 100%;
  height: 40px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.logout-btn:hover {
  background: #e5e7eb;
}
.auth-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 0;
}
</style> 