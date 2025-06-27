<template>
  <div class="luckysheet-wrapper">
    <div id="luckysheet"></div>
    <div v-show="isMaskShow" id="tip">Загрузка...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { exportExcel } from '../utils/export'
import { isFunction } from '../utils/is'
import LuckyExcel from 'luckyexcel'

const props = defineProps({
  fileData: {
    type: Object,
    default: null
  }
})

const isMaskShow = ref(false)
const jsonData = ref({})
const isInitialized = ref(false)

const preprocessFormula = (formula) => {
  // Заменяем проценты в формуле на их десятичные эквиваленты
  return formula.replace(/(\d+)%/g, (match, number) => {
    return `(${number}/100)`;
  });
};

const createLuckySheet = async (data, title = 'Новый файл') => {
  // Ждем следующего тика для корректной инициализации DOM
  await nextTick()
  
  // Проверяем, что контейнер существует
  const container = document.getElementById('luckysheet')
  if (!container) {
    console.error('Контейнер luckysheet не найден')
    return
  }
  
  // Уничтожаем предыдущий экземпляр
  if (isFunction(window?.luckysheet?.destroy)) {
    window.luckysheet.destroy()
  }

  // Очищаем контейнер
  container.innerHTML = ''

  // Создаем новый экземпляр
  try {
    window.luckysheet.create({
      container: 'luckysheet',
      showinfobar: false,
      data: data || [{
        name: 'Sheet1',
        color: '',
        index: 0,
        status: 1,
        order: 0,
        hide: 0,
        row: 36,
        column: 18,
        defaultRowHeight: 19,
        defaultColWidth: 73,
        celldata: [],
        config: {},
        scrollLeft: 0,
        scrollTop: 0,
        luckysheet_select_save: [],
        calcChain: [],
        isPivotTable: false,
        pivotTable: {},
        filter_select: {},
        filter: null,
        luckysheet_alternateformat_save: [],
        luckysheet_alternateformat_save_modelCustom: [],
        luckysheet_conditionformat_save: {},
        frozen: {},
        chart: [],
        zoomRatio: 1,
        image: [],
        showGridLines: 1,
        dataVerification: {}
      }],
      title: title,
      userInfo: 'Пользователь',
      enableFormula: true,
      allowEdit: true,
      allowEditCell: true,
      merge: {
        enable: true,
        mergeCells: true
      },
      formula: {
        enable: true,
        supportMergedCells: true,
        percentFormat: true,
        preprocess: preprocessFormula
      },
      format: {
        percent: {
          format: '0.00%',
          decimal: 2
        }
      },
      // Отключаем функции экспорта
      allowExport: false,
      allowDownload: false,
      allowPrint: false,
      // Включаем контекстное меню
      showContextMenu: true,
      // Включаем панель инструментов
      showToolbar: true,
      // Включаем строку формул
      showFormulaBar: true,
      // Включаем вкладки листов
      showSheetTab: true,
      // Включаем статусную строку
      showStatusBar: true
    })
    
    isInitialized.value = true
    console.log('LuckySheet успешно создан с данными:', data)
    
    // Принудительно обновляем размеры после создания
    setTimeout(() => {
      if (window.luckysheet && window.luckysheet.resize) {
        window.luckysheet.resize()
      }
      
      // Добавляем обработчик кликов для чекбоксов
      addCheckboxHandlers()
      
      // Исправляем позиционирование элементов LuckySheet
      fixLuckySheetPositioning()
      
      // Добавляем дополнительную защиту от копирования
      addCopyProtection()
      
      // Добавляем обработчики на булевые ячейки (TRUE/FALSE)
      addBooleanToggleHandlers()
    }, 100)
  } catch (error) {
    console.error('Ошибка создания LuckySheet:', error)
  }
}

// Функция для добавления обработчиков чекбоксов
const addCheckboxHandlers = () => {
  setTimeout(() => {
    const container = document.getElementById('luckysheet')
    if (!container) return
    
    // Находим все ячейки с чекбоксами
    const cells = container.querySelectorAll('.luckysheet-cell-selected, .luckysheet-cell')
    
    cells.forEach(cell => {
      const cellText = cell.textContent || cell.innerText
      
      // Проверяем, содержит ли ячейка символы чекбоксов
      if (cellText.includes('☑') || cellText.includes('☐') || 
          cellText.includes('✓') || cellText.includes('✗') ||
          cellText.includes('✅') || cellText.includes('❌')) {
        
        // Добавляем обработчик клика
        cell.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          
          // Получаем координаты ячейки
          const row = cell.getAttribute('data-row')
          const col = cell.getAttribute('data-col')
          
          if (row !== null && col !== null) {
            toggleCheckbox(parseInt(row), parseInt(col))
          }
        })
        
        // Добавляем стили для курсора
        cell.style.cursor = 'pointer'
      }
    })
  }, 500)
}

