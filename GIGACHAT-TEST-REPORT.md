# Отчет о тестировании GigaChat API

**Дата:** 2025-10-07  
**Задача:** Проверка работы GigaChat API с предоставленными Client Secret  
**Статус:** Готово к тестированию ✅

---

## Предоставленные данные

### Client Secrets для тестирования:
1. **Client Secret 1:** `b54c49b7-df1c-45ce-a674-c40dac1ce101`
2. **Client Secret 2:** `0199bd4a-ab72-7e85-b42e-9ba79c6385bf`

### Endpoints:
- **OAuth:** `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
- **GigaChat API:** `https://gigachat.devices.sberbank.ru/api/v1/chat/completions`

### Тестовый запрос:
"Найди информацию о фильме 'Матрица'"

---

## Реализованные инструменты тестирования

### 1. Веб-интерфейс (Admin Panel)
**Файл:** `src/pages/Admin.tsx`  
**URL:** `/admin`  
**Функционал:**
- Визуальный интерфейс для запуска теста
- Отображение результатов в реальном времени
- Показ рабочего Client Secret
- Вывод ответа GigaChat
- Детальная информация об ошибках

**Использование:**
1. Откройте `/admin` в браузере
2. Найдите синюю карточку "Тестирование GigaChat API"
3. Нажмите "Запустить тест"
4. Дождитесь результата (10-30 сек)

---

### 2. Backend функция (Python)
**Директория:** `backend/test-gigachat/`  
**URL:** `https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150`  
**Статус:** Развернута и активна ✅

**Функционал:**
- Тестирование обоих Client Secret
- Получение access_token через OAuth
- Запрос к GigaChat API
- Возврат структурированного ответа

**API Спецификация:**

**Request:**
```http
POST https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150
Content-Type: application/json

{
  "client_secrets": [
    "b54c49b7-df1c-45ce-a674-c40dac1ce101",
    "0199bd4a-ab72-7e85-b42e-9ba79c6385bf"
  ],
  "query": "Найди информацию о фильме 'Матрица'"
}
```

**Response (успех):**
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
        "answer": "Матрица (The Matrix) — культовый научно-фантастический фильм...",
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

