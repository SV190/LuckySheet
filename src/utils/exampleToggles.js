/**
 * Примеры использования переключателей булевых значений
 */

import { 
  createBooleanToggle, 
  createBooleanToggleList, 
  createBooleanToggleMatrix,
  toggleStyles 
} from './booleanToggle'

// Создание примера списка задач
export const createTaskListExample = () => {
  const tasks = [
    'Проверить почту',
    'Подготовить отчет',
    'Встреча с клиентом',
    'Обновить документацию',
    'Тестирование системы',
    'Код ревью',
    'Деплой на продакшн',
    'Резервное копирование'
  ]
  
  // Создаем заголовок
  window.luckysheet.setCellValue(0, 0, 'Список задач')
  window.luckysheet.setCellValue(0, 1, 'Статус')
  
  // Создаем список переключателей
  createBooleanToggleList(1, 0, tasks, [], toggleStyles.modern)
  
  // Добавляем формулу для подсчета выполненных задач
  window.luckysheet.setCellValue(10, 0, 'Выполнено задач:')
  window.luckysheet.setCellValue(10, 1, '=COUNTIF(A1:A8, TRUE)')
  
  // Добавляем формулу для процента выполнения
  window.luckysheet.setCellValue(11, 0, 'Процент выполнения:')
  window.luckysheet.setCellValue(11, 1, '=COUNTIF(A1:A8, TRUE) / COUNT(A1:A8) * 100')
}

// Создание примера матрицы настроек
export const createSettingsMatrixExample = () => {
  // Создаем заголовки
  window.luckysheet.setCellValue(0, 0, 'Настройки системы')
  window.luckysheet.setCellValue(1, 0, 'Пользователь 1')
  window.luckysheet.setCellValue(1, 1, 'Пользователь 2')
  window.luckysheet.setCellValue(1, 2, 'Пользователь 3')
  window.luckysheet.setCellValue(1, 3, 'Пользователь 4')
  
  // Создаем матрицу переключателей 5x4
  createBooleanToggleMatrix(2, 0, 5, 4, [], toggleStyles.classic)
  
  // Добавляем названия настроек
  const settings = [
    'Автосохранение',
    'Уведомления',
    'Темная тема',
    'Полноэкранный режим',
    'Синхронизация'
  ]
  
  settings.forEach((setting, index) => {
    window.luckysheet.setCellValue(2 + index, -1, setting)
  })
}

// Создание примера опросника
export const createSurveyExample = () => {
  const questions = [
    'Вы используете Excel ежедневно?',
    'Вам нравится работать с формулами?',
    'Вы предпочитаете графики или таблицы?',
    'Вы используете макросы?',
    'Вы работаете с большими данными?',
    'Вы знаете VBA?',
    'Вы используете Power Query?',
    'Вы работаете с Power BI?'
  ]
  
  // Создаем заголовок
  window.luckysheet.setCellValue(0, 0, 'Опрос пользователей')
  window.luckysheet.setCellValue(0, 1, 'Ответ')
  
  // Создаем список переключателей
  createBooleanToggleList(1, 0, questions, [], toggleStyles.textOnly)
  
  // Добавляем статистику
  window.luckysheet.setCellValue(10, 0, 'Положительных ответов:')
  window.luckysheet.setCellValue(10, 1, '=COUNTIF(A1:A8, TRUE)')
  
  window.luckysheet.setCellValue(11, 0, 'Отрицательных ответов:')
  window.luckysheet.setCellValue(11, 1, '=COUNTIF(A1:A8, FALSE)')
  
  window.luckysheet.setCellValue(12, 0, 'Процент положительных:')
  window.luckysheet.setCellValue(12, 1, '=COUNTIF(A1:A8, TRUE) / COUNT(A1:A8) * 100')
}

// Создание примера с разными стилями
export const createMixedStylesExample = () => {
  // Modern стиль
  window.luckysheet.setCellValue(0, 0, 'Modern стиль')
  createBooleanToggle(1, 0, true, toggleStyles.modern)
  createBooleanToggle(2, 0, false, toggleStyles.modern)
  
  // Classic стиль
  window.luckysheet.setCellValue(0, 2, 'Classic стиль')
  createBooleanToggle(1, 2, true, toggleStyles.classic)
  createBooleanToggle(2, 2, false, toggleStyles.classic)
  
  // Simple стиль
  window.luckysheet.setCellValue(0, 4, 'Simple стиль')
  createBooleanToggle(1, 4, true, toggleStyles.simple)
  createBooleanToggle(2, 4, false, toggleStyles.simple)
  
  // Text Only стиль
  window.luckysheet.setCellValue(0, 6, 'Text Only стиль')
  createBooleanToggle(1, 6, true, toggleStyles.textOnly)
  createBooleanToggle(2, 6, false, toggleStyles.textOnly)
  
  // Icon Only стиль
  window.luckysheet.setCellValue(0, 8, 'Icon Only стиль')
  createBooleanToggle(1, 8, true, toggleStyles.iconOnly)
  createBooleanToggle(2, 8, false, toggleStyles.iconOnly)
}

// Создание примера с пользовательскими настройками
export const createCustomStyleExample = () => {
  // Пользовательский стиль для статуса проекта
  const projectStatusStyle = {
    trueText: 'ГОТОВО',
    falseText: 'В РАБОТЕ',
    trueColor: '#17a2b8',  // Голубой
    falseColor: '#ffc107', // Желтый
    showText: true,
    showIcon: false
  }
  
  // Пользовательский стиль для приоритета
  const priorityStyle = {
    trueText: 'ВЫСОКИЙ',
    falseText: 'НИЗКИЙ',
    trueColor: '#dc3545',  // Красный
    falseColor: '#28a745', // Зеленый
    showText: true,
    showIcon: true,
    iconStyle: 'simple'
  }
  
  // Создаем заголовки
  window.luckysheet.setCellValue(0, 0, 'Проект')
  window.luckysheet.setCellValue(0, 1, 'Статус')
  window.luckysheet.setCellValue(0, 2, 'Приоритет')
  
  const projects = [
    'Веб-сайт компании',
    'Мобильное приложение',
    'API интеграция',
    'База данных',
    'Система безопасности'
  ]
  
  // Создаем проекты с разными стилями
  projects.forEach((project, index) => {
    const row = 1 + index
    
    // Название проекта
    window.luckysheet.setCellValue(row, 0, project)
    
    // Статус проекта
    createBooleanToggle(row, 1, Math.random() > 0.5, projectStatusStyle)
    
    // Приоритет проекта
    createBooleanToggle(row, 2, Math.random() > 0.5, priorityStyle)
  })
}

// Создание полного примера
export const createFullExample = () => {
  // Очищаем таблицу
  if (window.luckysheet) {
    window.luckysheet.clearCell(0, 0, 50, 20)
  }
  
  // Создаем все примеры
  createTaskListExample()
  createSettingsMatrixExample()
  createSurveyExample()
  createMixedStylesExample()
  createCustomStyleExample()
  
  console.log('Полный пример с переключателями создан')
}

// Экспорт всех функций
export default {
  createTaskListExample,
  createSettingsMatrixExample,
  createSurveyExample,
  createMixedStylesExample,
  createCustomStyleExample,
  createFullExample
} 