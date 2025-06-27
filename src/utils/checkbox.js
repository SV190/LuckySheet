/**
 * Утилиты для работы с интерактивными чекбоксами в LuckySheet
 */

// Создание чекбокса в указанной ячейке
export const createCheckbox = (row, col, initialValue = false) => {
  if (!window.luckysheet) {
    console.error('LuckySheet не инициализирован')
    return
  }
  
  try {
    const displayValue = initialValue ? '☑' : '☐'
    window.luckysheet.setCellValue(row, col, !!initialValue)
    
    // Устанавливаем отображение
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cellElement) {
      cellElement.textContent = displayValue
      cellElement.style.cursor = 'pointer'
    }
    
    console.log(`Чекбокс создан: строка ${row}, колонка ${col}, значение: ${initialValue}`)
    return true
  } catch (error) {
    console.error('Ошибка создания чекбокса:', error)
    return false
  }
}

// Переключение значения чекбокса
export const toggleCheckbox = (row, col) => {
  if (!window.luckysheet) return false
  
  try {
    const currentValue = window.luckysheet.getCellValue(row, col)
    const newValue = !currentValue
    const newDisplayValue = newValue ? '☑' : '☐'
    
    window.luckysheet.setCellValue(row, col, !!newValue)
    
    // Обновляем отображение
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cellElement) {
      cellElement.textContent = newDisplayValue
    }
    
    console.log(`Чекбокс переключен: строка ${row}, колонка ${col}, значение: ${newValue}`)
    return newValue
  } catch (error) {
    console.error('Ошибка переключения чекбокса:', error)
    return false
  }
}

// Получение значения чекбокса
export const getCheckboxValue = (row, col) => {
  if (!window.luckysheet) return false
  
  try {
    return window.luckysheet.getCellValue(row, col)
  } catch (error) {
    console.error('Ошибка получения значения чекбокса:', error)
    return false
  }
}

// Установка значения чекбокса
export const setCheckboxValue = (row, col, value) => {
  if (!window.luckysheet) return false
  
  try {
    const displayValue = value ? '☑' : '☐'
    window.luckysheet.setCellValue(row, col, !!value)
    
    // Обновляем отображение
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cellElement) {
      cellElement.textContent = displayValue
    }
    
    console.log(`Значение чекбокса установлено: строка ${row}, колонка ${col}, значение: ${value}`)
    return true
  } catch (error) {
    console.error('Ошибка установки значения чекбокса:', error)
    return false
  }
}

// Создание списка чекбоксов
export const createCheckboxList = (startRow, startCol, items, initialValues = []) => {
  if (!window.luckysheet) return false
  
  try {
    items.forEach((item, index) => {
      const row = startRow + index
      const initialValue = initialValues[index] || false
      
      // Создаем чекбокс
      createCheckbox(row, startCol, initialValue)
      
      // Добавляем текст рядом с чекбоксом
      window.luckysheet.setCellValue(row, startCol + 1, item)
    })
    
    console.log(`Создан список чекбоксов: ${items.length} элементов`)
    return true
  } catch (error) {
    console.error('Ошибка создания списка чекбоксов:', error)
    return false
  }
}

// Получение всех значений чекбоксов в диапазоне
export const getCheckboxRangeValues = (startRow, endRow, col) => {
  if (!window.luckysheet) return []
  
  try {
    const values = []
    for (let row = startRow; row <= endRow; row++) {
      values.push(getCheckboxValue(row, col))
    }
    return values
  } catch (error) {
    console.error('Ошибка получения значений диапазона чекбоксов:', error)
    return []
  }
}

// Подсчет отмеченных чекбоксов в диапазоне
export const countCheckedCheckboxes = (startRow, endRow, col) => {
  const values = getCheckboxRangeValues(startRow, endRow, col)
  return values.filter(value => value === true).length
} 