import json
import os
from typing import Dict, Any
import requests
import uuid
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Search movie/series info using GigaChat by title
    Args: event - dict with httpMethod, queryStringParameters (query)
          context - object with request_id attribute
    Returns: HTTP response with found content details
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    query: str = params.get('query', '').strip()
    
    if not query:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Query parameter is required'})
        }
    
    try:
        client_secret = os.environ['GIGACHAT_CLIENT_SECRET']
        
        auth_response = requests.post(
            'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
            headers={'Authorization': f'Basic {client_secret}', 'RqUID': str(uuid.uuid4())},
            data={'scope': 'GIGACHAT_API_PERS'},
            verify=False
        )
        auth_response.raise_for_status()
        access_token = auth_response.json()['access_token']
        
        prompt = f"""Найди информацию о фильме, сериале или ТВ-программе: "{query}"

Верни JSON со следующими полями:
- title: название на русском
- description: краткое описание (2-3 предложения)
- genre: жанр на русском (один, основной)
- rating: рейтинг от 0 до 10 (число)
- year: год выхода (число)
- type: тип контента - "movie" для фильмов, "series" для сериалов, "tv" для ТВ-каналов
- image_suggestion: описание постера для генерации (на русском, детальное)

Если не можешь найти информацию, верни пустой объект {{}}.
Отвечай ТОЛЬКО валидным JSON, без дополнительного текста."""

        response = requests.post(
            'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'GigaChat',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'Ты помощник для поиска информации о фильмах, сериалах и ТВ-программах. Отвечаешь только JSON.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.3,
                'max_tokens': 1000
            },
            verify=False
        )
        
        response.raise_for_status()
        result = response.json()
        
        result_text = result['choices'][0]['message']['content'].strip()
        
        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.startswith('```'):
            result_text = result_text[3:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        result_data = json.loads(result_text)
        
        if not result_data:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Content not found', 'query': query})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps(result_data)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }