import json
import uuid
import urllib3

# Отключаем предупреждения SSL
urllib3.disable_warnings()

def handler(request):
    """
    Тестирование GigaChat API напрямую с Client Secret
    """
    
    # Импортируем requests внутри handler для быстрого старта
    import requests
    
    client_secret = "b54c49b7-df1c-45ce-a674-c40dac1ce101"
    
    results = {
        "oauth_request": {},
        "chat_request": {},
        "client_secret_works": False,
        "summary": ""
    }
    
    # Шаг 1: Получение access_token
    oauth_url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    rq_uid = str(uuid.uuid4())
    
    oauth_headers = {
        "Authorization": f"Basic {client_secret}",
        "RqUID": rq_uid,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    oauth_data = "scope=GIGACHAT_API_PERS"
    
    results["oauth_request"]["url"] = oauth_url
    results["oauth_request"]["rq_uid"] = rq_uid
    results["oauth_request"]["headers_sent"] = {
        "Authorization": f"Basic {client_secret}",
        "RqUID": rq_uid
    }
    
    try:
        print(f"[1/2] Запрос OAuth token...")
        oauth_response = requests.post(
            oauth_url,
            headers=oauth_headers,
            data=oauth_data,
            verify=False,
            timeout=10
        )
        
        results["oauth_request"]["status_code"] = oauth_response.status_code
        results["oauth_request"]["response_headers"] = dict(oauth_response.headers)
        
        print(f"OAuth Response Status: {oauth_response.status_code}")
        
        try:
            oauth_json = oauth_response.json()
            results["oauth_request"]["response"] = oauth_json
        except:
            results["oauth_request"]["response"] = {
                "text": oauth_response.text[:500],
                "error": "Failed to parse JSON"
            }
        
        # Если получили токен успешно
        if oauth_response.status_code == 200:
            try:
                oauth_json = oauth_response.json()
                access_token = oauth_json.get("access_token")
                
                if access_token:
                    results["oauth_request"]["access_token_received"] = True
                    results["client_secret_works"] = True
                    results["oauth_request"]["token_preview"] = access_token[:30] + "..."
                    
                    print(f"[2/2] Запрос к GigaChat API...")
                    
                    # Шаг 2: Запрос к GigaChat API
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
                    
                    results["chat_request"]["url"] = chat_url
                    results["chat_request"]["payload"] = chat_payload
                    
                    try:
                        chat_response = requests.post(
                            chat_url,
                            headers=chat_headers,
                            json=chat_payload,
                            verify=False,
                            timeout=20
                        )
                        
                        results["chat_request"]["status_code"] = chat_response.status_code
                        
                        print(f"Chat Response Status: {chat_response.status_code}")
                        
                        try:
                            chat_json = chat_response.json()
                            results["chat_request"]["response"] = chat_json
                            
                            # Извлекаем ответ от GigaChat если есть
                            if chat_response.status_code == 200:
                                if "choices" in chat_json and len(chat_json["choices"]) > 0:
                                    message = chat_json["choices"][0].get("message", {})
                                    content = message.get("content", "")
                                    results["chat_request"]["gigachat_answer"] = content
                                    results["summary"] = f"✓ SUCCESS: Client Secret работает! GigaChat ответил: {content[:100]}"
                                    print(f"GigaChat Answer: {content}")
                            else:
                                results["summary"] = f"✗ ERROR: Chat API вернул статус {chat_response.status_code}"
                        except:
                            results["chat_request"]["response"] = {
                                "text": chat_response.text[:500],
                                "error": "Failed to parse JSON"
                            }
                            results["summary"] = f"✗ ERROR: Chat API вернул не-JSON ответ"
                        
                    except Exception as e:
                        results["chat_request"]["error"] = str(e)
                        results["summary"] = f"✗ ERROR: Chat request failed - {str(e)}"
                        print(f"Chat Error: {str(e)}")
                else:
                    results["oauth_request"]["access_token_received"] = False
                    results["summary"] = "✗ ERROR: Access token не найден в OAuth ответе"
            except Exception as e:
                results["summary"] = f"✗ ERROR: Failed to parse OAuth response - {str(e)}"
                print(f"Parse Error: {str(e)}")
        else:
            results["oauth_request"]["access_token_received"] = False
            results["summary"] = f"✗ ERROR: OAuth failed with status {oauth_response.status_code}"
    
    except Exception as e:
        results["oauth_request"]["error"] = str(e)
        results["summary"] = f"✗ ERROR: OAuth request exception - {str(e)}"
        print(f"OAuth Error: {str(e)}")
    
    # Финальный отчет
    print("\n" + "=" * 60)
    print("РЕЗУЛЬТАТ ТЕСТИРОВАНИЯ:")
    print("=" * 60)
    print(f"Client Secret работает: {results['client_secret_works']}")
    print(f"OAuth статус: {results['oauth_request'].get('status_code', 'Error')}")
    print(f"Chat API статус: {results['chat_request'].get('status_code', 'N/A')}")
    print(f"Итог: {results['summary']}")
    print("=" * 60)
    
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json; charset=utf-8"
        },
        "body": json.dumps(results, ensure_ascii=False, indent=2)
    }
