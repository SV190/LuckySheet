import Excel from 'exceljs'
import FileSaver from 'file-saver'

// Функция для сохранения файла в формате XLSX
export const saveAsXLSX = async (luckysheetData, fileName) => {
  try {
    // Создаем новую рабочую книгу
    const workbook = new Excel.Workbook()
    
    // Обрабатываем каждый лист
    if (Array.isArray(luckysheetData)) {
      luckysheetData.forEach(sheet => {
        if (sheet && sheet.data && sheet.data.length > 0) {
          const worksheet = workbook.addWorksheet(sheet.name || 'Sheet1')
          
          // Устанавливаем данные ячеек
          setCellData(sheet.data, worksheet)
          
          // Устанавливаем объединения ячеек
          if (sheet.config && sheet.config.merge) {
            setMergeCells(sheet.config.merge, worksheet)
          }
          
          // Устанавливаем границы
          if (sheet.config && sheet.config.borderInfo) {
            setBorders(sheet.config.borderInfo, worksheet)
          }
          
          // Устанавливаем стили
          setStyles(sheet.data, worksheet)
        }
      })
    } else if (luckysheetData.sheets) {
      // Если данные в формате { sheets: [...] }
      Object.keys(luckysheetData.sheets).forEach(sheetName => {
        const sheet = luckysheetData.sheets[sheetName]
        if (sheet && sheet.data && sheet.data.length > 0) {
          const worksheet = workbook.addWorksheet(sheetName)
          
          // Устанавливаем данные ячеек
          setCellData(sheet.data, worksheet)
          
          // Устанавливаем объединения ячеек
          if (sheet.config && sheet.config.merge) {
            setMergeCells(sheet.config.merge, worksheet)
          }
          
          // Устанавливаем границы
          if (sheet.config && sheet.config.borderInfo) {
            setBorders(sheet.config.borderInfo, worksheet)
          }
          
          // Устанавливаем стили
          setStyles(sheet.data, worksheet)
        }
      })
    }
    
    // Генерируем буфер
    const buffer = await workbook.xlsx.writeBuffer()
    
    // Создаем Blob и сохраняем файл
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    // Убираем расширение .xlsx если оно уже есть
    const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
    
    FileSaver.saveAs(blob, finalFileName)
    
    console.log('Файл успешно сохранен в формате XLSX:', finalFileName)
    return { success: true, fileName: finalFileName }
    
  } catch (error) {
    console.error('Ошибка сохранения в XLSX:', error)
    throw error
  }
}

// Функция для установки данных ячеек
const setCellData = (cellData, worksheet) => {
  if (!Array.isArray(cellData)) return
  
  cellData.forEach((row, rowIndex) => {
    if (Array.isArray(row)) {
      row.forEach((cell, colIndex) => {
        if (cell && cell.v !== undefined) {
          const cellAddress = `${createCellPos(colIndex)}${rowIndex + 1}`
          const excelCell = worksheet.getCell(cellAddress)
          
          // Устанавливаем значение
          if (cell.f) {
            // Формула
            excelCell.value = { formula: cell.f, result: cell.v }
          } else {
            // Обычное значение
            excelCell.value = cell.v
          }
          
          // Устанавливаем формат числа если есть
          if (cell.ct && cell.ct.fa) {
            excelCell.numFmt = cell.ct.fa
          }
        }
      })
    }
  })
}

// Функция для установки объединений ячеек
const setMergeCells = (mergeData, worksheet) => {
  if (!mergeData) return
  
  Object.values(mergeData).forEach(merge => {
    if (merge.r !== undefined && merge.c !== undefined && merge.rs && merge.cs) {
      worksheet.mergeCells(
        merge.r + 1,
        merge.c + 1,
        merge.r + merge.rs,
        merge.c + merge.cs
      )
    }
  })
}

// Функция для установки границ
const setBorders = (borderInfo, worksheet) => {
  if (!Array.isArray(borderInfo)) return
  
  borderInfo.forEach(border => {
    if (border.rangeType === 'range' && border.range && border.range[0]) {
      const range = border.range[0]
      const borderStyle = convertBorderStyle(border.borderType, border.style, border.color)
      
      for (let row = range.row[0] + 1; row <= range.row[1] + 1; row++) {
        for (let col = range.column[0] + 1; col <= range.column[1] + 1; col++) {
          const cell = worksheet.getCell(row, col)
          cell.border = borderStyle
        }
      }
    }
  })
}

