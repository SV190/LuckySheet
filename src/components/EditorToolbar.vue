<template>
  <div class="editor-toolbar">
    <div class="toolbar-left">
      <button @click="$emit('backToFiles')" class="toolbar-btn back-btn" title="Назад к файлам">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <span>К файлам</span>
      </button>
      <div class="separator"></div>
      <div class="file-name-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        <span class="file-name">{{ fileName }}</span>
      </div>
    </div>
    <div class="toolbar-right toolbar-right-full">
      <button @click="$emit('saveToCloud')" class="toolbar-btn cloud-btn compact-cloud-btn" title="В облако">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
        <span>В облако</span>
      </button>
      <button @click="$emit('fullscreen')" class="toolbar-btn fullscreen-btn compact-fullscreen-btn" title="Во весь экран">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        <span>Во весь экран</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  fileName: {
    type: String,
    default: ''
  }
})
defineEmits(['backToFiles', 'saveToCloud', 'fullscreen'])
</script>

<style scoped>
.editor-toolbar {
  flex-shrink: 0;
  height: 48px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-right-full {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 7px;
  background-color: transparent;
  color: #2563eb;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
}
.toolbar-btn svg {
  margin-right: 6px;
}
.toolbar-btn:hover {
  background: #f3f4f6;
}
.back-btn {
  color: #1f2937;
  font-size: 13px;
  height: 28px;
  padding: 0 8px;
  border-radius: 5px;
}
.separator {
  width: 1px;
  height: 18px;
  background-color: #e5e7eb;
  margin: 0 8px;
}
.file-name-container {
  display: flex;
  align-items: center;
  color: #1f2937;
}
.file-name-container svg {
  color: #6b7280;
  margin-right: 8px;
}
.file-name {
  font-weight: 500;
  font-size: 14px;
}
.cloud-btn.compact-cloud-btn {
  background: #059669;
  color: #fff;
  font-size: 14px;
  height: 32px;
  padding: 0 14px;
  border-radius: 7px;
  box-shadow: 0 1px 6px rgba(16,185,129,0.08);
  letter-spacing: 0.2px;
  transition: background 0.2s, box-shadow 0.2s;
}
.cloud-btn.compact-cloud-btn:hover {
  background: #047857;
  box-shadow: 0 2px 12px rgba(16,185,129,0.13);
}
.fullscreen-btn.compact-fullscreen-btn {
  background: #2563eb;
  color: #fff;
  font-size: 14px;
  height: 32px;
  padding: 0 14px;
  border-radius: 7px;
  box-shadow: 0 1px 6px rgba(59,130,246,0.08);
  letter-spacing: 0.2px;
  transition: background 0.2s, box-shadow 0.2s;
}
.fullscreen-btn.compact-fullscreen-btn:hover {
  background: #1d4ed8;
  box-shadow: 0 2px 12px rgba(59,130,246,0.13);
}
@media (max-width: 700px) {
  .editor-toolbar {
    height: 38px;
    padding: 0 2px;
  }
  .toolbar-btn, .cloud-btn.compact-cloud-btn, .fullscreen-btn.compact-fullscreen-btn {
    font-size: 12px;
    padding: 0 6px;
    height: 24px;
  }
  .file-name {
    font-size: 12px;
  }
}
</style> 