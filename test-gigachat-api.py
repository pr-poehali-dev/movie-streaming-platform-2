#!/usr/bin/env python3
"""
Скрипт для тестирования GigaChat API с двумя Client Secret
"""
import requests
import json
import uuid
import base64
from urllib3.exceptions import InsecureRequestWarning

# Отключаем предупреждения о самоподписанных сертификатах
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

# Client Secrets для тестирования
CLIENT_SECRETS = [
    "b54c49b7-df1c-45ce-a674-c40dac1ce101",
    "0199bd4a-ab72-7e85-b42e-9ba79c6385bf"
]

# URLs
OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

def get_access_token(client_secret):
    """
    Получение access_token через OAuth
    """
    print(f"\n{'='*80}")
    print(f"Тестирование Client Secret: {client_secret}")
    print(f"{'='*80}")
    
    try:
        # Генерируем уникальный RqUID
        rq_uid = str(uuid.uuid4())
        
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
        
        print(f"\n[1] Получение access_token...")
        print(f"    URL: {OAUTH_URL}")
        print(f"    RqUID: {rq_uid}")
        
        response = requests.post(
            OAUTH_URL,
            headers=headers,
            data=data,
            verify=False,  # Отключаем проверку SSL
            timeout=30
        )
        
        print(f"    Status Code: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get("access_token")
            expires_at = token_data.get("expires_at")
            
            print(f"    ✓ Токен получен успешно!")
            print(f"    Expires at: {expires_at}")
            
            return access_token
        else:
            print(f"    ✗ Ошибка получения токена")
            print(f"    Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"    ✗ Исключение: {str(e)}")
        return None

def test_gigachat_api(access_token):
    """
    Тестирование GigaChat API с полученным токеном
    """
    if not access_token:
        return False
    
    try:
        print(f"\n[2] Тестирование GigaChat API...")
        print(f"    URL: {GIGACHAT_URL}")
        
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
        
        print(f"    Запрос: найди информацию о фильме 'Матрица'")
        
        response = requests.post(
            GIGACHAT_URL,
            headers=headers,
            json=payload,
            verify=False,  # Отключаем проверку SSL
            timeout=60
        )
        
        print(f"    Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                answer = result["choices"][0]["message"]["content"]
                print(f"    ✓ Ответ получен успешно!")
                print(f"\n{'─'*80}")
                print(f"ОТВЕТ GIGACHAT:")
                print(f"{'─'*80}")
                print(answer)
                print(f"{'─'*80}")
                return True
            else:
                print(f"    ✗ Неожиданный формат ответа")
                print(f"    Response: {json.dumps(result, ensure_ascii=False, indent=2)}")
                return False
        else:
            print(f"    ✗ Ошибка запроса к GigaChat")
            print(f"    Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"    ✗ Исключение: {str(e)}")
        return False

def main():
    """
    Основная функция тестирования
    """
    print("="*80)
    print("ТЕСТИРОВАНИЕ GIGACHAT API")
    print("="*80)
    
    working_secret = None
    
    for secret in CLIENT_SECRETS:
        # Получаем токен
        access_token = get_access_token(secret)
        
        if access_token:
            # Тестируем API
            if test_gigachat_api(access_token):
                working_secret = secret
                break
        
        print()
    
    # Итоговый отчет
    print("\n" + "="*80)
    print("ИТОГОВЫЙ ОТЧЕТ")
    print("="*80)
    
    if working_secret:
        print(f"✓ УСПЕШНО!")
        print(f"  Рабочий Client Secret: {working_secret}")
        print(f"  API функционирует корректно")
    else:
        print(f"✗ ОШИБКА!")
        print(f"  Ни один из Client Secret не работает")
        print(f"  Проверьте:")
        print(f"    1. Корректность Client Secret")
        print(f"    2. Доступность endpoints")
        print(f"    3. Права доступа к GigaChat API")
    
    print("="*80)

if __name__ == "__main__":
    main()
