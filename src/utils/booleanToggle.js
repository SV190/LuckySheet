/**
 * Утилиты для работы с переключателями булевых значений в LuckySheet
 */

// Создание переключателя в указанной ячейке
export const createBooleanToggle = (row, col, initialValue = false, options = {}) => {
  if (!window.luckysheet) {
    console.error('LuckySheet не инициализирован')
    return false
  }
  
  try {
    const {
      trueText = 'ДА',
      falseText = 'НЕТ',
      trueColor = '#28a745',
      falseColor = '#dc3545',
      showText = true,
      showIcon = true,
      iconStyle = 'modern' // 'modern', 'classic', 'simple'
    } = options
    
    const displayValue = getDisplayValue(initialValue, trueText, falseText, showText, showIcon, iconStyle)
    
    // Устанавливаем значение в LuckySheet
    window.luckysheet.setCellValue(row, col, !!initialValue)
    
    // Функция для поиска и стилизации элемента ячейки
    const findAndStyleCell = () => {
      // Пробуем разные селекторы для поиска ячейки
      let cellElement = null
      
      // Селектор 1: по data-атрибутам
      cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
      
      // Селектор 2: по классу и позиции
      if (!cellElement) {
        cellElement = document.querySelector(`.luckysheet-cell-selected[data-row="${row}"][data-col="${col}"]`)
      }
      
      // Селектор 3: по координатам
      if (!cellElement) {
        const cells = document.querySelectorAll('.luckysheet-cell-selected')
        for (let cell of cells) {
          const cellRow = parseInt(cell.getAttribute('data-row'))
          const cellCol = parseInt(cell.getAttribute('data-col'))
          if (cellRow === row && cellCol === col) {
            cellElement = cell
            break
          }
        }
      }
      
      // Селектор 4: по содержимому и позиции
      if (!cellElement) {
        const cells = document.querySelectorAll('.luckysheet-cell-selected')
        for (let cell of cells) {
          const cellRow = parseInt(cell.getAttribute('data-row'))
          const cellCol = parseInt(cell.getAttribute('data-col'))
          if (cellRow === row && cellCol === col) {
            cellElement = cell
            break
          }
        }
      }
      
      // Если элемент не найден, создаем временный элемент
      if (!cellElement) {
        console.warn(`Элемент ячейки не найден для строки ${row}, колонки ${col}`)
        
        // Создаем временный элемент для отображения
        cellElement = document.createElement('div')
        cellElement.className = 'boolean-toggle-cell'
        cellElement.setAttribute('data-row', row)
        cellElement.setAttribute('data-col', col)
        cellElement.setAttribute('data-toggle', 'true')
        
        // Добавляем в контейнер LuckySheet
        const container = document.querySelector('#luckysheet') || document.querySelector('.luckysheet-container')
        if (container) {
          container.appendChild(cellElement)
        }
      }
      
      if (cellElement) {
        // Применяем стили
        cellElement.innerHTML = displayValue
        cellElement.style.cursor = 'pointer'
        cellElement.style.textAlign = 'center'
        cellElement.style.fontWeight = 'bold'
        cellElement.style.borderRadius = '4px'
        cellElement.style.padding = '4px 8px'
        cellElement.style.transition = 'all 0.2s ease'
        cellElement.style.minWidth = '60px'
        cellElement.style.minHeight = '30px'
        cellElement.style.display = 'flex'
        cellElement.style.alignItems = 'center'
        cellElement.style.justifyContent = 'center'
        cellElement.style.userSelect = 'none'
        
        // Устанавливаем цвет в зависимости от значения
        if (initialValue) {
          cellElement.style.backgroundColor = trueColor
          cellElement.style.color = 'white'
        } else {
          cellElement.style.backgroundColor = falseColor
          cellElement.style.color = 'white'
        }
        
        // Удаляем старый обработчик, если есть
        const oldHandler = cellElement._toggleHandler
        if (oldHandler) {
          cellElement.removeEventListener('click', oldHandler)
        }
        
        // Добавляем обработчик клика
        const clickHandler = (e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleBooleanValue(row, col, options)
        }
        
        cellElement.addEventListener('click', clickHandler)
        cellElement._toggleHandler = clickHandler
        
        return true
      }
      
      return false
    }
    
    // Пытаемся найти и стилизовать ячейку сразу
    let styled = findAndStyleCell()
    
    // Если не получилось сразу, пробуем через небольшую задержку
    if (!styled) {
      setTimeout(() => {
        findAndStyleCell()
      }, 100)
    }
    
    console.log(`Переключатель создан: строка ${row}, колонка ${col}, значение: ${initialValue}`)
    return true
  } catch (error) {
    console.error('Ошибка создания переключателя:', error)
    return false
  }
}