// Функция для переключения чекбокса
const toggleCheckbox = (row, col) => {
  if (!window.luckysheet) return
  
  try {
    // Получаем текущее значение ячейки
    const currentValue = window.luckysheet.getCellValue(row, col)
    
    // Определяем новое значение
    let newValue
    let newDisplayValue
    
    if (currentValue === true || currentValue === 'TRUE' || 
        currentValue === '☑' || currentValue === '✓' || currentValue === '✅') {
      newValue = false
      newDisplayValue = '☐'
    } else {
      newValue = true
      newDisplayValue = '☑'
    }
    
    // Устанавливаем новое значение
    window.luckysheet.setCellValue(row, col, newValue)
    
    // Обновляем отображение
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cellElement) {
      cellElement.textContent = newDisplayValue
    }
    
    console.log(`Чекбокс переключен: строка ${row}, колонка ${col}, значение: ${newValue}`)
    
  } catch (error) {
    console.error('Ошибка переключения чекбокса:', error)
  }
}

// Функция для исправления позиционирования элементов LuckySheet
const fixLuckySheetPositioning = () => {
  setTimeout(() => {
    const container = document.getElementById('luckysheet')
    if (!container) return
    
    // Находим и исправляем позиционирование панели инструментов LuckySheet
    const toolbars = container.querySelectorAll('.luckysheet-toolbar, .luckysheet-menu-bar, .luckysheet-formula-bar')
    toolbars.forEach(toolbar => {
      if (toolbar) {
        toolbar.style.position = 'fixed'
        toolbar.style.top = '60px'
        toolbar.style.left = '0'
        toolbar.style.right = '0'
        toolbar.style.zIndex = '5'
        toolbar.style.backgroundColor = '#fff'
      }
    })
    
    // Исправляем позиционирование основного контейнера таблицы
    const sheetContainer = container.querySelector('.luckysheet-sheet-container')
    if (sheetContainer) {
      sheetContainer.style.marginTop = '120px'
      sheetContainer.style.height = 'calc(100vh - 120px)'
    }
    
    console.log('Позиционирование элементов LuckySheet исправлено')
  }, 200)
}

// Функция для автоматического сохранения изменений
const autoSave = () => {
  if (!window.luckysheet || !isInitialized.value) return
  
  try {
    // Получаем текущие данные
    const currentData = window.luckysheet.getAllSheets()
    const config = window.luckysheet.getConfig()
    
    // Обновляем локальные данные
    jsonData.value = {
      sheets: currentData,
      config: config,
      timestamp: new Date().toISOString()
    }
    
    console.log('Автосохранение выполнено')
  } catch (error) {
    console.error('Ошибка автосохранения:', error)
  }
}

// Функция для получения полных данных с сохранением всех изменений
const getFullData = () => {
  if (!window.luckysheet || !isInitialized.value) {
    return jsonData.value
  }
  
  try {
    // Получаем все данные из LuckySheet
    const allSheets = window.luckysheet.getAllSheets()
    const config = window.luckysheet.getConfig()
    const calcChain = window.luckysheet.getCalcChain()
    const chart = window.luckysheet.getChart()
    const image = window.luckysheet.getImage()
    
    // Формируем полную структуру данных
    const fullData = {
      sheets: allSheets,
      config: config,
      calcChain: calcChain,
      chart: chart,
      image: image,
      timestamp: new Date().toISOString()
    }
    
    // Обновляем локальные данные
    jsonData.value = fullData
    
    return fullData
  } catch (error) {
    console.error('Ошибка получения полных данных:', error)
    return jsonData.value
  }
}

// Экспортируем функцию для использования в других компонентах
defineExpose({
  getFullData,
  autoSave
})

