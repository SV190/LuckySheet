/**
 * Отладочные функции для проверки работы с ячейками LuckySheet
 */

// Функция для получения информации о выделенной ячейке
export const getSelectedCellInfo = () => {
  if (!window.luckysheet) {
    console.error('LuckySheet не инициализирован')
    return null
  }
  
  const info = {
    method1: null,
    method2: null,
    method3: null,
    method4: null
  }
  
  try {
    // Метод 1: getRangeByTxt
    const selection1 = window.luckysheet.getRangeByTxt()
    if (selection1 && selection1.length > 0) {
      const range = selection1[0]
      info.method1 = {
        row: range.row[0],
        col: range.column[0],
        cell: `${String.fromCharCode(65 + range.column[0])}${range.row[0] + 1}`
      }
    }
    
    // Метод 2: getRange
    const selection2 = window.luckysheet.getRange()
    if (selection2 && selection2.length > 0) {
      const range = selection2[0]
      info.method2 = {
        row: range.row[0],
        col: range.column[0],
        cell: `${String.fromCharCode(65 + range.column[0])}${range.row[0] + 1}`
      }
    }
    
    // Метод 3: getActiveCell
    const activeCell = window.luckysheet.getActiveCell()
    if (activeCell) {
      info.method3 = {
        row: activeCell.row,
        col: activeCell.column,
        cell: `${String.fromCharCode(65 + activeCell.column)}${activeCell.row + 1}`
      }
    }
    
    // Метод 4: getCellValue (попробуем найти активную ячейку)
    const allCells = document.querySelectorAll('.luckysheet-cell-selected')
    if (allCells.length > 0) {
      const firstCell = allCells[0]
      const row = parseInt(firstCell.getAttribute('data-row'))
      const col = parseInt(firstCell.getAttribute('data-col'))
      if (!isNaN(row) && !isNaN(col)) {
        info.method4 = {
          row: row,
          col: col,
          cell: `${String.fromCharCode(65 + col)}${row + 1}`
        }
      }
    }
    
    console.log('Информация о выделенной ячейке:', info)
    return info
    
  } catch (error) {
    console.error('Ошибка получения информации о ячейке:', error)
    return null
  }
}

// Функция для тестирования создания переключателя
export const testToggleCreation = (row, col) => {
  console.log(`Тестирование создания переключателя в ячейке ${String.fromCharCode(65 + col)}${row + 1}`)
  
  // Проверяем, есть ли элемент ячейки
  const cellSelectors = [
    `[data-row="${row}"][data-col="${col}"]`,
    `.luckysheet-cell-selected[data-row="${row}"][data-col="${col}"]`,
    `.boolean-toggle-cell[data-row="${row}"][data-col="${col}"]`
  ]
  
  cellSelectors.forEach((selector, index) => {
    const element = document.querySelector(selector)
    console.log(`Селектор ${index + 1} (${selector}):`, element ? 'найден' : 'не найден')
    if (element) {
      console.log('Элемент:', element)
      console.log('Стили:', element.style)
      console.log('Классы:', element.className)
    }
  })
  
  // Проверяем значение в LuckySheet
  if (window.luckysheet) {
    const value = window.luckysheet.getCellValue(row, col)
    console.log(`Значение в LuckySheet:`, value)
  }
}

// Функция для создания тестового переключателя
export const createTestToggle = () => {
  const info = getSelectedCellInfo()
  if (!info) {
    alert('Не удалось получить информацию о выделенной ячейке')
    return
  }
  
  // Используем первый доступный метод
  const cellInfo = info.method1 || info.method2 || info.method3 || info.method4
  
  if (!cellInfo) {
    alert('Не удалось определить выделенную ячейку')
    return
  }
  
  console.log(`Создание тестового переключателя в ${cellInfo.cell}`)
  
  // Импортируем и используем функцию создания переключателя
  import('./booleanToggle.js').then(module => {
    const success = module.createBooleanToggle(cellInfo.row, cellInfo.col, false, module.toggleStyles.modern)
    if (success) {
      alert(`Тестовый переключатель создан в ${cellInfo.cell}`)
      testToggleCreation(cellInfo.row, cellInfo.col)
    } else {
      alert('Ошибка создания тестового переключателя')
    }
  })
}

// Функция для отладки DOM
export const debugDOM = () => {
  console.log('=== ОТЛАДКА DOM ===')
  
  // Проверяем контейнер LuckySheet
  const container = document.querySelector('#luckysheet') || document.querySelector('.luckysheet-container')
  console.log('Контейнер LuckySheet:', container)
  
  // Проверяем все ячейки
  const allCells = document.querySelectorAll('.luckysheet-cell-selected')
  console.log(`Найдено ячеек: ${allCells.length}`)
  
  // Показываем первые 5 ячеек
  allCells.forEach((cell, index) => {
    if (index < 5) {
      console.log(`Ячейка ${index + 1}:`, {
        element: cell,
        row: cell.getAttribute('data-row'),
        col: cell.getAttribute('data-col'),
        classes: cell.className,
        styles: cell.style.cssText
      })
    }
  })
  
  // Проверяем наши переключатели
  const toggles = document.querySelectorAll('.boolean-toggle-cell')
  console.log(`Найдено переключателей: ${toggles.length}`)
  
  toggles.forEach((toggle, index) => {
    console.log(`Переключатель ${index + 1}:`, {
      element: toggle,
      row: toggle.getAttribute('data-row'),
      col: toggle.getAttribute('data-col'),
      classes: toggle.className,
      styles: toggle.style.cssText
    })
  })
} 