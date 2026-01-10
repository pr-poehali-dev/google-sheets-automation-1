import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения истории сгенерированных скриптов'''
    
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
        limit = int(params.get('limit', 20))
        
        db_url = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        query = f"""
            SELECT id, prompt, generated_code, created_at
            FROM {schema}.generated_scripts
            ORDER BY created_at DESC
            LIMIT %s
        """
        cur.execute(query, (limit,))
        
        rows = cur.fetchall()
        
        history = []
        for row in rows:
            history.append({
                'id': row[0],
                'prompt': row[1],
                'code': row[2],
                'created_at': row[3].isoformat()
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'history': history})
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