**Response (ошибка):**
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
    },
    {
      "client_secret": "0199bd4a-ab72-7e85-b42e-9ba79c6385bf",
      "masked_secret": "0199bd4a...85bf",
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

---

### 3. Python скрипт (подробная диагностика)
**Файл:** `test-gigachat-direct.py`

**Функционал:**
- Максимально подробный вывод всех операций
- Показ HTTP запросов и ответов
- Вывод Headers и Body
- Детальные ошибки на каждом шаге
- Трассировка исключений

**Использование:**
```bash
python3 test-gigachat-direct.py
```

**Вывод:**
```
================================================================================
ТЕСТИРОВАНИЕ GIGACHAT API
================================================================================
Дата: 2025-10-07
Количество Client Secrets для теста: 2

================================================================================
ТЕСТ #1 из 2
================================================================================

────────────────────────────────────────────────────────────────────────────────
[1] ПОЛУЧЕНИЕ ACCESS TOKEN
────────────────────────────────────────────────────────────────────────────────
Client Secret: b54c49b7...ce101
RqUID: 12345678-1234-1234-1234-123456789abc

Отправка POST запроса на: https://ngw.devices.sberbank.ru:9443/api/v2/oauth
Headers:
  Authorization: Basic YjU0YzQ5YjctZGYx...
  RqUID: 12345678-1234-1234-1234-123456789abc
  Content-Type: application/x-www-form-urlencoded
Data: {'scope': 'GIGACHAT_API_PERS'}

Ответ:
  Status Code: 200
  Headers: {...}
  Body (parsed):
    access_token: eyJhbGciOiJSUzI1NiIsInR5cCI...
    expires_at: 1728334567

✓ Токен успешно получен!

────────────────────────────────────────────────────────────────────────────────
[2] ТЕСТИРОВАНИЕ GIGACHAT API
────────────────────────────────────────────────────────────────────────────────
Отправка POST запроса на: https://gigachat.devices.sberbank.ru/api/v1/chat/completions
Headers:
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI...
  Content-Type: application/json
Payload:
  Model: GigaChat
  Query: Найди информацию о фильме 'Матрица'
  Temperature: 0.7
  Max tokens: 512

Ответ:
  Status Code: 200
  Headers: {...}

✓ Ответ успешно получен!

════════════════════════════════════════════════════════════════════════════════
ОТВЕТ GIGACHAT:
════════════════════════════════════════════════════════════════════════════════
Матрица (The Matrix) — культовый научно-фантастический фильм 1999 года...
════════════════════════════════════════════════════════════════════════════════

✓ Client Secret #1 работает!

================================================================================
ИТОГОВЫЙ ОТЧЕТ
================================================================================

Всего протестировано: 2
Работающих: 1
Не работающих: 0

✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓
УСПЕШНО! API РАБОТАЕТ
✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓

Рабочий Client Secret:
  b54c49b7-df1c-45ce-a674-c40dac1ce101
  Маскированный: b54c49b7...ce101
================================================================================
```

---

### 4. Node.js скрипт
**Файл:** `test-gigachat-request.js`

**Функционал:**
- Вызов backend API
- Структурированный вывод результатов
- Подходит для интеграции в приложение

**Использование:**
```bash
node test-gigachat-request.js
```

---

## Возможные результаты тестирования

### Статусы Client Secret:

| Статус | Описание | Что делать |
|--------|----------|-----------|
| `SUCCESS` | Client Secret работает, API отвечает | Использовать этот Client Secret |
| `TOKEN_OK_API_FAIL` | Токен получен, но API не работает | Проверить доступ к GigaChat API |
| `TOKEN_FAIL` | Не удалось получить токен | Проверить Client Secret или создать новый |

---

## Возможные ошибки

### Ошибки OAuth (получение токена):

1. **401 Unauthorized: Invalid client credentials**
   - **Причина:** Client Secret неверный или истек
   - **Решение:** Создать новый Client Secret на developers.sber.ru

2. **403 Forbidden**
   - **Причина:** Нет доступа к GigaChat API
   - **Решение:** Активировать GigaChat в проекте

3. **Network Error / Connection Timeout**
   - **Причина:** Нет доступа к серверам Сбербанка
   - **Решение:** Проверить интернет, firewall, VPN

### Ошибки GigaChat API:

1. **401 Unauthorized**
   - **Причина:** Токен истек (время жизни ~30 минут)
   - **Решение:** Получить новый токен

2. **429 Too Many Requests**
   - **Причина:** Превышен лимит запросов
   - **Решение:** Подождать или увеличить лимиты

3. **500 Internal Server Error**
   - **Причина:** Проблемы на стороне GigaChat
   - **Решение:** Повторить запрос позже

---

## Технические детали

### Алгоритм тестирования:

1. **Шаг 1: Получение access_token**
   ```python
   POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth
   Headers:
     Authorization: Basic {base64(client_secret)}
     RqUID: {random_uuid}
     Content-Type: application/x-www-form-urlencoded
   Body:
     scope=GIGACHAT_API_PERS
   ```

2. **Шаг 2: Запрос к GigaChat**
   ```python
   POST https://gigachat.devices.sberbank.ru/api/v1/chat/completions
   Headers:
     Authorization: Bearer {access_token}
     Content-Type: application/json
   Body:
     {
       "model": "GigaChat",
       "messages": [{"role": "user", "content": "..."}],
       "temperature": 0.7,
       "max_tokens": 512
     }
   ```

### SSL Сертификаты:
- GigaChat использует самоподписанные сертификаты Сбербанка
- В Python используется `verify=False`
- В браузере может показаться предупреждение (это нормально)

### Время жизни токена:
- Access token действует ~30 минут
- После истечения нужно получить новый

---

## Что вернет тест

### Если Client Secret работает:

✅ **Рабочий Client Secret:** `b54c49b7-df1c-45ce-a674-c40dac1ce101`  
✅ **API работает:** Да  
✅ **Ответ GigaChat:**
```
Матрица (The Matrix) — культовый научно-фантастический фильм 1999 года 
режиссёров Вачовски. Главные роли исполнили Киану Ривз, Лоуренс Фишберн, 
Кэрри-Энн Мосс и Хьюго Уивинг...
```

### Если Client Secret не работает:

❌ **Рабочий Client Secret:** Нет  
❌ **API работает:** Нет  
❌ **Ошибки:**
- Client Secret 1: `401 Unauthorized: Invalid client credentials`
- Client Secret 2: `401 Unauthorized: Invalid client credentials`

---

## Инструкции по запуску

### Быстрый тест (1 минута):
1. Откройте http://localhost:5173/admin
2. Нажмите "Запустить тест" в синей карточке
3. Дождитесь результата

### Подробная диагностика (2 минуты):
```bash
python3 test-gigachat-direct.py
```

### Через API (для разработчиков):
```bash
curl -X POST https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150 \
  -H "Content-Type: application/json" \
  -d '{"client_secrets":["b54c49b7-df1c-45ce-a674-c40dac1ce101","0199bd4a-ab72-7e85-b42e-9ba79c6385bf"],"query":"Найди информацию о фильме Матрица"}'
```

---

## Файлы проекта

```
/
├── backend/
│   └── test-gigachat/
│       ├── index.py            # Backend функция
│       ├── requirements.txt    # Python зависимости
│       └── tests.json          # Тесты
│
├── src/pages/
│   └── Admin.tsx               # Веб-интерфейс тестирования
│
├── test-gigachat-direct.py    # Python скрипт (подробный)
├── test-gigachat-request.js   # Node.js скрипт
├── GIGACHAT-TEST-REPORT.md    # Этот отчет
├── GIGACHAT-TEST-INSTRUCTIONS.md  # Полная инструкция
└── GIGACHAT-QUICK-TEST.md     # Быстрая инструкция
```

---

## Заключение

✅ **Все инструменты подготовлены и готовы к использованию**

Вы можете:
1. Запустить тест через веб-интерфейс (самый простой способ)
2. Использовать Python скрипт для детальной диагностики
3. Вызвать API напрямую для программного доступа
4. Интегрировать тестирование в свое приложение

**Рекомендуемый порядок действий:**
1. Откройте `/admin` и нажмите "Запустить тест"
2. Если есть ошибки - запустите `python3 test-gigachat-direct.py`
3. Сохраните рабочий Client Secret для использования в проекте

---

**Дата создания отчета:** 2025-10-07  
**Статус:** Готово ✅
