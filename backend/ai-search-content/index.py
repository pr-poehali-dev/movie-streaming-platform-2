import json
import os
from typing import Dict, Any
import google.generativeai as genai

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Search movie/series info using Google Gemini AI by title
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
        genai.configure(api_key=os.environ['GEMINI_API_KEY'])
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""Найди информацию о фильме, сериале или ТВ-программе: "{query}"

Верни JSON со следующими полями:
- title: название на русском
- description: краткое описание (2-3 предложения)
- genre: жанр на русском (один, основной)
- rating: рейтинг от 0 до 10 (число)
- year: год выхода (число)
- type: тип контента - "movie" для фильмов, "series" для сериалов, "tv" для ТВ-каналов
- image_suggestion: описание постера для генерации (на английском, детальное)

Если не можешь найти информацию, верни пустой объект {{}}.
Отвечай ТОЛЬКО валидным JSON, без дополнительного текста."""

        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
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
