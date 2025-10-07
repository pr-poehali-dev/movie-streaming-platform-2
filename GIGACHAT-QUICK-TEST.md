# Быстрый тест GigaChat API

## Самый простой способ (3 клика)

1. Откройте в браузере: http://localhost:5173/admin
2. Найдите синюю карточку "Тестирование GigaChat API" вверху страницы
3. Нажмите кнопку "Запустить тест"
4. Через 10-30 секунд увидите результат

## Что вы увидите

### ✅ Если работает:
```
API работает!
Рабочий Client Secret: b54c49b7-df1c-45ce-a674-c40dac1ce101
Маскированный: b54c49b7...ce101

Ответ GigaChat:
Матрица - культовый научно-фантастический фильм 1999 года...
```

### ❌ Если не работает:
```
API не работает

Client Secret 1: b54c49b7...ce101
Статус: TOKEN_FAIL
Ошибка токена: Unauthorized: Invalid client credentials

Client Secret 2: 0199bd4a...85bf
Статус: TOKEN_FAIL
Ошибка токена: Unauthorized: Invalid client credentials
```

## Что делать если не работает

1. **Проверьте Client Secret:**
   - Зайдите на https://developers.sber.ru/studio/workspaces
   - Откройте свой проект
   - Проверьте, что Client Secret актуальный

2. **Создайте новый Client Secret:**
   - В проекте перейдите в "Авторизационные данные"
   - Нажмите "Создать авторизационные данные"
   - Выберите "Без ограничения" для срока действия
   - Скопируйте новый Client Secret

3. **Проверьте доступ к GigaChat:**
   - Убедитесь, что GigaChat активирован в проекте
   - Проверьте, что не превышен лимит запросов

## Тестовые Client Secrets

В тесте используются:
- `b54c49b7-df1c-45ce-a674-c40dac1ce101`
- `0199bd4a-ab72-7e85-b42e-9ba79c6385bf`

Если оба не работают - нужно создать новый.

## Альтернативные способы тестирования

### Python (подробная диагностика):
```bash
python3 test-gigachat-direct.py
```

### Node.js:
```bash
node test-gigachat-request.js
```

### Прямой API запрос:
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

## Возможные ошибки и решения

| Ошибка | Что значит | Решение |
|--------|-----------|---------|
| `Unauthorized: Invalid client credentials` | Client Secret неверный | Создайте новый Client Secret |
| `Forbidden` | Нет доступа к GigaChat | Активируйте GigaChat в проекте |
| `Too Many Requests` | Превышен лимит | Подождите или увеличьте лимиты |
| `Network Error` | Нет связи с сервером | Проверьте интернет |
| `TOKEN_OK_API_FAIL` | Токен получен, но API не отвечает | Проверьте статус GigaChat API |

## Техническая информация

**OAuth endpoint:**
```
POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth
Authorization: Basic {base64(client_secret)}
RqUID: {random_uuid}
Body: scope=GIGACHAT_API_PERS
```

**GigaChat endpoint:**
```
POST https://gigachat.devices.sberbank.ru/api/v1/chat/completions
Authorization: Bearer {access_token}
Body: {model, messages, temperature, max_tokens}
```

**SSL:** Используются самоподписанные сертификаты Сбербанка (verify=False)

**Время жизни токена:** ~30 минут

---

**Нужна помощь?** Запустите Python скрипт для детальной диагностики:
```bash
python3 test-gigachat-direct.py
```
