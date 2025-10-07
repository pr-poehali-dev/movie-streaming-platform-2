import json
import os
from typing import Dict, Any
import requests
import time
import uuid
import base64
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate movie poster using Kandinsky (GigaChat)
    Args: event - dict with httpMethod, body (JSON with title, description)
          context - object with request_id attribute
    Returns: HTTP response with poster description or placeholder
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
        client_secret = os.environ['GIGACHAT_CLIENT_SECRET']
        
        auth_response = requests.post(
            'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
            headers={'Authorization': f'Basic {client_secret}', 'RqUID': str(uuid.uuid4())},
            data={'scope': 'GIGACHAT_API_PERS'},
            verify=False
        )
        auth_response.raise_for_status()
        access_token = auth_response.json()['access_token']
        
        image_suggestion = body_data.get('image_suggestion', '')
        
        if not image_suggestion:
            prompt_parts = [f"Постер к фильму '{title}'"]
            if description:
                prompt_parts.append(description)
            if genre:
                prompt_parts.append(f"жанр {genre}")
            prompt_text = ", ".join(prompt_parts)
        else:
            prompt_text = image_suggestion
        
        generate_response = requests.post(
            'https://gigachat.devices.sberbank.ru/api/v1/images/generations',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            },
            json={
                'prompt': prompt_text,
                'n': 1,
                'size': '512x768'
            },
            verify=False
        )
        
        generate_response.raise_for_status()
        result = generate_response.json()
        
        if 'data' in result and len(result['data']) > 0:
            image_base64 = result['data'][0]['image']
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
                'body': json.dumps({'error': 'Image generation failed'})
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }