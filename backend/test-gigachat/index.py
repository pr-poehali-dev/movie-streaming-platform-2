import requests
import json
import uuid
import base64
from urllib3.exceptions import InsecureRequestWarning
from flask import jsonify

# Отключаем предупреждения о самоподписанных сертификатах
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

# URLs
OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

def get_access_token(client_secret):
    """
    Получение access_token через OAuth
    """
    try:
        rq_uid = str(uuid.uuid4())
        auth_string = base64.b64encode(client_secret.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {auth_string}",
            "RqUID": rq_uid,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "scope": "GIGACHAT_API_PERS"
        }
        
        response = requests.post(
            OAUTH_URL,
            headers=headers,
            data=data,
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            token_data = response.json()
            return {
                "success": True,
                "access_token": token_data.get("access_token"),
                "expires_at": token_data.get("expires_at")
            }
        else:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def test_gigachat_api(access_token, query):
    """
    Тестирование GigaChat API
    """
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
                    "content": query
                }
            ],
            "temperature": 0.7,
            "max_tokens": 512
        }
        
        response = requests.post(
            GIGACHAT_URL,
            headers=headers,
            json=payload,
            verify=False,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                return {
                    "success": True,
                    "answer": result["choices"][0]["message"]["content"],
                    "model": result.get("model"),
                    "usage": result.get("usage")
                }
            else:
                return {
                    "success": False,
                    "error": "Неожиданный формат ответа",
                    "response": result
                }
        else:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def handler(request):
    """
    Основной обработчик запроса
    """
    try:
        # Получаем данные из запроса
        data = request.get_json() if request.is_json else {}
        
        client_secrets = data.get("client_secrets", [
            "b54c49b7-df1c-45ce-a674-c40dac1ce101",
            "0199bd4a-ab72-7e85-b42e-9ba79c6385bf"
        ])
        
        query = data.get("query", "Найди информацию о фильме 'Матрица'")
        
        results = []
        working_secret = None
        
        for secret in client_secrets:
            result = {
                "client_secret": secret,
                "masked_secret": f"{secret[:8]}...{secret[-8:]}"
            }
            
            # Получаем токен
            token_result = get_access_token(secret)
            result["token_result"] = token_result
            
            if token_result["success"]:
                access_token = token_result["access_token"]
                
                # Тестируем API
                api_result = test_gigachat_api(access_token, query)
                result["api_result"] = api_result
                
                if api_result["success"]:
                    working_secret = secret
                    result["status"] = "SUCCESS"
                else:
                    result["status"] = "TOKEN_OK_API_FAIL"
            else:
                result["status"] = "TOKEN_FAIL"
            
            results.append(result)
            
            # Если нашли рабочий секрет, прерываем поиск
            if working_secret:
                break
        
        return jsonify({
            "success": True,
            "working_secret": working_secret,
            "working_secret_masked": f"{working_secret[:8]}...{working_secret[-8:]}" if working_secret else None,
            "results": results,
            "summary": {
                "total_tested": len(results),
                "working": 1 if working_secret else 0,
                "query": query
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
