import json
import os
import psycopg2
from typing import Dict, Any
from pydantic import BaseModel, Field, ValidationError

class ContentRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default='')
    genre: str = Field(..., min_length=1, max_length=100)
    rating: float = Field(default=0.0, ge=0.0, le=10.0)
    year: int = Field(..., ge=1900, le=2100)
    type: str = Field(..., pattern='^(movie|series|tv)$')
    image_url: str = Field(default='')
    video_url: str = Field(default='')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Add new content to the database (admin function)
    Args: event - dict with httpMethod, body (JSON with content details)
          context - object with request_id attribute
    Returns: HTTP response with created content ID
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
    
    try:
        content_req = ContentRequest(**body_data)
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Validation error', 'details': e.errors()})
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO content (title, description, genre, rating, year, type, image_url, video_url) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (
                content_req.title,
                content_req.description,
                content_req.genre,
                content_req.rating,
                content_req.year,
                content_req.type,
                content_req.image_url,
                content_req.video_url
            )
        )
        
        content_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'id': content_id, 'message': 'Content added successfully'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
