import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const user = ref(null)
const isAuthenticated = ref(false)
const isLoading = ref(false)

// Определяем базовый URL API в зависимости от окружения
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api'
  }
  return '/api'
}

export function useAuth() {
  const router = useRouter()

  // Проверяем, является ли пользователь администратором
  const isAdmin = computed(() => {
    return user.value?.is_admin === true
  })

  // Инициализация состояния авторизации
  const initAuth = () => {
    const token = localStorage.getItem('user_token')
    const userInfo = localStorage.getItem('user_info')
    
    if (token && userInfo) {
      try {
        user.value = JSON.parse(userInfo)
        isAuthenticated.value = true
      } catch (error) {
        logout()
      }
    }
  }

  // Вход в систему
  const login = async (username, password) => {
    isLoading.value = true
    
    try {
      const apiUrl = `${getApiBaseUrl()}/login`;
      console.log('Attempting login to:', apiUrl);
      console.log('Login data:', { username, password: '***' });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      
      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);
      
      const data = await response.json()
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа')
      }
      
      // Сохраняем токен и информацию о пользователе
      localStorage.setItem('user_token', data.token)
      localStorage.setItem('user_info', JSON.stringify({
        id: data.user.id,
        username: data.user.username,
        is_admin: data.user.is_admin
      }))
      
      user.value = {
        id: data.user.id,
        username: data.user.username,
        is_admin: data.user.is_admin
      }
      isAuthenticated.value = true
      
      console.log('Login successful, user:', user.value);
      
      // Перенаправляем на главную страницу
      router.push('/')
      
      return data.user
      
    } catch (error) {
      console.error('Login error:', error);
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Выход из системы
  const logout = () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_info')
    user.value = null
    isAuthenticated.value = false
    router.push('/login')
  }

  // Проверка авторизации для защищенных маршрутов
  const requireAuth = (to, from, next) => {
    if (!isAuthenticated.value) {
      next('/login')
    } else {
      next()
    }
  }

  // Проверка прав администратора
  const requireAdmin = (to, from, next) => {
    if (!isAuthenticated.value) {
      next('/login')
    } else if (!isAdmin.value) {
      next('/')
    } else {
      next()
    }
  }

  // Получение токена для API запросов
  const getToken = () => {
    return localStorage.getItem('user_token')
  }

  // Проверка валидности токена
  const checkTokenValidity = async () => {
    const token = getToken()
    if (!token) return false
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        logout()
        return false
      }
      
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    isAdmin,
    isLoading: computed(() => isLoading.value),
    initAuth,
    login,
    logout,
    requireAuth,
    requireAdmin,
    getToken,
    checkTokenValidity
  }
} 