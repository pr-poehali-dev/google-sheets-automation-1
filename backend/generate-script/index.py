import json
import os
import psycopg2
from openai import OpenAI

def handler(event: dict, context) -> dict:
    '''API для генерации Google Apps Script с использованием OpenAI GPT-4'''
    
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
        
        openai_key = os.environ.get('OPENAI_API_KEY')
        if not openai_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'OpenAI API key not configured'})
            }
        
        client = OpenAI(api_key=openai_key)
        
        system_prompt = """Ты эксперт по Google Apps Script. Твоя задача — генерировать чистый, работающий код для автоматизации работы с Google Sheets и Drive.

Требования:
- Генерируй только код функций, без объяснений
- Используй современный JavaScript синтаксис
- Добавляй комментарии на русском языке
- Включай обработку ошибок где необходимо
- Используй Logger.log для отладки
- Создавай функцию onOpen() для меню если требуется автоматизация
- Учитывай что пользователь работает с прайс-листами (артикулы, цены, остатки)
"""
        
        response = client.chat.completions.create(
            model='gpt-4',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f'Создай Google Apps Script для следующей задачи:\n\n{prompt}'}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        generated_code = response.choices[0].message.content.strip()
        
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
