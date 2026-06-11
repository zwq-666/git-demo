// 简单的Node.js服务器，用于支持移动端访问和实时更新
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();
const port = 8080;

// 启用CORS
app.use(cors());

// 静态文件服务
app.use(express.static(path.join(__dirname, '.')));

// JSON解析中间件
app.use(express.json());

// 确保数据目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// WebSocket服务器
const wss = new WebSocketServer({ noServer: true });
const clients = new Set();

// 广播消息给所有连接的客户端
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  });
}

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('新的WebSocket客户端连接');
  clients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket客户端断开连接');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
    clients.delete(ws);
  });
});

// 获取日常记录数据
app.get('/api/daily', (req, res) => {
  try {
    const dataPath = path.join(dataDir, 'daily.json');
    let entries = [];

    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      entries = JSON.parse(data);
    }

    res.json({ dailyEntries: entries });
  } catch (error) {
    console.error('获取日常记录时出错:', error);
    res.status(500).json({ error: '无法获取日常记录' });
  }
});

// 保存日常记录数据
app.post('/api/daily', (req, res) => {
  try {
    const dataPath = path.join(dataDir, 'daily.json');
    const entries = req.body.entries || [];

    fs.writeFileSync(dataPath, JSON.stringify(entries, null, 2));

    // 广播更新给所有客户端
    broadcast({ type: 'daily', data: entries });

    res.json({ success: true, message: '日常记录已保存' });
  } catch (error) {
    console.error('保存日常记录时出错:', error);
    res.status(500).json({ error: '无法保存日常记录' });
  }
});

// 获取博客数据
app.get('/api/blog', (req, res) => {
  try {
    const dataPath = path.join(dataDir, 'blog.json');
    let posts = [];

    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      posts = JSON.parse(data);
    }

    res.json({ posts: posts });
  } catch (error) {
    console.error('获取博客数据时出错:', error);
    res.status(500).json({ error: '无法获取博客数据' });
  }
});

// 保存博客数据
app.post('/api/blog', (req, res) => {
  try {
    const dataPath = path.join(dataDir, 'blog.json');
    const posts = req.body.posts || [];

    fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2));

    // 广播更新给所有客户端
    broadcast({ type: 'blog', data: posts });

    res.json({ success: true, message: '博客数据已保存' });
  } catch (error) {
    console.error('保存博客数据时出错:', error);
    res.status(500).json({ error: '无法保存博客数据' });
  }
});

// 升级HTTP连接为WebSocket
app.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// 启动服务器
const localIp = getLocalIp();
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
  if (localIp) {
    console.log(`可以通过移动设备访问 http://${localIp}:${port} 来使用应用`);
  } else {
    console.log('无法获取局域网IP地址，请手动查看网络设置');
  }
});

// 提供帮助信息的路由
app.get('/', (req, res) => {
  const ip = localIp || '你的局域网IP';
  res.send(`
        <h1>日常记录服务器</h1>
        <p>服务器已成功启动！</p>
        <p>你可以通过以下方式访问应用：</p>
        <ul>
            <li>桌面访问: <a href="http://localhost:${port}/index.html">http://localhost:${port}/index.html</a></li>
            <li>移动设备访问: <a href="http://${ip}:${port}/index.html">http://${ip}:${port}/index.html</a></li>
        </ul>
        <p>请确保你的移动设备和本机在同一个Wi-Fi网络下。</p>
        ${!localIp ? '<p style="color: red;">注意：未检测到局域网IP，请手动确认你的IP地址</p>' : ''}
    `);
});

// 获取本机局域网IP地址
function getLocalIp() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    for (const iface of interfaces[devName]) {
      // 只获取真实的无线网络适配器IP，排除VMware等虚拟网卡
      if (iface.family === 'IPv4' && !iface.internal &&
        (devName.toLowerCase().includes('wlan') || devName.toLowerCase().includes('wi-fi') ||
          devName.toLowerCase().includes('wireless'))) {
        return iface.address;
      }
    }
  }
  // 如果没有找到无线网卡，返回第一个非内部IPv4地址
  for (const devName in interfaces) {
    for (const iface of interfaces[devName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}