# 我的日常记录网站 - 部署指南

## 项目概述
这是一个基于 Vue.js 的日常记录网站，支持：
- 电脑端和手机端内容实时同步
- 访客可以查看你发布的内容
- 支持日常记录和博客文章

## 部署步骤

### 第一步：部署后端服务到 Render.com

1. **注册 Render 账号**
   - 访问 [https://render.com](https://render.com)
   - 使用 GitHub 账号登录

2. **创建新的 Web Service**
   - 点击 "New +" 按钮
   - 选择 "Web Service"

3. **连接 GitHub 仓库**
   - 选择包含此项目的 GitHub 仓库
   - 确保仓库包含以下文件：
     - `server.js`
     - `package.json`
     - `data/` 目录

4. **配置部署设置**
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node.js
   - **Branch**: main (或你的主分支)

5. **部署并获取URL**
   - 点击 "Create Web Service"
   - 等待部署完成（约2-5分钟）
   - 复制生成的 URL（格式：`https://your-app-name.onrender.com`）

### 第二步：配置前端API地址

1. **编辑 `api-config.js` 文件**
   ```javascript
   const API_CONFIG = {
     // 将下面的 URL 替换为你在 Render 上获得的实际 URL
     backendUrl: 'https://your-app-name.onrender.com'
   };
   ```

2. **提交更改到 GitHub**
   ```bash
   git add .
   git commit -m "配置后端API地址"
   git push origin main
   ```

### 第三步：访问你的网站

- 前端地址：`https://zwq-666.github.io/git-demo/`
- 所有访客现在都可以看到你发布的内容
- 电脑端和手机端会自动同步最新内容

## 本地开发

如果你想在本地测试：

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动服务器**
   ```bash
   node server.js
   ```

3. **访问本地网站**
   - 打开 `http://localhost:8080`
   - 或直接打开 `index.html` 文件

## 故障排除

### 常见问题：

1. **内容无法同步**
   - 检查 `api-config.js` 中的 URL 是否正确
   - 确保 Render 服务正在运行

2. **GitHub Pages 显示空白**
   - 确保所有文件都已推送到 GitHub
   - 检查浏览器控制台是否有错误信息

3. **Render 部署失败**
   - 确保 `package.json` 文件存在
   - 检查 `server.js` 是否能正常运行

## 技术栈

- **前端**: Vue.js 3, HTML5, CSS3
- **后端**: Node.js, Express.js
- **数据存储**: JSON 文件
- **部署**: GitHub Pages (前端), Render.com (后端)

## 注意事项

- Render 免费套餐有休眠限制（15分钟无请求会休眠）
- 数据存储在 Render 的临时文件系统中，重启服务可能会丢失数据
- 如需持久化存储，建议使用数据库服务（如 MongoDB Atlas, Firebase 等）