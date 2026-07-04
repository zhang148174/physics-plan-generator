/**
 * 物理规划生成器 - API代理Worker
 * 部署到Cloudflare Workers，解决浏览器CORS问题
 * 
 * 部署步骤：
 * 1. 注册 https://dash.cloudflare.com/sign-up/workers-and-pages
 * 2. 进入 Workers & Pages → Create Application → Create Worker
 * 3. 粘贴本文件内容，部署
 * 4. 获得网址：https://physics-plan-api.<你的子域名>.workers.dev
 */

export default {
  async fetch(request, env, ctx) {
    // CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // 处理OPTIONS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, service: 'physics-plan-api-proxy' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 代理AI API请求
    if (url.pathname === '/api/chat/completions' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { apiUrl, apiKey, model, messages, temperature, max_tokens } = body;

        if (!apiUrl || !apiKey || !model || !messages) {
          return new Response(JSON.stringify({ error: '缺少必要参数' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const targetUrl = `${apiUrl}/chat/completions`;
        console.log(`[代理] ${targetUrl}  model=${model}`);

        const upstreamResp = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: temperature || 0.7,
            max_tokens: max_tokens || 8192,
          }),
        });

        const respText = await upstreamResp.text();
        
        return new Response(respText, {
          status: upstreamResp.status,
          headers: {
            ...corsHeaders,
            'Content-Type': upstreamResp.headers.get('Content-Type') || 'application/json',
          },
        });
      } catch (err) {
        console.error('[代理错误]', err.message);
        return new Response(JSON.stringify({ error: '代理转发失败', detail: err.message }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 测试连接
    if (url.pathname === '/api/test' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { apiUrl, apiKey, model } = body;

        if (!apiUrl || !apiKey || !model) {
          return new Response(JSON.stringify({ ok: false, error: '缺少参数' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const targetUrl = `${apiUrl}/chat/completions`;
        const upstreamResp = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: 'hi' }],
            max_tokens: 5,
          }),
        });

        const respText = await upstreamResp.text();
        return new Response(JSON.stringify({
          ok: upstreamResp.ok,
          status: upstreamResp.status,
          snippet: respText.substring(0, 200),
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
