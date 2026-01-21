const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 数据目录路径
const DATA_DIR = path.join(__dirname, 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 静态文件服务
app.use(express.static(__dirname));

// 保存数据API端点
app.post('/api/save-data', (req, res) => {
    try {
        const { data, type } = req.body;
        
        if (!data || !type) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }
        
        // 数据类型验证
        const validTypes = ['users', 'games', 'products', 'servers', 'all'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: '无效的数据类型' });
        }
        
        let filesToSave = [type];
        if (type === 'all') {
            filesToSave = validTypes.filter(t => t !== 'all');
        }
        
        // 保存数据到文件
        filesToSave.forEach(fileType => {
            const fileName = `${fileType}.json`;
            const filePath = path.join(DATA_DIR, fileName);
            const fileData = type === 'all' ? data[fileType] : data;
            
            fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
            console.log(`数据已保存到 ${filePath}`);
        });
        
        res.json({ success: true, message: '数据保存成功', files: filesToSave });
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ success: false, message: '数据保存失败', error: error.message });
    }
});

// 加载数据API端点
app.get('/api/load-data/:type?', (req, res) => {
    try {
        const type = req.params.type || 'all';
        
        const validTypes = ['users', 'games', 'products', 'servers', 'all'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: '无效的数据类型' });
        }
        
        let result = {};
        
        if (type === 'all') {
            // 加载所有数据
            validTypes.filter(t => t !== 'all').forEach(fileType => {
                const fileName = `${fileType}.json`;
                const filePath = path.join(DATA_DIR, fileName);
                
                if (fs.existsSync(filePath)) {
                    const fileData = fs.readFileSync(filePath, 'utf8');
                    result[fileType] = JSON.parse(fileData);
                }
            });
        } else {
            // 加载指定类型数据
            const fileName = `${type}.json`;
            const filePath = path.join(DATA_DIR, fileName);
            
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath, 'utf8');
                result = JSON.parse(fileData);
            }
        }
        
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('加载数据失败:', error);
        res.status(500).json({ success: false, message: '数据加载失败', error: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`数据目录: ${DATA_DIR}`);
    console.log('API端点:');
    console.log('  POST /api/save-data - 保存数据');
    console.log('  GET /api/load-data/:type? - 加载数据');
});