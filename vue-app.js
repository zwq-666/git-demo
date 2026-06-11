// Vue应用逻辑
const { createApp } = Vue;

createApp({
  data() {
    return {
      // 日常记录相关数据
      entries: [],
      newEntry: '',

      // 博客相关数据
      blogPosts: [],
      newBlog: {
        title: '',
        content: ''
      },

      // WebSocket相关
      ws: null,
      wsConnected: false,
      wsReconnectAttempts: 0,
      maxReconnectAttempts: 10,
      wsReconnectDelay: 2000
    };
  },

  created() {
    // 初始化时加载本地存储的数据
    this.loadLocalData();

    // 从服务器获取最新数据
    this.fetchDailyData();
    this.fetchBlogData();

    // 建立WebSocket连接
    this.connectWebSocket();
  },

  beforeUnmount() {
    // 组件卸载时关闭WebSocket
    if (this.ws) {
      this.ws.close();
    }
  },

  methods: {
    // 加载本地存储的数据
    loadLocalData() {
      const dailyEntries = localStorage.getItem('dailyEntries');
      if (dailyEntries) {
        this.entries = JSON.parse(dailyEntries);
      }

      const blogPosts = localStorage.getItem('blogPosts');
      if (blogPosts) {
        this.blogPosts = JSON.parse(blogPosts);
      }
    },

    // 保存数据到本地存储
    saveLocalData() {
      localStorage.setItem('dailyEntries', JSON.stringify(this.entries));
      localStorage.setItem('blogPosts', JSON.stringify(this.blogPosts));
    },

    // 建立WebSocket连接
    connectWebSocket() {
      try {
        const wsUrl = getWebSocketUrl();
        console.log('正在连接WebSocket:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket连接已建立');
          this.wsConnected = true;
          this.wsReconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket连接已关闭');
          this.wsConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error);
          this.wsConnected = false;
        };
      } catch (error) {
        console.error('建立WebSocket连接失败:', error);
        this.attemptReconnect();
      }
    },

    // 处理WebSocket消息
    handleWebSocketMessage(message) {
      if (message.type === 'daily' && message.data) {
        this.entries = message.data;
        this.saveLocalData();
      } else if (message.type === 'blog' && message.data) {
        this.blogPosts = message.data;
        this.saveLocalData();
      }
    },

    // 尝试重连
    attemptReconnect() {
      if (this.wsReconnectAttempts < this.maxReconnectAttempts) {
        this.wsReconnectAttempts++;
        console.log(`尝试重新连接 WebSocket (${this.wsReconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
          this.connectWebSocket();
        }, this.wsReconnectDelay);
      } else {
        console.error('WebSocket重连次数已达上限，切换到轮询模式');
        // 回退到轮询模式
        this.startPollingFallback();
      }
    },

    // 备用轮询模式（WebSocket失败时使用）
    startPollingFallback() {
      setInterval(() => {
        this.fetchDailyData();
        this.fetchBlogData();
      }, 30000);
    },

    // 从服务器获取日常记录数据
    async fetchDailyData() {
      try {
        const apiUrl = getDailyApiUrl();
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.dailyEntries && Array.isArray(data.dailyEntries)) {
          this.entries = data.dailyEntries;
          this.saveLocalData();
        }
      } catch (error) {
        console.error('获取日常记录数据失败:', error);
      }
    },

    // 从服务器获取博客数据
    async fetchBlogData() {
      try {
        const apiUrl = getBlogApiUrl();
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.posts && Array.isArray(data.posts)) {
          this.blogPosts = data.posts;
          this.saveLocalData();
        }
      } catch (error) {
        console.error('获取博客数据失败:', error);
      }
    },

    // 添加日常记录
    async addEntry() {
      if (!this.newEntry.trim()) return;

      try {
        const apiUrl = getDailyApiUrl();
        // 创建新记录
        const entry = {
          id: Date.now(),
          content: this.newEntry,
          date: new Date().toLocaleDateString('zh-CN')
        };

        // 先更新本地数据（乐观更新）
        this.entries.unshift(entry);
        this.newEntry = '';
        this.saveLocalData();

        // 同步到服务器
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ entries: this.entries })
        });

        if (response.ok) {
          // 添加成功后重新从服务器获取最新数据，确保一致性
          await this.fetchDailyData();
        }
      } catch (error) {
        console.error('添加日常记录失败:', error);
        this.newEntry = '';
      }
    },

    // 添加博客文章
    async addBlogPost() {
      if (!this.newBlog.title.trim() || !this.newBlog.content.trim()) return;

      try {
        const apiUrl = getBlogApiUrl();
        // 创建新博客
        const post = {
          id: Date.now(),
          ...this.newBlog,
          date: new Date().toLocaleString('zh-CN')
        };

        // 先更新本地数据（乐观更新）
        this.blogPosts.unshift(post);
        this.newBlog = {
          title: '',
          content: ''
        };
        this.saveLocalData();

        // 同步到服务器
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ posts: this.blogPosts })
        });

        if (response.ok) {
          // 添加成功后重新从服务器获取最新数据，确保一致性
          await this.fetchBlogData();
        }
      } catch (error) {
        console.error('添加博客文章失败:', error);
        this.newBlog = {
          title: '',
          content: ''
        };
      }
    },

    // 删除日常记录
    async deleteEntry(id) {
      if (!confirm('确定要删除这条记录吗？')) return;

      try {
        const apiUrl = getDailyApiUrl();
        // 先从本地移除（乐观更新）
        this.entries = this.entries.filter(e => e.id !== id);
        this.saveLocalData();

        // 同步到服务器
        const response = await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // 删除成功后重新从服务器获取最新数据
          await this.fetchDailyData();
        }
      } catch (error) {
        console.error('删除日常记录失败:', error);
      }
    },

    // 删除博客文章
    async deleteBlogPost(id) {
      if (!confirm('确定要删除这篇博客吗？')) return;

      try {
        const apiUrl = getBlogApiUrl();
        // 先从本地移除（乐观更新）
        this.blogPosts = this.blogPosts.filter(p => p.id !== id);
        this.saveLocalData();

        // 同步到服务器
        const response = await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // 删除成功后重新从服务器获取最新数据
          await this.fetchBlogData();
        }
      } catch (error) {
        console.error('删除博客文章失败:', error);
      }
    }
  }
}).mount('#app');