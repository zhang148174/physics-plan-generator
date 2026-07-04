const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 静态文件 — 显式指定目录
const staticDir = __dirname;
console.log('[启动] 静态文件目录:', staticDir);
console.log('[启动] index.html 存在:', fs.existsSync(path.join(staticDir, 'index.html')));

app.use(express.static(staticDir, {
    index: 'index.html',
    extensions: ['html']
}));

// 显式根路由
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('index.html not found in ' + __dirname);
    }
});

// 代理AI API请求
app.post('/api/chat/completions', async (req, res) => {
    try {
        const { apiUrl, apiKey, model, messages, temperature, max_tokens } = req.body;

        if (!apiUrl || !apiKey || !model || !messages) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const targetUrl = `${apiUrl}/chat/completions`;
        console.log(`[代理] ${targetUrl}  model=${model}`);

        // 使用 AbortController 实现超时（node-fetch v2 兼容）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const upstreamResp = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages, temperature: temperature || 0.7, max_tokens: max_tokens || 8192 }),
            signal: controller.signal,
        }).catch(e => {
            clearTimeout(timeoutId);
            throw e;
        });
        clearTimeout(timeoutId);

        const respText = await upstreamResp.text();
        res.status(upstreamResp.status);
        try {
            res.json(JSON.parse(respText));
        } catch (e) {
            res.send(respText);
        }
    } catch (err) {
        console.error('[代理错误]', err.message);
        res.status(502).json({ error: '代理转发失败', detail: err.message });
    }
});

// 测试连接
app.post('/api/test', async (req, res) => {
    try {
        const { apiUrl, apiKey, model } = req.body;
        if (!apiUrl || !apiKey || !model) {
            return res.status(400).json({ ok: false, error: '缺少参数' });
        }
        const targetUrl = `${apiUrl}/chat/completions`;
        console.log(`[测试] ${targetUrl}  model=${model}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const upstreamResp = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
            signal: controller.signal,
        }).catch(e => {
            clearTimeout(timeoutId);
            throw e;
        });
        clearTimeout(timeoutId);

        const respText = await upstreamResp.text();
        res.status(200).json({ ok: upstreamResp.ok, status: upstreamResp.status, snippet: respText.substring(0, 200) });
    } catch (err) {
        res.status(200).json({ ok: false, error: err.message });
    }
});

// 健康检查
app.get('/health', (req, res) => res.json({ ok: true, port: PORT, dir: __dirname }));

// 兜底：所有未匹配的非API路由返回index.html
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API not found' });
    }
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Not found: ' + req.path);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 服务器运行在端口 ${PORT}`);
    console.log(`   静态目录: ${__dirname}`);
});
