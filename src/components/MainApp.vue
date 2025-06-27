<template>
  <div id="app">
    <div class="app-container">
      <div class="main-layout">
        <div class="main-content">
          <FileManager @openFile="openFile" />
        </div>
      </div>
      <div v-if="showSettings" class="settings-modal" @click="showSettings = false">
        <div class="settings-content" @click.stop>
          <h3>Настройки</h3>
          <div class="settings-section">
            <h4>Хранилище</h4>
            <div class="storage-options">
              <label>
                <input type="radio" v-model="storageType" value="local" />
                Локальное хранилище
              </label>
              <label>
                <input type="radio" v-model="storageType" value="dropbox" />
                Dropbox
              </label>
            </div>
          </div>
          <button @click="showSettings = false" class="close-btn">Закрыть</button>
        </div>
      </div>
    </div>
    <div v-if="currentFile" class="editor-container">
      <EditorToolbar 
        :fileName="currentFile.name"
        @save="saveFile"
        @close="closeFile"
      />
      <LuckySheet 
        :data="currentFile.data"
        @update="updateFileData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import FileManager from './FileManager.vue'
import LuckySheet from './LuckySheet.vue'
import EditorToolbar from './EditorToolbar.vue'

const { user, isAdmin, logout } = useAuth()

const showSettings = ref(false)
const storageType = ref('local')
const currentFile = ref(null)

const handleLogout = () => {
  logout()
}

const openFile = (file) => {
  currentFile.value = file
}

const closeFile = () => {
  currentFile.value = null
}

const saveFile = (data) => {
  if (currentFile.value) {
    currentFile.value.data = data
    // Здесь можно добавить логику сохранения
  }
}

const updateFileData = (data) => {
  if (currentFile.value) {
    currentFile.value.data = data
  }
}
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  flex: 1;
  height: 100%;
  flex-direction: row;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.settings-modal {
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
}

.settings-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
}

.settings-section {
  margin: 24px 0;
}

.settings-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.storage-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storage-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.close-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.close-btn:hover {
  background: #2563eb;
}

.editor-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: white;
}
</style> 