# 物理规划生成器 - 完整使用指南

## 问题说明
NVIDIA API（`integrate.api.nvidia.com`）不支持浏览器跨域请求（CORS），所以页面必须通过**代理服务器**来调用API。

## 方案A：本地运行（推荐，最简单）

### 步骤
1. 确保已安装 [Node.js](https://nodejs.org/)（版本 18+）
2. 双击运行 `start.bat`（Windows）或 `start.sh`（Mac/Linux）
3. 浏览器自动打开 `http://localhost:3000`
4. 填写 API Key，点"生成"即可

### 原理
本地服务器（`server.js`）同时提供页面和代理API，页面和API同源，浏览器不报CORS错误。

---

## 方案B：免费云端部署（获得永久网址）

### 选项1：Render.com（推荐）
1. 访问 https://render.com 注册（可用GitHub登录）
2. 点击 "New +" → "Web Service"
3. 连接GitHub仓库（需先上传代码到GitHub）
4. 配置：
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - 选择 Free 计划
5. 部署完成后获得 `https://xxx.onrender.com` 永久网址

### 选项2：Cloudflare Workers（免费）
1. 访问 https://dash.cloudflare.com 注册（免费）
2. "Workers & Pages" → "Create Application" → "Create Worker"
3. 将 `cloudflare-worker.js` 的代码粘贴到编辑器
4. 保存并部署，获得 `*.workers.dev` 网址
5. 在页面API URL处填写该Worker网址（`https://your-worker.workers.dev`）

---

## 文件说明
| 文件 | 说明 |
|------|------|
| `server.js` | Node.js服务器（页面 + API代理） |
| `index.html` | 前端页面 |
| `package.json` | Node.js依赖配置 |
| `start.bat` | Windows一键启动脚本 |
| `start.sh` | Mac/Linux一键启动脚本 |
| `cloudflare-worker.js` | Cloudflare Worker代理脚本（云端部署用） |
| `server.py` | Python版本服务器（备用） |
| `DEPLOY.md` | 详细部署文档 |
