# 物理规划生成器 - 部署指南

## 本地运行

```bash
# 安装依赖
npm install

# 启动服务器
npm start
# 或
node server.js

# 浏览器打开 http://localhost:3000
```

## 免费云部署（推荐）

### 方案1: Render.com（免费，推荐）
1. 访问 https://render.com 注册（可用 GitHub 登录）
2. 点击 "New +" → "Web Service"
3. 连接你的 GitHub 仓库（需先上传代码到 GitHub）
4. 配置：
   - Build Command: `npm install`
   - Start Command: `npm start`
   - 选择 Free 计划
5. 部署完成后获得 `https://xxx.onrender.com` 永久网址

### 方案2: Railway（有免费额度）
1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 自动检测 Node.js 并部署

### 方案3: Fly.io（免费额度）
1. 安装 flyctl
2. `fly launch` 按提示操作

## 环境变量
- `PORT`: 服务器端口（默认 3000，云平台自动设置）

## 目录结构
```
web_app/
├── server.js       # Node.js 服务器（页面 + API代理）
├── index.html      # 前端页面
├── package.json    # Node.js 依赖
└── outputs/        # 生成的文件输出目录
```
