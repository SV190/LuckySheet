# Руководство по переключателям булевых значений

## Обзор

Система LuckySheet теперь поддерживает интерактивные переключатели булевых значений, которые позволяют легко управлять логическими данными в таблицах.

## Основные возможности

### ✅ Функции переключателей
- Создание одиночных переключателей
- Создание списков переключателей
- Создание матриц переключателей
- Различные стили отображения
- Цветовая индикация состояния
- Статистика и подсчеты

### ✅ Стили переключателей
- **Modern** - Современный стиль с иконками и текстом
- **Classic** - Классический стиль с чекбоксами
- **Simple** - Простой стиль только с иконками
- **Text Only** - Только текст без иконок
- **Icon Only** - Только иконки без текста

## Как использовать

### 1. Создание одиночного переключателя

#### Через панель инструментов:
1. Выделите ячейку, где хотите создать переключатель
2. Нажмите кнопку "Вставить переключатель" в панели инструментов
3. Переключатель будет создан с современным стилем

#### Программно:
```javascript
import { createBooleanToggle, toggleStyles } from './utils/booleanToggle'

// Создание переключателя в ячейке A1
createBooleanToggle(0, 0, false, toggleStyles.modern)

// Создание с пользовательскими настройками
createBooleanToggle(1, 1, true, {
  trueText: 'ВКЛ',
  falseText: 'ВЫКЛ',
  trueColor: '#007bff',
  falseColor: '#6c757d',
  showText: true,
  showIcon: true,
  iconStyle: 'classic'
})
```

### 2. Создание списка переключателей

```javascript
import { createBooleanToggleList } from './utils/booleanToggle'

const items = ['Задача 1', 'Задача 2', 'Задача 3', 'Задача 4']
const initialValues = [true, false, true, false]

createBooleanToggleList(2, 0, items, initialValues, toggleStyles.modern)
```

### 3. Создание матрицы переключателей

```javascript
import { createBooleanToggleMatrix } from './utils/booleanToggle'

// Создание матрицы 3x4
createBooleanToggleMatrix(5, 0, 3, 4, [], toggleStyles.simple)
```

## Стили переключателей

### Modern (Современный)
```javascript
toggleStyles.modern = {
  trueText: 'ДА',
  falseText: 'НЕТ',
  trueColor: '#28a745',  // Зеленый
  falseColor: '#dc3545', // Красный
  showText: true,
  showIcon: true,
  iconStyle: 'modern'     // ✅ ❌
}
```

### Classic (Классический)
```javascript
toggleStyles.classic = {
  trueText: 'ВКЛ',
  falseText: 'ВЫКЛ',
  trueColor: '#007bff',  // Синий
  falseColor: '#6c757d', // Серый
  showText: true,
  showIcon: true,
  iconStyle: 'classic'    // ☑ ☐
}
```

### Simple (Простой)
```javascript
toggleStyles.simple = {
  trueText: '✓',
  falseText: '✗',
  trueColor: '#28a745',
  falseColor: '#dc3545',
  showText: false,
  showIcon: true,
  iconStyle: 'simple'     // ✓ ✗
}
```

### Text Only (Только текст)
```javascript
toggleStyles.textOnly = {
  trueText: 'ДА',
  falseText: 'НЕТ',
  trueColor: '#28a745',
  falseColor: '#dc3545',
  showText: true,
  showIcon: false
}
```

### Icon Only (Только иконки)
```javascript
toggleStyles.iconOnly = {
  trueText: '',
  falseText: '',
  trueColor: '#28a745',
  falseColor: '#dc3545',
  showText: false,
  showIcon: true,
  iconStyle: 'modern'
}
```

## Работа с переключателями

### Получение значения
```javascript
import { getBooleanValue } from './utils/booleanToggle'

const value = getBooleanValue(0, 0) // Получить значение из A1
console.log(value) // true или false
```

### Установка значения
```javascript
import { setBooleanValue } from './utils/booleanToggle'

setBooleanValue(0, 0, true, toggleStyles.modern) // Установить true в A1
```

### Переключение значения
```javascript
import { toggleBooleanValue } from './utils/booleanToggle'

toggleBooleanValue(0, 0, toggleStyles.modern) // Переключить значение в A1
```

## Статистика и подсчеты

