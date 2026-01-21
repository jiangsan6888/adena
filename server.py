from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import time

# 数据目录
DATA_DIR = 'data'

# 确保数据目录存在
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

class DataHandler(SimpleHTTPRequestHandler):
    # 允许CORS
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    # 处理OPTIONS请求
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    # 处理POST请求 - 保存数据
    def do_POST(self):
        if self.path == '/api/save-data':
            # 读取请求体
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # 解析JSON数据
                data = json.loads(post_data)
                
                # 验证必要参数
                if 'data' not in data or 'type' not in data:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': False, 'message': '缺少必要参数'}).encode())
                    return
                
                valid_types = ['users', 'games', 'products', 'servers', 'all']
                if data['type'] not in valid_types:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': False, 'message': '无效的数据类型'}).encode())
                    return
                
                files_to_save = [data['type']]
                if data['type'] == 'all':
                    files_to_save = valid_types[:-1]  # 排除'all'
                
                saved_files = []
                for file_type in files_to_save:
                    # 确定要保存的数据
                    if data['type'] == 'all':
                        file_data = data['data'][file_type] if file_type in data['data'] else []
                    else:
                        file_data = data['data']
                    
                    # 保存到文件
                    file_path = os.path.join(DATA_DIR, f'{file_type}.json')
                    with open(file_path, 'w', encoding='utf-8') as f:
                        json.dump(file_data, f, indent=2, ensure_ascii=False)
                    saved_files.append(file_type)
                
                # 返回成功响应
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'success': True,
                    'message': '数据保存成功',
                    'files': saved_files,
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                }
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'message': '无效的JSON格式'}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'success': False,
                    'message': f'保存数据失败: {str(e)}',
                    'error': str(e)
                }
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
        else:
            # 其他POST请求交给父类处理
            super().do_POST()
    
    # 处理GET请求 - 加载数据
    def do_GET(self):
        if self.path.startswith('/api/load-data'):
            try:
                # 解析路径获取数据类型
                path_parts = self.path.split('/')
                data_type = 'all' if len(path_parts) < 5 or path_parts[4] == '' else path_parts[4]
                
                valid_types = ['users', 'games', 'products', 'servers', 'all']
                if data_type not in valid_types:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': False, 'message': '无效的数据类型'}).encode())
                    return
                
                result = {}
                
                if data_type == 'all':
                    # 加载所有数据
                    for file_type in valid_types[:-1]:  # 排除'all'
                        file_path = os.path.join(DATA_DIR, f'{file_type}.json')
                        if os.path.exists(file_path):
                            with open(file_path, 'r', encoding='utf-8') as f:
                                result[file_type] = json.load(f)
                        else:
                            result[file_type] = []
                else:
                    # 加载指定类型数据
                    file_path = os.path.join(DATA_DIR, f'{data_type}.json')
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            result = json.load(f)
                    else:
                        result = []
                
                # 返回成功响应
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'success': True,
                    'data': result,
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                }
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {
                    'success': False,
                    'message': f'加载数据失败: {str(e)}',
                    'error': str(e)
                }
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
        else:
            # 其他GET请求交给父类处理静态文件
            super().do_GET()

if __name__ == '__main__':
    PORT = 3000
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, DataHandler)
    
    print(f"服务器运行在 http://localhost:{PORT}")
    print(f"数据目录: {os.path.abspath(DATA_DIR)}")
    print("API端点:")
    print("  POST /api/save-data - 保存数据")
    print("  GET /api/load-data/:type? - 加载数据")
    print("按 Ctrl+C 停止服务器")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        httpd.server_close()