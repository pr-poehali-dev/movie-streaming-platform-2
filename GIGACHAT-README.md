# GigaChat API - Тестирование Client Secret

## 🚀 Быстрый старт (30 секунд)

### Самый простой способ:

1. **Откройте админ-панель:**
   ```
   http://localhost:5173/admin
   ```

2. **Найдите синюю карточку "Тестирование GigaChat API"** (в самом верху страницы)

3. **Нажмите кнопку "Запустить тест"**

4. **Дождитесь результата** (10-30 секунд)

---

## 📋 Тестируемые Client Secrets

- **Client Secret 1:** `b54c49b7-df1c-45ce-a674-c40dac1ce101`
- **Client Secret 2:** `0199bd4a-ab72-7e85-b42e-9ba79c6385bf`

---

## ✅ Результаты теста

### Если Client Secret работает:
```
✓ API работает!
Рабочий Client Secret: b54c49b7-df1c-45ce-a674-c40dac1ce101
Маскированный: b54c49b7...ce101

Ответ GigaChat:
Матрица - культовый научно-фантастический фильм 1999 года...
```

### Если Client Secret не работает:
```
✗ API не работает

Client Secret 1: b54c49b7...ce101
Статус: TOKEN_FAIL
Ошибка токена: Unauthorized: Invalid client credentials
```

---

## 🛠 Альтернативные способы тестирования

### 1. Python скрипт (подробная диагностика)
```bash
python3 test-gigachat-direct.py
```
**Покажет:** Все HTTP запросы, headers, детальные ошибки

### 2. Node.js скрипт
```bash
node test-gigachat-request.js
```
**Покажет:** Структурированный результат через backend API

### 3. Прямой API запрос
```bash
curl -X POST https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150 \
  -H "Content-Type: application/json" \
  -d '{
    "client_secrets": [
      "b54c49b7-df1c-45ce-a674-c40dac1ce101",
      "0199bd4a-ab72-7e85-b42e-9ba79c6385bf"
    ],
    "query": "Найди информацию о фильме Матрица"
  }'
```

---

## 🔍 Что проверяет тест

1. **Получение access_token через OAuth**
   - Endpoint: `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
   - Метод: Basic Auth с Client Secret
   - Scope: `GIGACHAT_API_PERS`

2. **Запрос к GigaChat API**
   - Endpoint: `https://gigachat.devices.sberbank.ru/api/v1/chat/completions`
   - Метод: Bearer Token
   - Запрос: "Найди информацию о фильме 'Матрица'"

---

## ❌ Возможные ошибки и решения

| Ошибка | Что делать |
|--------|-----------|
| `401 Unauthorized` | Client Secret неверный - создайте новый |
| `403 Forbidden` | Активируйте GigaChat в проекте |
| `429 Too Many Requests` | Превышен лимит - подождите |
| `Network Error` | Проверьте интернет-соединение |

---

## 📚 Документация

- **Быстрый тест:** [GIGACHAT-QUICK-TEST.md](GIGACHAT-QUICK-TEST.md)
- **Полная инструкция:** [GIGACHAT-TEST-INSTRUCTIONS.md](GIGACHAT-TEST-INSTRUCTIONS.md)
- **Подробный отчет:** [GIGACHAT-TEST-REPORT.md](GIGACHAT-TEST-REPORT.md)

---

## 📂 Структура файлов

```
/
├── backend/test-gigachat/          # Backend функция (Python)
│   ├── index.py                    # Основной код API
│   ├── requirements.txt            # Зависимости
│   └── tests.json                  # Тесты
│
├── src/pages/Admin.tsx             # Веб-интерфейс (React)
│
├── test-gigachat-direct.py         # Python скрипт (подробный)
├── test-gigachat-request.js        # Node.js скрипт
│
└── Документация:
    ├── GIGACHAT-README.md          # Этот файл (быстрый старт)
    ├── GIGACHAT-QUICK-TEST.md      # Краткая инструкция
    ├── GIGACHAT-TEST-INSTRUCTIONS.md  # Полная инструкция
    └── GIGACHAT-TEST-REPORT.md     # Технический отчет
```

---

## 🎯 Backend API

**URL:** `https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150`  
**Статус:** Развернут и активен ✅

**Использование:**
```javascript
fetch('https://functions.poehali.dev/ed0587a0-d5ec-4f38-9003-249db2dce150', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_secrets: [
      'b54c49b7-df1c-45ce-a674-c40dac1ce101',
      '0199bd4a-ab72-7e85-b42e-9ba79c6385bf'
    ],
    query: 'Найди информацию о фильме Матрица'
  })
})
.then(res => res.json())
.then(data => {
  if (data.working_secret) {
    console.log('✓ Работает:', data.working_secret);
    console.log('Ответ:', data.results[0].api_result.answer);
  } else {
    console.log('✗ Не работает');
  }
});
```

---

## ⚙️ Технические детали

- **SSL:** Используются самоподписанные сертификаты Сбера (`verify=False`)
- **Время жизни токена:** ~30 минут
- **Формат авторизации:** `Basic {base64(client_secret)}` → `Bearer {access_token}`
- **Лимиты:** 10,000 запросов/месяц (бесплатно)

---

## 🆘 Нужна помощь?

1. **Быстрая проверка:** Откройте `/admin` и нажмите "Запустить тест"
2. **Подробная диагностика:** Запустите `python3 test-gigachat-direct.py`
3. **Создайте новый Client Secret:** https://developers.sber.ru/studio/workspaces

---

## 📝 Что вы получите

После успешного теста вы узнаете:

✅ **Какой Client Secret работает**  
✅ **Работает ли GigaChat API**  
✅ **Точный текст ответа от GigaChat**  
✅ **Точный текст ошибки (если не работает)**

---

**Готово к использованию!** Просто откройте `/admin` и нажмите "Запустить тест" 🚀