### Подсчет истинных значений
```javascript
import { countTrueValues } from './utils/booleanToggle'

const trueCount = countTrueValues(0, 9, 0) // Подсчитать true в колонке A (строки 1-10)
console.log(`Истинных значений: ${trueCount}`)
```

### Подсчет ложных значений
```javascript
import { countFalseValues } from './utils/booleanToggle'

const falseCount = countFalseValues(0, 9, 0) // Подсчитать false в колонке A (строки 1-10)
console.log(`Ложных значений: ${falseCount}`)
```

### Процент истинных значений
```javascript
import { getTruePercentage } from './utils/booleanToggle'

const percentage = getTruePercentage(0, 9, 0) // Процент true в колонке A (строки 1-10)
console.log(`Процент истинных значений: ${percentage.toFixed(1)}%`)
```

### Получение всех значений в диапазоне
```javascript
import { getBooleanRangeValues } from './utils/booleanToggle'

const values = getBooleanRangeValues(0, 9, 0) // Все значения в колонке A (строки 1-10)
console.log(values) // [true, false, true, ...]
```

## Примеры использования

### 1. Список задач
```javascript
const tasks = [
  'Проверить почту',
  'Подготовить отчет',
  'Встреча с клиентом',
  'Обновить документацию',
  'Тестирование системы'
]

createBooleanToggleList(1, 0, tasks, [false, false, false, false, false], toggleStyles.modern)
```

### 2. Матрица настроек
```javascript
// Создание матрицы настроек 5x3
createBooleanToggleMatrix(1, 0, 5, 3, [], toggleStyles.classic)

// Добавление заголовков
window.luckysheet.setCellValue(0, 0, 'Настройка 1')
window.luckysheet.setCellValue(0, 1, 'Настройка 2')
window.luckysheet.setCellValue(0, 2, 'Настройка 3')
```

### 3. Опросник
```javascript
const questions = [
  'Вы используете Excel ежедневно?',
  'Вам нравится работать с формулами?',
  'Вы предпочитаете графики или таблицы?',
  'Вы используете макросы?',
  'Вы работаете с большими данными?'
]

createBooleanToggleList(1, 0, questions, [], toggleStyles.textOnly)
```

## Интеграция с формулами

Переключатели возвращают булевые значения (true/false), которые можно использовать в формулах:

```javascript
// Пример формулы для подсчета выполненных задач
// =COUNTIF(A1:A10, TRUE)

// Пример формулы для процента выполнения
// =COUNTIF(A1:A10, TRUE) / COUNT(A1:A10) * 100
```

## Пользовательские настройки

### Создание собственного стиля
```javascript
const customStyle = {
  trueText: 'ГОТОВО',
  falseText: 'В РАБОТЕ',
  trueColor: '#17a2b8',  // Голубой
  falseColor: '#ffc107', // Желтый
  showText: true,
  showIcon: false
}

createBooleanToggle(0, 0, false, customStyle)
```

### Динамическое изменение стиля
```javascript
// Изменение стиля существующего переключателя
setBooleanValue(0, 0, true, toggleStyles.classic)
```

## Советы по использованию

### 1. Выбор стиля
- **Modern** - для современных интерфейсов
- **Classic** - для традиционных таблиц
- **Simple** - для компактного отображения
- **Text Only** - для текстовых отчетов
- **Icon Only** - для визуального представления

### 2. Цветовая схема
- Зеленый/Красный - для статусов (ДА/НЕТ)
- Синий/Серый - для переключателей (ВКЛ/ВЫКЛ)
- Голубой/Желтый - для прогресса (ГОТОВО/В РАБОТЕ)

### 3. Размещение
- Используйте списки для однотипных данных
- Используйте матрицы для настроек
- Размещайте заголовки рядом с переключателями

## Заключение

Переключатели булевых значений предоставляют удобный способ работы с логическими данными в таблицах LuckySheet. Они сочетают в себе функциональность чекбоксов с современным дизайном и гибкими настройками.

Основные преимущества:
- ✅ Интуитивно понятный интерфейс
- ✅ Различные стили отображения
- ✅ Цветовая индикация состояния
- ✅ Интеграция с формулами
- ✅ Статистика и подсчеты
- ✅ Гибкие настройки 