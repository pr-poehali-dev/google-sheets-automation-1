import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для генерации Google Apps Script и сохранения в БД (mock-режим без AI)'''
    
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
        
        # Mock-генерация без AI
        generated_code = f"""// Скрипт для задачи: {prompt[:100]}...

function main() {{
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  Logger.log('Обработка данных...');
  
  // TODO: Реализовать логику на основе запроса:
  // {prompt[:200]}
  
  SpreadsheetApp.getUi().alert('Скрипт выполнен!');
}}

function onOpen() {{
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Автоматизация')
    .addItem('Запустить', 'main')
    .addToUi();
}}"""
        
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