<template>
  <div class="admin-panel">
    <div class="admin-header">
      <div class="header-content">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h1>Админ-панель</h1>
        </div>
        <div class="header-actions">
          <a href="/" class="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Вернуться к приложению
          </a>
        </div>
      </div>
    </div>

    <div class="admin-content">
      <!-- Основная панель -->
      <div class="dashboard">
        <div class="dashboard-header">
          <div class="welcome-section">
            <h2>Добро пожаловать, администратор!</h2>
            <p>Управляйте пользователями и настройками системы</p>
          </div>
          <button @click="logout" class="logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Выйти
          </button>
        </div>

        <div class="dashboard-content">
          <!-- Статистика -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon users-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="stat-info">
                <h3>{{ users.length }}</h3>
                <p>Всего пользователей</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon active-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>
              <div class="stat-info">
                <h3>{{ activeUsers }}</h3>
                <p>Активных пользователей</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon blocked-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div class="stat-info">
                <h3>{{ blockedUsers }}</h3>
                <p>Заблокированных</p>
              </div>
            </div>
          </div>

          <!-- Список пользователей -->
          <div class="users-section">
            <div class="section-header">
              <h3>Управление пользователями</h3>
              <button @click="showCreateModal = true" class="create-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Создать пользователя
              </button>
            </div>
            
            <div class="users-table">
              <div class="table-header">
                <div class="table-cell">ID</div>
                <div class="table-cell">Логин</div>
                <div class="table-cell">Роль</div>
                <div class="table-cell">Статус</div>
                <div class="table-cell">Действия</div>
              </div>
              
              <div v-for="user in users" :key="user.id" class="table-row">
                <div class="table-cell">{{ user.id }}</div>
                <div class="table-cell">{{ user.username }}</div>
                <div class="table-cell">
                  <span :class="['role-badge', user.is_admin ? 'admin' : 'user']">
                    {{ user.is_admin ? 'Админ' : 'Пользователь' }}
                  </span>
                </div>
                <div class="table-cell">
                  <span :class="['status-badge', user.is_blocked ? 'blocked' : 'active']">
                    {{ user.is_blocked ? 'Заблокирован' : 'Активен' }}
                  </span>
                </div>
                <div class="table-cell">
                  <button 
                    v-if="!user.is_admin" 
                    @click="toggleBlock(user)"
                    :class="['action-btn', user.is_blocked ? 'unblock' : 'block']"
                    :disabled="isLoading"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path v-if="user.is_blocked" d="M9 12l2 2 4-4"/>
                      <path v-else d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    </svg>
                    {{ user.is_blocked ? 'Разблокировать' : 'Заблокировать' }}
                  </button>
                </div>
              </div>
              
              <div v-if="users.length === 0" class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <h4>Нет пользователей</h4>
                <p>Создайте первого пользователя для начала работы</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания пользователя -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Создать пользователя</h3>
          <button @click="showCreateModal = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createUser" class="modal-form">
          <div class="form-group">
            <label for="newUsername">Логин</label>
            <input 
              id="newUsername"
              v-model="newUser.username" 
              type="text" 
              placeholder="Введите логин"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="newPassword">Пароль</label>
            <input 
              id="newPassword"
              v-model="newUser.password" 
              type="password" 
              placeholder="Введите пароль"
              required
            />
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newUser.is_admin" />
              <span class="checkmark"></span>
              Администратор
            </label>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="cancel-btn">
              Отмена
            </button>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner"></span>
              <span v-else>Создать</span>
            </button>
          </div>
          
          <div v-if="createError" class="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ createError }}
          </div>
          
          <div v-if="createSuccess" class="success-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            Пользователь успешно создан!
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, logout: authLogout } = useAuth()

// Определяем базовый URL API в зависимости от окружения
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8888/.netlify/functions'
  }
  return '/.netlify/functions'
}

const users = ref([])
const isLoading = ref(false)
const createError = ref('')
const createSuccess = ref(false)
const showCreateModal = ref(false)
const newUser = ref({ username: '', password: '', is_admin: false })

// Вычисляемые свойства для статистики
const activeUsers = computed(() => users.value.filter(u => !u.is_blocked).length)
const blockedUsers = computed(() => users.value.filter(u => u.is_blocked).length)

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('user_token')
    const res = await fetch(`${getApiBaseUrl()}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Ошибка получения пользователей')
    users.value = await res.json()
  } catch (e) {
    console.error('Error fetching users:', e)
    users.value = []
  }
}

const logout = () => {
  authLogout()
  router.push('/login')
}

const createUser = async () => {
  createError.value = ''
  createSuccess.value = false
  isLoading.value = true
  try {
    const token = localStorage.getItem('user_token')
    const res = await fetch(`${getApiBaseUrl()}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newUser.value)
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Ошибка создания')
    }
    createSuccess.value = true
    newUser.value = { username: '', password: '', is_admin: false }
    showCreateModal.value = false
    await fetchUsers()
  } catch (e) {
    createError.value = e.message
  } finally {
    isLoading.value = false
  }
}

const toggleBlock = async (user) => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('user_token')
    await fetch(`${getApiBaseUrl()}/block-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        userId: user.id,
        block: !user.is_blocked 
      })
    })
    await fetchUsers()
  } catch (e) {
    console.error('Ошибка блокировки:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.admin-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1e293b;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background: #f1f5f9;
  transition: all 0.2s;
  font-weight: 500;
}

.back-link:hover {
  background: #e2e8f0;
  color: #475569;
}

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Форма входа */
.login-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  margin-bottom: 1rem;
  color: #3b82f6;
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.login-header p {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper svg {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.input-wrapper input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #ffffff;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background: #2563eb;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #059669;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

/* Дашборд */
.dashboard {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.dashboard-header {
  background: #ffffff;
  color: #1e293b;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.welcome-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.welcome-section p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.dashboard-content {
  padding: 2rem;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.users-icon {
  background: #3b82f6;
}

.active-icon {
  background: #10b981;
}

.blocked-icon {
  background: #ef4444;
}

.stat-info h3 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.stat-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Секция пользователей */
.users-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #2563eb;
}

/* Таблица */
.users-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 150px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px 150px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-cell {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.user {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.blocked {
  background: #fee2e2;
  color: #991b1b;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.block {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.action-btn.block:hover {
  background: #fecaca;
}

.action-btn.unblock {
  background: #d1fae5;
  color: #065f46;
  border-color: #bbf7d0;
}

.action-btn.unblock:hover {
  background: #bbf7d0;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-state h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #475569;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #374151;
}

.modal-form {
  padding: 1.5rem;
}

.modal-form .form-group {
  margin-bottom: 1.5rem;
}

.modal-form input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #ffffff;
}

.modal-form input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-group {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 0.1875rem;
  top: 0.0625rem;
  width: 0.4375rem;
  height: 0.6875rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  flex: 1;
  padding: 0.625rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.cancel-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.submit-btn {
  flex: 1;
  padding: 0.625rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 768px) {
  .admin-content {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 100px 100px 120px;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .create-btn {
    justify-content: center;
  }
}
</style> 