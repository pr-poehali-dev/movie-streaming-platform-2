#!/usr/bin/env python3
"""
Прямое тестирование GigaChat API с Client Secret
"""

import json
import uuid
import urllib3
import requests

# Отключаем предупреждения SSL
urllib3.disable_warnings()

def test_gigachat():
    """
    Тестирование GigaChat API напрямую с Client Secret
    """
    
    client_secret = "b54c49b7-df1c-45ce-a674-c40dac1ce101"
    
    results = {
        "oauth_request": {},
        "chat_request": {},
        "client_secret_works": False
    }
    
    # Шаг 1: Получение access_token
    print("=" * 60)
    print("ШАГ 1: Получение access_token")
    print("=" * 60)
    
    oauth_url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    rq_uid = str(uuid.uuid4())
    
    oauth_headers = {
        "Authorization": f"Basic {client_secret}",
        "RqUID": rq_uid,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    oauth_data = {
        "scope": "GIGACHAT_API_PERS"
    }
    
    print(f"URL: {oauth_url}")
    print(f"RqUID: {rq_uid}")
    print(f"Headers:")
    for key, value in oauth_headers.items():
        print(f"  {key}: {value}")
    print(f"Data: {oauth_data}")
    print()
    
    try:
        oauth_response = requests.post(
            oauth_url,
            headers=oauth_headers,
            data=oauth_data,
            verify=False,
            timeout=30
        )
        
        results["oauth_request"]["status_code"] = oauth_response.status_code
        results["oauth_request"]["url"] = oauth_url
        results["oauth_request"]["rq_uid"] = rq_uid
        
        print(f"Статус код: {oauth_response.status_code}")
        print(f"Response Headers:")
        for key, value in oauth_response.headers.items():
            print(f"  {key}: {value}")
        print()
        
        try:
            oauth_json = oauth_response.json()
            results["oauth_request"]["response"] = oauth_json
            print(f"Response JSON:")
            print(json.dumps(oauth_json, indent=2, ensure_ascii=False))
        except Exception as json_err:
            results["oauth_request"]["response"] = oauth_response.text
            print(f"Response Text (не JSON):")
            print(oauth_response.text)
            print(f"JSON Parse Error: {json_err}")
        
        print()
        
        # Если получили токен успешно
        if oauth_response.status_code == 200:
            try:
                oauth_json = oauth_response.json()
                access_token = oauth_json.get("access_token")
                
                if access_token:
                    results["oauth_request"]["access_token_received"] = True
                    results["client_secret_works"] = True
                    
                    print("✓ Access token получен успешно!")
                    print(f"Access Token (первые 50 символов): {access_token[:50]}...")
                    print(f"Expires in: {oauth_json.get('expires_at', 'N/A')}")
                    print()
                    
                    # Шаг 2: Запрос к GigaChat API
                    print("=" * 60)
                    print("ШАГ 2: Запрос к GigaChat API")
                    print("=" * 60)
                    
                    chat_url = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
                    
                    chat_headers = {
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json"
                    }
                    
                    chat_payload = {
                        "model": "GigaChat",
                        "messages": [
                            {"role": "user", "content": "Привет"}
                        ],
                        "temperature": 0.7
                    }
                    
                    print(f"URL: {chat_url}")
                    print(f"Headers:")
                    print(f"  Authorization: Bearer {access_token[:30]}...")
                    print(f"  Content-Type: application/json")
                    print(f"Payload:")
                    print(json.dumps(chat_payload, indent=2, ensure_ascii=False))
                    print()
                    
                    try:
                        chat_response = requests.post(
                            chat_url,
                            headers=chat_headers,
                            json=chat_payload,
                            verify=False,
                            timeout=60
                        )
                        
                        results["chat_request"]["status_code"] = chat_response.status_code
                        results["chat_request"]["url"] = chat_url
                        
                        print(f"Статус код: {chat_response.status_code}")
                        print()
                        
                        try:
                            chat_json = chat_response.json()
                            results["chat_request"]["response"] = chat_json
                            print(f"Response JSON:")
                            print(json.dumps(chat_json, indent=2, ensure_ascii=False))
                            
                            # Извлекаем ответ от GigaChat если есть
                            if chat_response.status_code == 200:
                                if "choices" in chat_json and len(chat_json["choices"]) > 0:
                                    message = chat_json["choices"][0].get("message", {})
                                    content = message.get("content", "")
                                    print()
                                    print("=" * 60)
                                    print("✓ ОТВЕТ ОТ GIGACHAT:")
                                    print("=" * 60)
                                    print(content)
                                    print("=" * 60)
                            else:
                                print(f"✗ Ошибка при запросе к Chat API")
                        except Exception as json_err:
                            results["chat_request"]["response"] = chat_response.text
                            print(f"Response Text (не JSON):")
                            print(chat_response.text)
                            print(f"JSON Parse Error: {json_err}")
                        
                    except Exception as e:
                        results["chat_request"]["error"] = str(e)
                        print(f"✗ Exception при запросе к GigaChat API:")
                        print(f"  {type(e).__name__}: {str(e)}")
                else:
                    results["oauth_request"]["access_token_received"] = False
                    print("✗ Access token не найден в ответе OAuth")
            except Exception as e:
                print(f"✗ Exception при обработке OAuth ответа:")
                print(f"  {type(e).__name__}: {str(e)}")
        else:
            results["oauth_request"]["access_token_received"] = False
            print(f"✗ Не удалось получить access_token. Статус: {oauth_response.status_code}")
    
    except Exception as e:
        results["oauth_request"]["error"] = str(e)
        print(f"✗ Exception при OAuth запросе:")
        print(f"  {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print()
    print("=" * 60)
    print("ИТОГОВЫЙ РЕЗУЛЬТАТ:")
    print("=" * 60)
    print(f"Client Secret работает: {results['client_secret_works']}")
    print(f"OAuth статус: {results['oauth_request'].get('status_code', 'Error')}")
    print(f"Chat API статус: {results['chat_request'].get('status_code', 'N/A')}")
    print("=" * 60)
    print()
    print("Полный результат (JSON):")
    print(json.dumps(results, ensure_ascii=False, indent=2))
    
    return results

if __name__ == "__main__":
    test_gigachat()
