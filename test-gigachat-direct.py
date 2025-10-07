#!/usr/bin/env python3
"""
Прямое тестирование GigaChat API без backend функции
Для максимально подробного вывода ошибок
"""
import requests
import json
import uuid
import base64
import sys

# Отключаем предупреждения SSL
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Client Secrets для тестирования
CLIENT_SECRETS = [
    "b54c49b7-df1c-45ce-a674-c40dac1ce101",
    "0199bd4a-ab72-7e85-b42e-9ba79c6385bf"
]

# URLs
OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

def print_separator(char='=', length=80):
    print(char * length)

def print_header(text):
    print_separator()
    print(text)
    print_separator()

def get_access_token(client_secret):
    """Получение access_token через OAuth"""
    print(f"\n{'─'*80}")
    print(f"[1] ПОЛУЧЕНИЕ ACCESS TOKEN")
    print(f"{'─'*80}")
    print(f"Client Secret: {client_secret[:8]}...{client_secret[-8:]}")
    
    try:
        # Генерируем уникальный RqUID
        rq_uid = str(uuid.uuid4())
        print(f"RqUID: {rq_uid}")
        
        # Кодируем client_secret в Base64 для Basic Auth
        auth_string = base64.b64encode(client_secret.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {auth_string}",
            "RqUID": rq_uid,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "scope": "GIGACHAT_API_PERS"
        }
        
        print(f"\nОтправка POST запроса на: {OAUTH_URL}")
        print(f"Headers:")
        for key, value in headers.items():
            if key == "Authorization":
                print(f"  {key}: Basic {value[:20]}...")
            else:
                print(f"  {key}: {value}")
        print(f"Data: {data}")
        
        response = requests.post(
            OAUTH_URL,
            headers=headers,
            data=data,
            verify=False,
            timeout=30
        )
        
        print(f"\nОтвет:")
        print(f"  Status Code: {response.status_code}")
        print(f"  Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                token_data = response.json()
                print(f"  Body (parsed):")
                print(f"    access_token: {token_data.get('access_token', '')[:30]}...")
                print(f"    expires_at: {token_data.get('expires_at', 'N/A')}")
                print(f"\n✓ Токен успешно получен!")
                return token_data.get("access_token")
            except json.JSONDecodeError as e:
                print(f"  ✗ Ошибка парсинга JSON: {e}")
                print(f"  Raw response: {response.text[:500]}")
                return None
        else:
            print(f"  ✗ Ошибка получения токена")
            print(f"  Response body: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"\n✗ Ошибка запроса: {e}")
        return None
    except Exception as e:
        print(f"\n✗ Неожиданная ошибка: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_gigachat_api(access_token):
    """Тестирование GigaChat API"""
    print(f"\n{'─'*80}")
    print(f"[2] ТЕСТИРОВАНИЕ GIGACHAT API")
    print(f"{'─'*80}")
    
    if not access_token:
        print("✗ Нет access_token, пропускаем тест API")
        return False
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "GigaChat",
            "messages": [
                {
                    "role": "user",
                    "content": "Найди информацию о фильме 'Матрица'"
                }
            ],
            "temperature": 0.7,
            "max_tokens": 512
        }
        
        print(f"Отправка POST запроса на: {GIGACHAT_URL}")
        print(f"Headers:")
        for key, value in headers.items():
            if key == "Authorization":
                print(f"  {key}: Bearer {value[:30]}...")
            else:
                print(f"  {key}: {value}")
        print(f"Payload:")
        print(f"  Model: {payload['model']}")
        print(f"  Query: {payload['messages'][0]['content']}")
        print(f"  Temperature: {payload['temperature']}")
        print(f"  Max tokens: {payload['max_tokens']}")
        
        response = requests.post(
            GIGACHAT_URL,
            headers=headers,
            json=payload,
            verify=False,
            timeout=60
        )
        
        print(f"\nОтвет:")
        print(f"  Status Code: {response.status_code}")
        print(f"  Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                
                if "choices" in result and len(result["choices"]) > 0:
                    answer = result["choices"][0]["message"]["content"]
                    
                    print(f"\n✓ Ответ успешно получен!")
                    print(f"\n{'═'*80}")
                    print(f"ОТВЕТ GIGACHAT:")
                    print(f"{'═'*80}")
                    print(answer)
                    print(f"{'═'*80}")
                    
                    if "usage" in result:
                        print(f"\nИспользование токенов:")
                        for key, value in result["usage"].items():
                            print(f"  {key}: {value}")
                    
                    return True
                else:
                    print(f"  ✗ Неожиданный формат ответа")
                    print(f"  Response: {json.dumps(result, ensure_ascii=False, indent=2)}")
                    return False
            except json.JSONDecodeError as e:
                print(f"  ✗ Ошибка парсинга JSON: {e}")
                print(f"  Raw response: {response.text[:500]}")
                return False
        else:
            print(f"  ✗ Ошибка запроса к GigaChat")
            print(f"  Response body: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"\n✗ Ошибка запроса: {e}")
        return False
    except Exception as e:
        print(f"\n✗ Неожиданная ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Основная функция"""
    print_header("ТЕСТИРОВАНИЕ GIGACHAT API")
    print(f"Дата: 2025-10-07")
    print(f"Количество Client Secrets для теста: {len(CLIENT_SECRETS)}")
    
    working_secrets = []
    failed_secrets = []
    
    for i, secret in enumerate(CLIENT_SECRETS, 1):
        print_separator()
        print(f"ТЕСТ #{i} из {len(CLIENT_SECRETS)}")
        print_separator()
        
        # Получаем токен
        access_token = get_access_token(secret)
        
        if access_token:
            # Тестируем API
            if test_gigachat_api(access_token):
                working_secrets.append(secret)
                print(f"\n✓ Client Secret #{i} работает!")
                break  # Прерываем после первого успешного
            else:
                failed_secrets.append((secret, "API_FAIL"))
        else:
            failed_secrets.append((secret, "TOKEN_FAIL"))
    
    # Итоговый отчет
    print_separator()
    print_header("ИТОГОВЫЙ ОТЧЕТ")
    
    print(f"\nВсего протестировано: {len(CLIENT_SECRETS)}")
    print(f"Работающих: {len(working_secrets)}")
    print(f"Не работающих: {len(failed_secrets)}")
    
    if working_secrets:
        print(f"\n{'✓'*40}")
        print("УСПЕШНО! API РАБОТАЕТ")
        print(f"{'✓'*40}")
        for secret in working_secrets:
            print(f"\nРабочий Client Secret:")
            print(f"  {secret}")
            print(f"  Маскированный: {secret[:8]}...{secret[-8:]}")
    else:
        print(f"\n{'✗'*40}")
        print("ОШИБКА! API НЕ РАБОТАЕТ")
        print(f"{'✗'*40}")
        print("\nПричины сбоев:")
        for secret, reason in failed_secrets:
            print(f"  {secret[:8]}...{secret[-8:]}: {reason}")
        
        print("\nВозможные решения:")
        print("  1. Проверьте корректность Client Secret")
        print("  2. Убедитесь, что у вас есть доступ к GigaChat API")
        print("  3. Проверьте сетевое подключение к Sberbank endpoints")
        print("  4. Проверьте, что scope GIGACHAT_API_PERS активен")
    
    print_separator()
    
    return 0 if working_secrets else 1

if __name__ == "__main__":
    sys.exit(main())