// Переключение булевого значения
export const toggleBooleanValue = (row, col, options = {}) => {
  if (!window.luckysheet) return false
  
  try {
    const currentValue = window.luckysheet.getCellValue(row, col)
    const newValue = !currentValue
    
    const {
      trueText = 'ДА',
      falseText = 'НЕТ',
      trueColor = '#28a745',
      falseColor = '#dc3545',
      showText = true,
      showIcon = true,
      iconStyle = 'modern'
    } = options
    
    const displayValue = getDisplayValue(newValue, trueText, falseText, showText, showIcon, iconStyle)
    window.luckysheet.setCellValue(row, col, !!newValue)
    
    // Функция для поиска и обновления элемента ячейки
    const findAndUpdateCell = () => {
      // Пробуем разные селекторы для поиска ячейки
      let cellElement = null
      
      // Селектор 1: по data-атрибутам
      cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
      
      // Селектор 2: по классу и позиции
      if (!cellElement) {
        cellElement = document.querySelector(`.luckysheet-cell-selected[data-row="${row}"][data-col="${col}"]`)
      }
      
      // Селектор 3: по координатам
      if (!cellElement) {
        const cells = document.querySelectorAll('.luckysheet-cell-selected')
        for (let cell of cells) {
          const cellRow = parseInt(cell.getAttribute('data-row'))
          const cellCol = parseInt(cell.getAttribute('data-col'))
          if (cellRow === row && cellCol === col) {
            cellElement = cell
            break
          }
        }
      }
      
      // Селектор 4: по нашему временному элементу
      if (!cellElement) {
        cellElement = document.querySelector(`.boolean-toggle-cell[data-row="${row}"][data-col="${col}"]`)
      }
      
      if (cellElement) {
        // Обновляем отображение
        cellElement.innerHTML = displayValue
        
        // Обновляем цвет
        if (newValue) {
          cellElement.style.backgroundColor = trueColor
          cellElement.style.color = 'white'
        } else {
          cellElement.style.backgroundColor = falseColor
          cellElement.style.color = 'white'
        }
        
        return true
      }
      
      return false
    }
    
    // Пытаемся найти и обновить ячейку сразу
    let updated = findAndUpdateCell()
    
    // Если не получилось сразу, пробуем через небольшую задержку
    if (!updated) {
      setTimeout(() => {
        findAndUpdateCell()
      }, 100)
    }
    
    console.log(`Переключатель изменен: строка ${row}, колонка ${col}, значение: ${newValue}`)
    return newValue
  } catch (error) {
    console.error('Ошибка переключения значения:', error)
    return false
  }
}

// Получение значения переключателя
export const getBooleanValue = (row, col) => {
  if (!window.luckysheet) return false
  
  try {
    return window.luckysheet.getCellValue(row, col)
  } catch (error) {
    console.error('Ошибка получения значения переключателя:', error)
    return false
  }
}

// Установка значения переключателя
export const setBooleanValue = (row, col, value, options = {}) => {
  if (!window.luckysheet) return false
  
  try {
    const {
      trueText = 'ДА',
      falseText = 'НЕТ',
      trueColor = '#28a745',
      falseColor = '#dc3545',
      showText = true,
      showIcon = true,
      iconStyle = 'modern'
    } = options
    
    const displayValue = getDisplayValue(value, trueText, falseText, showText, showIcon, iconStyle)
    window.luckysheet.setCellValue(row, col, !!value)
    
    // Обновляем отображение
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cellElement) {
      cellElement.innerHTML = displayValue
      
      // Обновляем цвет
      if (value) {
        cellElement.style.backgroundColor = trueColor
        cellElement.style.color = 'white'
      } else {
        cellElement.style.backgroundColor = falseColor
        cellElement.style.color = 'white'
      }
    }
    
    console.log(`Значение переключателя установлено: строка ${row}, колонка ${col}, значение: ${value}`)
    return true
  } catch (error) {
    console.error('Ошибка установки значения переключателя:', error)
    return false
  }
}

// Создание списка переключателей
export const createBooleanToggleList = (startRow, startCol, items, initialValues = [], options = {}) => {
  if (!window.luckysheet) return false
  
  try {
    items.forEach((item, index) => {
      const row = startRow + index
      const initialValue = initialValues[index] || false
      
      // Создаем переключатель
      createBooleanToggle(row, startCol, initialValue, options)
      
      // Добавляем текст рядом с переключателем
      window.luckysheet.setCellValue(row, startCol + 1, item)
    })
    
    console.log(`Создан список переключателей: ${items.length} элементов`)
    return true
  } catch (error) {
    console.error('Ошибка создания списка переключателей:', error)
    return false
  }
}

// Создание матрицы переключателей
export const createBooleanToggleMatrix = (startRow, startCol, rows, cols, initialValues = [], options = {}) => {
  if (!window.luckysheet) return false
  
  try {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const row = startRow + i
        const col = startCol + j
        const index = i * cols + j
        const initialValue = initialValues[index] || false
        
        createBooleanToggle(row, col, initialValue, options)
      }
    }
    
    console.log(`Создана матрица переключателей: ${rows}x${cols}`)
    return true
  } catch (error) {
    console.error('Ошибка создания матрицы переключателей:', error)
    return false
  }
}

// Получение всех значений в диапазоне
export const getBooleanRangeValues = (startRow, endRow, col) => {
  if (!window.luckysheet) return []
  
  try {
    const values = []
    for (let row = startRow; row <= endRow; row++) {
      values.push(getBooleanValue(row, col))
    }
    return values
  } catch (error) {
    console.error('Ошибка получения значений диапазона:', error)
    return []
  }
}

// Подсчет истинных значений в диапазоне
export const countTrueValues = (startRow, endRow, col) => {
  const values = getBooleanRangeValues(startRow, endRow, col)
  return values.filter(value => value === true).length
}

// Подсчет ложных значений в диапазоне
export const countFalseValues = (startRow, endRow, col) => {
  const values = getBooleanRangeValues(startRow, endRow, col)
  return values.filter(value => value === false).length
}

// Получение процента истинных значений
export const getTruePercentage = (startRow, endRow, col) => {
  const values = getBooleanRangeValues(startRow, endRow, col)
  const trueCount = values.filter(value => value === true).length
  return values.length > 0 ? (trueCount / values.length) * 100 : 0
}

// Вспомогательная функция для получения отображаемого значения
const getDisplayValue = (value, trueText, falseText, showText, showIcon, iconStyle) => {
  let icon = ''
  
  if (showIcon) {
    switch (iconStyle) {
      case 'modern':
        icon = value ? '✅' : '❌'
        break
      case 'classic':
        icon = value ? '☑' : '☐'
        break
      case 'simple':
        icon = value ? '✓' : '✗'
        break
      default:
        icon = value ? '✅' : '❌'
    }
  }
  
  const text = showText ? (value ? trueText : falseText) : ''
  
  if (showIcon && showText) {
    return `${icon} ${text}`
  } else if (showIcon) {
    return icon
  } else if (showText) {
    return text
  } else {
    return value ? '1' : '0'
  }
}

// Предустановленные стили переключателей
export const toggleStyles = {
  modern: {
    trueText: 'ДА',
    falseText: 'НЕТ',
    trueColor: '#28a745',
    falseColor: '#dc3545',
    showText: true,
    showIcon: true,
    iconStyle: 'modern'
  },
  classic: {
    trueText: 'ВКЛ',
    falseText: 'ВЫКЛ',
    trueColor: '#007bff',
    falseColor: '#6c757d',
    showText: true,
    showIcon: true,
    iconStyle: 'classic'
  },
  simple: {
    trueText: '✓',
    falseText: '✗',
    trueColor: '#28a745',
    falseColor: '#dc3545',
    showText: false,
    showIcon: true,
    iconStyle: 'simple'
  },
  textOnly: {
    trueText: 'ДА',
    falseText: 'НЕТ',
    trueColor: '#28a745',
    falseColor: '#dc3545',
    showText: true,
    showIcon: false
  },
  iconOnly: {
    trueText: '',
    falseText: '',
    trueColor: '#28a745',
    falseColor: '#dc3545',
    showText: false,
    showIcon: true,
    iconStyle: 'modern'
  }
} 