# 云端部署指南 - 获得永久网址

## 方案一：Render.com（推荐，免费）

### 步骤1：上传代码到 GitHub
1. 访问 [github.com](https://github.com) 登录你的账号
2. 点击右上角 `+` → `New repository`
3. 仓库名填：`physics-plan-generator`
4. 选择 `Public`
5. 点击 `Create repository`
6. 按照页面提示，把 `web_app/` 文件夹里的所有文件推送到这个仓库

### 步骤2：部署到 Render.com
1. 访问 [render.com](https://render.com) 注册（可以用 GitHub 账号登录）
2. 登录后点击 `New +` → `Web Service`
3. 连接你的 GitHub 账号，选择 `physics-plan-generator` 仓库
4. 配置：
   - Name: `physics-plan-generator`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. 点击 `Create Web Service`
6. 等待部署完成（约3-5分钟）
7. 获得永久网址：`https://physics-plan-generator.onrender.com`

---

## 方案二：Cloudflare Workers（免费，无信用卡 required）

### 步骤1：注册 Cloudflare Workers
1. 访问 [dash.cloudflare.com/sign-up/workers-and-pages](https://dash.cloudflare.com/sign-up/workers-and-pages)
2. 注册账号（免费，不需要信用卡）
3. 创建一个 `Workers` 子域名（例如：`your-name`)

### 步骤2：部署 Worker
1. 进入 `Workers & Pages` → `Create Application` → `Create Worker`
2. Worker 名称填：`physics-plan-api`
3. 点击 `Deploy`
4. 部署成功后，点击 `Edit Code`
5. 删除编辑器里的所有代码
6. 复制 `cloudflare-worker.js` 里的代码，粘贴进去
7. 点击 `Save and Deploy`
8. 获得永久网址：`https://physics-plan-api.your-name.workers.dev`

### 步骤3：更新 HTML 里的代理网址
1. 打开 `index.html`
2. 把 API URL 改成你的 Worker 网址
3. 重新部署 HTML 到 CloudStudio

---

## 方案三：直接用我部署好的公共实例（临时方案）

如果你想要立刻就能用的网址，我可以帮你部署到我的测试服务器。

请联系我提供：
- 你的 GitHub 仓库地址（如果用方案一中）
- 或者告诉我你更喜欢哪个方案