// Функция для установки стилей
const setStyles = (cellData, worksheet) => {
  if (!Array.isArray(cellData)) return
  
  cellData.forEach((row, rowIndex) => {
    if (Array.isArray(row)) {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const cellAddress = `${createCellPos(colIndex)}${rowIndex + 1}`
          const excelCell = worksheet.getCell(cellAddress)
          
          // Устанавливаем шрифт
          if (cell.ff !== undefined || cell.fc || cell.bl !== undefined || cell.it !== undefined || cell.fs) {
            excelCell.font = convertFont(cell.ff, cell.fc, cell.bl, cell.it, cell.fs, cell.cl, cell.ul)
          }
          
          // Устанавливаем выравнивание
          if (cell.vt || cell.ht || cell.tb !== undefined || cell.tr !== undefined) {
            excelCell.alignment = convertAlignment(cell.vt, cell.ht, cell.tb, cell.tr)
          }
          
          // Устанавливаем заливку
          if (cell.bg) {
            excelCell.fill = convertFill(cell.bg)
          }
        }
      })
    }
  })
}

// Вспомогательные функции для конвертации стилей
const convertFont = (ff = 0, fc = '#000000', bl = 0, it = 0, fs = 10, cl = 0, ul = 0) => {
  const fontMap = {
    0: '微软雅黑',
    1: '宋体',
    2: '黑体',
    3: '楷体',
    4: '仿宋',
    5: '新宋体',
    6: '华文新魏',
    7: '华文行楷',
    8: '华文隶书',
    9: 'Arial',
    10: 'Times New Roman',
    11: 'Tahoma',
    12: 'Verdana'
  }
  
  return {
    name: typeof ff === 'number' ? fontMap[ff] || 'Arial' : ff,
    size: fs,
    color: { argb: fc.replace('#', '') },
    bold: bl === 1,
    italic: it === 1,
    underline: ul === 1,
    strike: cl === 1
  }
}

const convertAlignment = (vt = 'default', ht = 'default', tb = 'default', tr = 'default') => {
  const verticalMap = {
    0: 'middle',
    1: 'top',
    2: 'bottom',
    default: 'top'
  }
  
  const horizontalMap = {
    0: 'center',
    1: 'left',
    2: 'right',
    default: 'left'
  }
  
  return {
    vertical: verticalMap[vt] || 'top',
    horizontal: horizontalMap[ht] || 'left',
    wrapText: tb === 2,
    textRotation: tr === 0 ? 0 : (tr === 1 ? 45 : (tr === 2 ? -45 : 0))
  }
}

const convertFill = (bg) => {
  if (!bg) return {}
  
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: bg.replace('#', '') }
  }
}

const convertBorderStyle = (borderType, style = 1, color = '#000') => {
  if (!borderType) return {}
  
  const styleMap = {
    0: 'none',
    1: 'thin',
    2: 'hair',
    3: 'dotted',
    4: 'dashDot',
    5: 'dashDot',
    6: 'dashDotDot',
    7: 'double',
    8: 'medium',
    9: 'mediumDashed',
    10: 'mediumDashDot',
    11: 'mediumDashDotDot',
    12: 'slantDashDot',
    13: 'thick'
  }
  
  const typeMap = {
    'border-all': 'all',
    'border-top': 'top',
    'border-right': 'right',
    'border-bottom': 'bottom',
    'border-left': 'left'
  }
  
  const template = {
    style: styleMap[style] || 'thin',
    color: { argb: color.replace('#', '') }
  }
  
  const borderTypeName = typeMap[borderType]
  if (borderTypeName === 'all') {
    return {
      top: template,
      right: template,
      bottom: template,
      left: template
    }
  } else if (borderTypeName) {
    return { [borderTypeName]: template }
  }
  
  return {}
}

// Функция для создания позиции ячейки (A1, B2, etc.)
const createCellPos = (n) => {
  let ordA = 'A'.charCodeAt(0)
  let ordZ = 'Z'.charCodeAt(0)
  let len = ordZ - ordA + 1
  let s = ''
  
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s
    n = Math.floor(n / len) - 1
  }
  
  return s
}

// Функция для получения полных данных из LuckySheet
export const getFullLuckySheetData = () => {
  if (!window.luckysheet) {
    throw new Error('LuckySheet не инициализирован')
  }
  
  try {
    // Получаем все листы с полными данными
    const allSheets = window.luckysheet.getAllSheets()
    
    // Получаем дополнительные данные
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
    
    return fullData
  } catch (error) {
    console.error('Ошибка получения данных LuckySheet:', error)
    throw error
  }
} 