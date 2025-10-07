import json
import os
from typing import Dict, Any
import google.generativeai as genai
import requests
import base64

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate movie poster description using Gemini (image generation requires paid service)
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
        prompt_parts = [f"'{title}'"]
        if description:
            prompt_parts.append(description)
        if genre:
            prompt_parts.append(f"{genre} genre")
        
        prompt_text = ", ".join(prompt_parts)
        
        placeholder_url = f"https://placehold.co/400x600/1a1a1a/white?text={title[:30]}"
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'image_url': placeholder_url,
                'title': title,
                'prompt': f"Movie poster: {prompt_text}",
                'note': 'Using placeholder - Gemini image generation requires Imagen API'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
