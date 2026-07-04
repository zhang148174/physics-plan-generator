const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// 代理AI API请求
app.post('/api/chat/completions', async (req, res) => {
    try {
        const { apiUrl, apiKey, model, messages, temperature, max_tokens } = req.body;

        if (!apiUrl || !apiKey || !model || !messages) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        const targetUrl = `${apiUrl}/chat/completions`;
        console.log(`[代理] ${targetUrl}  model=${model}`);

        const upstreamResp = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages, temperature: temperature || 0.7, max_tokens: max_tokens || 8192 }),
            timeout: 120000,
        });

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
        const upstreamResp = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 5 }),
            timeout: 15000,
        });
        const respText = await upstreamResp.text();
        res.status(200).json({ ok: upstreamResp.ok, status: upstreamResp.status, snippet: respText.substring(0, 200) });
    } catch (err) {
        res.status(200).json({ ok: false, error: err.message });
    }
});

app.get('/health', (req, res) => res.json({ ok: true, port: PORT }));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
    console.log(`   在浏览器打开 http://localhost:${PORT} 使用`);
});
