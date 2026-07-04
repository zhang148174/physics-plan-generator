#!/usr/bin/env python3
"""
物理规划生成器 - 完整服务器
提供HTML页面 + 代理AI API请求，彻底解决CORS问题
部署方式：python server.py 或在CloudStudio中运行
"""
import os
import json
import logging
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import urllib.request
import urllib.error

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 配置日志
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

PORT = int(os.environ.get('PORT', 8080))


@app.route('/')
def index():
    return send_file('index.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)


@app.route('/api/chat/completions', methods=['POST'])
def proxy_chat():
    """代理AI API请求 - 页面和API同源，无CORS问题"""
    try:
        data = request.get_json(force=True)
        api_url = data.get('apiUrl', '').rstrip('/')
        api_key = data.get('apiKey', '')
        model = data.get('model', '')
        messages = data.get('messages', [])
        temperature = data.get('temperature', 0.7)
        max_tokens = data.get('max_tokens', 8192)

        if not api_url or not api_key or not model:
            return jsonify({'error': '缺少 apiUrl / apiKey / model'}), 400

        target_url = f"{api_url}/chat/completions"
        payload = {
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens,
        }

        logger.info(f"代理请求: {target_url}  model={model}")

        req = urllib.request.Request(
            target_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
            },
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                resp_data = resp.read().decode('utf-8')
                return resp_data, resp.status, {'Content-Type': 'application/json'}
        except urllib.error.HTTPError as e:
            resp_data = e.read().decode('utf-8')
            logger.error(f"上游API错误 {e.code}: {resp_data[:200]}")
            return resp_data, e.code, {'Content-Type': 'application/json'}
        except urllib.error.URLError as e:
            logger.error(f"连接上游API失败: {e.reason}")
            return jsonify({'error': f'连接API失败: {e.reason}'}), 502

    except Exception as e:
        logger.error(f"代理错误: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/test', methods=['POST'])
def proxy_test():
    """测试API连接"""
    try:
        data = request.get_json(force=True)
        api_url = data.get('apiUrl', '').rstrip('/')
        api_key = data.get('apiKey', '')
        model = data.get('model', '')

        if not api_url or not api_key:
            return jsonify({'ok': False, 'error': '缺少 apiUrl 或 apiKey'}), 400

        target_url = f"{api_url}/chat/completions"
        payload = {
            'model': model,
            'messages': [{'role': 'user', 'content': 'hi'}],
            'max_tokens': 10,
        }

        req = urllib.request.Request(
            target_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
            },
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return jsonify({'ok': True, 'status': resp.status, 'model': model})
        except urllib.error.HTTPError as e:
            resp_data = e.read().decode('utf-8')
            return jsonify({'ok': False, 'status': e.code, 'error': resp_data[:300]}), 200
        except urllib.error.URLError as e:
            return jsonify({'ok': False, 'error': f'网络连接失败: {e.reason}'}), 200

    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/health')
def health():
    return jsonify({'ok': True, 'port': PORT})


if __name__ == '__main__':
    logger.info(f"启动服务器: http://0.0.0.0:{PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
