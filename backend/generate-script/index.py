import json
import os
import psycopg2
import requests

def handler(event: dict, context) -> dict:
    '''API для генерации Google Apps Script через DeepSeek AI и сохранения в БД'''
    
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
        body_str = event.get('body', '{}')
        if not body_str:
            body_str = '{}'
        body = json.loads(body_str)
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
        
        api_key = os.environ.get('DEEPSEEK_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'DEEPSEEK_API_KEY not configured'})
            }
        
        system_prompt = """Ты эксперт по Google Apps Script. Генерируй ТОЛЬКО код без объяснений.
Требования:
- Код должен быть готов к использованию
- Комментарии на русском языке
- Обрабатывай ошибки
- Используй современный синтаксис JavaScript
- Добавь функцию onOpen() с меню"""
        
        response = requests.post(
            'https://api.deepseek.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f'Создай Google Apps Script для задачи: {prompt}'}
                ],
                'temperature': 0.3,
                'max_tokens': 2000
            },
            timeout=30
        )
        
        if response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'DeepSeek API error: {response.status_code}'})
            }
        
        result = response.json()
        generated_code = result['choices'][0]['message']['content'].strip()
        
        if generated_code.startswith('```'):
            lines = generated_code.split('\n')
            generated_code = '\n'.join(lines[1:-1]) if len(lines) > 2 else generated_code
        
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