// Следим за изменениями fileData
watch(() => props.fileData, async (newFileData) => {
  console.log('FileData changed:', newFileData)
  
  if (newFileData) {
    if (newFileData.isNew) {
      // Создаем новый пустой файл
      await createLuckySheet(null, newFileData.name)
    } else if (newFileData.data) {
      // Открываем существующий файл
      console.log('Opening file with data:', newFileData.data)
      
      // Обрабатываем различные форматы данных
      let dataToUse = newFileData.data
      
      // Если данные из localStorage, преобразуем Proxy
      if (newFileData.data && typeof newFileData.data === 'object' && !newFileData.data.sheets) {
        try {
          dataToUse = JSON.parse(JSON.stringify(newFileData.data))
        } catch (e) {
          console.error('Error parsing data:', e)
          dataToUse = newFileData.data
        }
      }
      
      // Проверяем структуру данных и приводим к правильному формату
      if (dataToUse.sheets && Array.isArray(dataToUse.sheets)) {
        // Данные уже в правильном формате
        jsonData.value = dataToUse
        await createLuckySheet(dataToUse.sheets, newFileData.name)
      } else if (dataToUse.data && dataToUse.data.sheets) {
        // Данные вложены в data
        jsonData.value = dataToUse.data
        await createLuckySheet(dataToUse.data.sheets, newFileData.name)
      } else if (Array.isArray(dataToUse)) {
        // Данные уже в виде массива листов
        jsonData.value = { sheets: dataToUse }
        await createLuckySheet(dataToUse, newFileData.name)
      } else {
        console.error('Invalid data structure:', dataToUse)
        await createLuckySheet(null, newFileData.name)
      }
    } else {
      console.error('No data provided for file:', newFileData)
      await createLuckySheet(null, newFileData.name || 'Новый файл')
    }
  }
}, { immediate: true })

// !!! create luckysheet after mounted
onMounted(async () => {
  // Ждем загрузки LuckySheet
  let attempts = 0
  while (!window.luckysheet && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  if (!window.luckysheet) {
    console.error('LuckySheet не загружен')
    return
  }
  
  // Если нет данных файла, создаем пустой лист
  if (!props.fileData) {
    await createLuckySheet(null, 'Новый файл')
  }
  
  // Добавляем обработчик изменений для автосохранения
  if (window.luckysheet) {
    // Автосохранение каждые 30 секунд
    setInterval(() => {
      if (isInitialized.value) {
        autoSave()
      }
    }, 30000)
    
    // Автосохранение при потере фокуса
    window.addEventListener('beforeunload', () => {
      if (isInitialized.value) {
        autoSave()
      }
    })
  }
})

// Функция для добавления защиты от копирования
const addCopyProtection = () => {
  const container = document.getElementById('luckysheet')
  if (!container) return
  
  // Отключаем контекстное меню в контейнере
  container.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  })
  
  // Отключаем перетаскивание
  container.addEventListener('dragstart', (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  })
  
  // Отключаем выделение текста (кроме ячеек)
  container.addEventListener('selectstart', (e) => {
    // Разрешаем выделение только в ячейках
    if (!e.target.closest('.luckysheet-cell, .luckysheet-cell-selected, .luckysheet-cell-editor')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  })
  
  // Отключаем копирование через Ctrl+C
  container.addEventListener('copy', (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  })
  
  // Отключаем вставку через Ctrl+V
  container.addEventListener('paste', (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  })
  
  // Отключаем вырезание через Ctrl+X
  container.addEventListener('cut', (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  })
  
  console.log('Защита от копирования добавлена в LuckySheet')
}

// Функция для добавления обработчиков на булевые ячейки (TRUE/FALSE)
const addBooleanToggleHandlers = () => {
  setTimeout(() => {
    const container = document.getElementById('luckysheet')
    if (!container) return
    // Находим все ячейки с текстом TRUE или FALSE
    const cells = container.querySelectorAll('.luckysheet-cell, .luckysheet-cell-selected')
    cells.forEach(cell => {
      const cellText = (cell.textContent || cell.innerText || '').trim().toUpperCase()
      if (cellText === 'TRUE' || cellText === 'FALSE') {
        cell.style.cursor = 'pointer'
        // Удаляем старый обработчик, если есть
        if (cell._toggleHandler) {
          cell.removeEventListener('click', cell._toggleHandler)
        }
        // Добавляем обработчик клика
        const handler = (e) => {
          e.preventDefault()
          e.stopPropagation()
          const row = cell.getAttribute('data-row')
          const col = cell.getAttribute('data-col')
          if (row !== null && col !== null) {
            const currentValue = window.luckysheet.getCellValue(parseInt(row), parseInt(col))
            window.luckysheet.setCellValue(parseInt(row), parseInt(col), !currentValue)
          }
        }
        cell.addEventListener('click', handler)
        cell._toggleHandler = handler
      }
    })
  }, 500)
}
</script>

<style scoped>
.luckysheet-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  min-height: 0;
}

#luckysheet {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

#tip {
  position: absolute;
  z-index: 1000000;
  left: 0px;
  top: 0px;
  bottom: 0px;
  right: 0px;
  background: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-size: 40px;
  align-items: center;
  justify-content: center;
  display: flex;
}
</style>
