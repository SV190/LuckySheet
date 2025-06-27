import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from './composables/useAuth.js'
import MainApp from './components/MainApp.vue'
import AdminPanel from './components/AdminPanel.vue'
import UserAuth from './components/UserAuth.vue'

const routes = [
  {
    path: '/',
    name: 'MainApp',
    component: MainApp,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'UserAuth',
    component: UserAuth,
    meta: { requiresGuest: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Навигационные хуки
router.beforeEach((to, from, next) => {
  const { initAuth, requireAuth, requireAdmin } = useAuth()
  
  // Инициализируем авторизацию при каждом переходе
  initAuth()
  
  // Проверяем требования маршрута
  if (to.meta.requiresAuth && to.meta.requiresAdmin) {
    requireAdmin(to, from, next)
  } else if (to.meta.requiresAuth) {
    requireAuth(to, from, next)
  } else if (to.meta.requiresGuest) {
    // Если пользователь уже авторизован, перенаправляем на главную
    const { isAuthenticated } = useAuth()
    if (isAuthenticated.value) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 