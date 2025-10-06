import json
import os
import psycopg2
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get content list with optional filtering by type and genre
    Args: event - dict with httpMethod, queryStringParameters (type, genre, search)
          context - object with request_id attribute
    Returns: HTTP response with content list
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
    content_type: Optional[str] = params.get('type')
    genre: Optional[str] = params.get('genre')
    search: Optional[str] = params.get('search')
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        query = 'SELECT id, title, description, genre, rating, year, type, image_url, video_url FROM content WHERE 1=1'
        
        if content_type:
            query += f" AND type = '{content_type}'"
        if genre:
            query += f" AND genre = '{genre}'"
        if search:
            query += f" AND (title ILIKE '%{search}%' OR description ILIKE '%{search}%')"
        
        query += ' ORDER BY rating DESC, year DESC'
        
        cur.execute(query)
        rows = cur.fetchall()
        
        content_list = []
        for row in rows:
            content_list.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'genre': row[3],
                'rating': float(row[4]) if row[4] else 0.0,
                'year': row[5],
                'type': row[6],
                'imageUrl': row[7],
                'videoUrl': row[8],
                'isFavorite': False
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'content': content_list})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
