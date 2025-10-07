import json
import os
from typing import Dict, Any
import requests
import time
import base64

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate movie poster using YandexART
    Args: event - dict with httpMethod, body (JSON with title, description)
          context - object with request_id attribute
    Returns: HTTP response with base64 poster image
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    title: str = body_data.get('title', '').strip()
    description: str = body_data.get('description', '').strip()
    genre: str = body_data.get('genre', '').strip()
    
    if not title:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Title is required'})
        }
    
    try:
        api_key = os.environ['YANDEX_API_KEY']
        folder_id = os.environ['YANDEX_FOLDER_ID']
        
        image_suggestion = body_data.get('image_suggestion', '')
        
        if not image_suggestion:
            prompt_parts = [f"Кинопостер к фильму '{title}'"]
            if description:
                prompt_parts.append(description)
            if genre:
                prompt_parts.append(f"жанр {genre}")
            prompt_text = ", ".join(prompt_parts)
        else:
            prompt_text = image_suggestion
        
        generate_response = requests.post(
            'https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync',
            headers={
                'Authorization': f'Api-Key {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'modelUri': f'art://{folder_id}/yandex-art/latest',
                'generationOptions': {
                    'seed': int(time.time()),
                    'aspectRatio': {
                        'widthRatio': 2,
                        'heightRatio': 3
                    }
                },
                'messages': [
                    {
                        'weight': 1,
                        'text': prompt_text
                    }
                ]
            }
        )
        
        generate_response.raise_for_status()
        operation_id = generate_response.json()['id']
        
        max_attempts = 30
        for attempt in range(max_attempts):
            time.sleep(2)
            
            status_response = requests.get(
                f'https://llm.api.cloud.yandex.net:443/operations/{operation_id}',
                headers={'Authorization': f'Api-Key {api_key}'}
            )
            status_response.raise_for_status()
            status_data = status_response.json()
            
            if status_data.get('done'):
                if 'response' in status_data:
                    image_base64 = status_data['response']['image']
                    image_url = f"data:image/jpeg;base64,{image_base64}"
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'image_url': image_url,
                            'title': title,
                            'prompt': prompt_text
                        })
                    }
                else:
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Image generation failed', 'details': status_data})
                    }
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Image generation timeout'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }