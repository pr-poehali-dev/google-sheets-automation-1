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
        price_folder_id = body.get('priceFolderId', '').strip()
        opencart_url = body.get('opencartUrl', '').strip()
        opencart_api_key = body.get('opencartApiKey', '').strip()
        admin_email = body.get('adminEmail', '').strip()
        
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
        
        system_prompt = """Создай рабочий Google Apps Script код. Только код, без объяснений.
        
Важно:
- Если нужен доступ к Google Drive папке, используй DriveApp.getFolderById(folderId) или DriveApp.getFileById(fileId)
- Для доступа к папке сгенерируй прямую ссылку: https://drive.google.com/drive/folders/{FOLDER_ID}
- Для файла: https://drive.google.com/file/d/{FILE_ID}/view
- Обязательно проверяй права доступа через folder.getAccess() и делай folder.setSharing() если нужно"""
        
        context_info = f"""Создай Google Apps Script для задачи: {prompt}
        
Доступные параметры из настроек:"""
        
        if price_folder_id:
            context_info += f"\n- ID папки с прайсами Google Drive: {price_folder_id}"
            context_info += f"\n- Прямая ссылка на папку: https://drive.google.com/drive/folders/{price_folder_id}"
        if opencart_url:
            context_info += f"\n- OpenCart API URL: {opencart_url}"
        if opencart_api_key:
            context_info += f"\n- OpenCart API Key доступен через PropertiesService.getScriptProperties().getProperty('OPENCART_API_KEY')"
        if admin_email:
            context_info += f"\n- Email администратора для уведомлений: {admin_email}"
        
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
                    {'role': 'user', 'content': context_info}
                ],
                'temperature': 0.3,
                'max_tokens': 1000,
                'stream': False
            },
            timeout=28
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
        
    except requests.exceptions.Timeout:
        return {
            'statusCode': 504,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'DeepSeek API timeout - запрос занял больше 25 секунд'})
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