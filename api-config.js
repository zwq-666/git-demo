// API 配置 - 用于 GitHub Pages 部署
const API_CONFIG = {
  // === 重要：请在这里填写你的后端服务URL ===
  // 将下面这行替换为你的实际 Render URL
  backendUrl: 'https://your-actual-render-url.onrender.com'
};

// 自动获取API基础URL
function getApiBaseUrl() {
  // 如果配置了后端URL，直接使用
  if (API_CONFIG.backendUrl) {
    return API_CONFIG.backendUrl;
  }

  // 在GitHub Pages上运行但没有配置后端URL
  if (window.location.hostname.includes('github.io')) {
    console.warn('请在 api-config.js 中配置你的后端服务URL');
    // 返回一个无效地址，避免错误请求到localhost
    return 'https://api-placeholder.github.io';
  }

  // 本地开发环境
  return 'http://localhost:8080';
}

// 获取WebSocket连接URL
function getWebSocketUrl() {
  // 如果配置了后端URL，使用WebSocket连接
  if (API_CONFIG.backendUrl) {
    // 将 http:// 替换为 ws://，https:// 替换为 wss://
    return API_CONFIG.backendUrl.replace(/^http/, 'ws');
  }

  // 本地开发环境
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8080`;
}

// 获取日常记录API URL
function getDailyApiUrl() {
  return getApiBaseUrl() + '/api/daily';
}

// 获取博客API URL  
function getBlogApiUrl() {
  return getApiBaseUrl() + '/api/blog';
}