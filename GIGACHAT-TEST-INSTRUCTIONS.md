# Тестирование GigaChat API - Инструкция

## Общая информация

Вам предоставлены 2 Client Secret для тестирования GigaChat API:
- Client Secret 1: `b54c49b7-df1c-45ce-a674-c40dac1ce101`
- Client Secret 2: `0199bd4a-ab72-7e85-b42e-9ba79c6385bf`

## Способы тестирования

### 1. Через веб-интерфейс (самый простой)

1. Откройте админ-панель: `/admin`
2. В самом верху страницы найдите синюю карточку "Тестирование GigaChat API"
3. Нажмите кнопку "Запустить тест"
4. Дождитесь результата (обычно 10-30 секунд)

**Результат покажет:**
- Какой Client Secret работает
- Статус получения токена
- Статус запроса к API
- Ответ GigaChat на тестовый запрос о фильме "Матрица"
- Точный текст ошибки, если что-то пошло не так

### 2. Через Python скрипт (подробный отчет)

```bash
python3 test-gigachat-direct.py
```

Этот скрипт покажет:
- Все HTTP запросы и ответы
- Headers и данные запросов
- Подробные ошибки на каждом шаге
- Полный ответ от GigaChat

### 3. Через Node.js скрипт

```bash
node test-gigachat-request.js
```

Этот скрипт:
- Вызывает развернутую backend функцию
- Показывает структурированный результат
- Подходит для интеграции в приложение

### 4. Через backend API (для программного доступа)

**Endpoint:** `https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150`

**Метод:** POST

**Body:**
```json
{
  "client_secrets": [
    "b54c49b7-df1c-45ce-a674-c40dac1ce101",
    "0199bd4a-ab72-7e85-b42e-9ba79c6385bf"
  ],
  "query": "Найди информацию о фильме 'Матрица'"
}
```

**Пример ответа (успех):**
```json
{
  "success": true,
  "working_secret": "b54c49b7-df1c-45ce-a674-c40dac1ce101",
  "working_secret_masked": "b54c49b7...ce101",
  "results": [
    {
      "client_secret": "b54c49b7-df1c-45ce-a674-c40dac1ce101",
      "masked_secret": "b54c49b7...ce101",
      "status": "SUCCESS",
      "token_result": {
        "success": true,
        "access_token": "eyJhbGc...",
        "expires_at": 1728334567
      },
      "api_result": {
        "success": true,
        "answer": "Матрица - культовый научно-фантастический фильм...",
        "model": "GigaChat",
        "usage": {
          "prompt_tokens": 15,
          "completion_tokens": 128,
          "total_tokens": 143
        }
      }
    }
  ],
  "summary": {
    "total_tested": 1,
    "working": 1,
    "query": "Найди информацию о фильме 'Матрица'"
  }
}
```

**Пример ответа (ошибка):**
```json
{
  "success": true,
  "working_secret": null,
  "working_secret_masked": null,
  "results": [
    {
      "client_secret": "b54c49b7-df1c-45ce-a674-c40dac1ce101",
      "masked_secret": "b54c49b7...ce101",
      "status": "TOKEN_FAIL",
      "token_result": {
        "success": false,
        "status_code": 401,
        "error": "Unauthorized: Invalid client credentials"
      }
    }
  ],
  "summary": {
    "total_tested": 2,
    "working": 0,
    "query": "Найди информацию о фильме 'Матрица'"
  }
}
```

## Что проверяет тест

1. **Получение access_token:**
   - POST на `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
   - Использует Basic Auth с Client Secret
   - Scope: `GIGACHAT_API_PERS`

2. **Запрос к GigaChat API:**
   - POST на `https://gigachat.devices.sberbank.ru/api/v1/chat/completions`
   - Использует полученный access_token
   - Отправляет запрос: "Найди информацию о фильме 'Матрица'"

## Возможные статусы

- `SUCCESS` - Client Secret работает, API отвечает
- `TOKEN_OK_API_FAIL` - Токен получен, но API не работает
- `TOKEN_FAIL` - Не удалось получить токен

## Возможные ошибки

### Ошибка получения токена

**401 Unauthorized:**
- Client Secret неверный или истек
- Решение: проверьте Client Secret или создайте новый

**403 Forbidden:**
- Нет доступа к GigaChat API
- Решение: активируйте GigaChat в проекте на developers.sber.ru

**Network Error:**
- Нет доступа к серверам Сбербанка
- Решение: проверьте интернет-соединение, firewall

### Ошибка API запроса

**401 Unauthorized:**
- Токен истек (время жизни ~30 минут)
- Решение: получите новый токен

**429 Too Many Requests:**
- Превышен лимит запросов
- Решение: подождите или увеличьте лимиты в настройках

**500 Internal Server Error:**
- Проблемы на стороне GigaChat
- Решение: повторите запрос позже

## Технические детали

### SSL Сертификаты

GigaChat использует самоподписанные сертификаты Сбербанка, поэтому:
- Python: используется `verify=False` в requests
- Node.js/Browser: браузер может показать предупреждение (это нормально)

### Формат авторизации

```
Authorization: Basic {base64(client_secret)}
```

Где `client_secret` кодируется в Base64.

### Время жизни токена

Access token действует примерно 30 минут. После этого нужно получить новый.

## Рекомендации

1. Используйте веб-интерфейс для быстрой проверки
2. Используйте Python скрипт для отладки проблем
3. Сохраните рабочий Client Secret в безопасном месте
4. Не передавайте Client Secret третьим лицам
5. Если оба секрета не работают, создайте новый на developers.sber.ru

## Структура файлов

```
/
├── backend/
│   └── test-gigachat/          # Backend функция для тестирования
│       ├── index.py            # Основной код
│       ├── requirements.txt    # Python зависимости
│       └── tests.json          # Тесты
├── src/pages/
│   └── Admin.tsx               # Админ-панель с UI для тестирования
├── test-gigachat-direct.py    # Прямое тестирование с подробным выводом
├── test-gigachat-request.js   # Тестирование через backend API
└── GIGACHAT-TEST-INSTRUCTIONS.md  # Эта инструкция
```

## Поддержка

Если возникли проблемы:
1. Проверьте результаты теста в веб-интерфейсе
2. Запустите Python скрипт для подробной диагностики
3. Проверьте Client Secret на developers.sber.ru
4. Убедитесь, что GigaChat активирован в проекте
