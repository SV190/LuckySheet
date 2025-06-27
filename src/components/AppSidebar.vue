<template>
  <div class="sidebar">
    <div class="sidebar-top">
      <div class="sidebar-logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span class="sidebar-title">LuckySheet</span>
      </div>
      <nav class="sidebar-nav">
        <button class="sidebar-btn" @click="$emit('toggleSettings')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Настройки
        </button>
        <router-link v-if="isAdmin" to="/admin" class="sidebar-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Админ-панель
        </router-link>
        <button class="sidebar-btn logout" @click="$emit('logout')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Выйти
        </button>
      </nav>
    </div>
    <div class="sidebar-bottom">
      <div v-if="user" class="user-block">
        <div class="user-avatar">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="7" r="4"/>
            <path d="M5.5 21a7.5 7.5 0 0 1 13 0"/>
          </svg>
        </div>
        <div class="user-info">
          <div class="username">{{ user.username }}</div>
          <div v-if="isAdmin" class="role-badge">Админ</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth.js'
const { user, isAdmin } = useAuth()
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  border-left: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  min-height: 100vh;
  box-sizing: border-box;
}
.sidebar-top {
  padding: 32px 16px 0 16px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sidebar-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.sidebar-btn:hover {
  background: #e5e7eb;
  color: #1e293b;
}
.sidebar-btn.logout {
  background: #fee2e2;
  color: #991b1b;
}
.sidebar-btn.logout:hover {
  background: #fecaca;
  color: #991b1b;
}
.sidebar-bottom {
  margin-top: auto;
  padding: 24px 16px 16px 16px;
  border-top: 1px solid #e5e7eb;
}
.user-block {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-avatar {
  width: 40px;
  height: 40px;
  background: #e0e7ef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.username {
  font-weight: 600;
  color: #374151;
  font-size: 16px;
}
.role-badge {
  background: #3b82f6;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}
</style> 