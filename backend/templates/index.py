import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения шаблонов Google Apps Script из базы данных'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        params = event.get('queryStringParameters') or {}
        category = params.get('category')
        
        db_url = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        if category:
            query = f"""
                SELECT id, title, description, category, code, icon, tags, usage_count
                FROM {schema}.templates
                WHERE category = %s
                ORDER BY usage_count DESC, created_at DESC
            """
            cur.execute(query, (category,))
        else:
            query = f"""
                SELECT id, title, description, category, code, icon, tags, usage_count
                FROM {schema}.templates
                ORDER BY usage_count DESC, created_at DESC
            """
            cur.execute(query)
        
        rows = cur.fetchall()
        
        templates = []
        for row in rows:
            templates.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'category': row[3],
                'code': row[4],
                'icon': row[5],
                'tags': row[6] or [],
                'usage_count': row[7]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'templates': templates})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
