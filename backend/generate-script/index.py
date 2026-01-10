import json
import os
import psycopg2
import requests

def handler(event: dict, context) -> dict:
    '''API для генерации Google Apps Script с использованием Polza.ai ChatGPT и сохранением в БД'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        prompt = body.get('prompt', '').strip()
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Prompt is required'})
            }
        
        polza_key = os.environ.get('POLZA_AI_API_KEY')
        if not polza_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Polza.ai API key not configured'})
            }
        
        system_prompt = """Ты эксперт по Google Apps Script. Твоя задача — генерировать чистый, работающий код для автоматизации работы с Google Sheets и Drive.

Требования:
- Генерируй только код функций, без объяснений и без маркдауна
- Используй современный JavaScript синтаксис
- Добавляй комментарии на русском языке
- Включай обработку ошибок где необходимо
- Используй Logger.log для отладки
- Создавай функцию onOpen() для меню если требуется автоматизация
- Учитывай что пользователь работает с прайс-листами (артикулы, цены, остатки)
"""
        
        response = requests.post(
            'https://api.polza.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {polza_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'openai/gpt-4o',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f'Создай Google Apps Script для следующей задачи:\n\n{prompt}'}
                ],
                'temperature': 0.7,
                'max_tokens': 2000
            },
            timeout=60
        )
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Polza.ai API error: {response.text}'})
            }
        
        data = response.json()
        generated_code = data['choices'][0]['message']['content'].strip()
        
        if generated_code.startswith('```'):
            lines = generated_code.split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines and lines[-1].startswith('```'):
                lines = lines[:-1]
            generated_code = '\n'.join(lines)
        
        db_url = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        insert_query = f"""
            INSERT INTO {schema}.generated_scripts (prompt, generated_code)
            VALUES (%s, %s)
            RETURNING id, created_at
        """
        cur.execute(insert_query, (prompt, generated_code))
        result = cur.fetchone()
        script_id = result[0]
        created_at = result[1].isoformat()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'code': generated_code,
                'script_id': script_id,
                'created_at': created_at
            })
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
