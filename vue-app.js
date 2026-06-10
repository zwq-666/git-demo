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

      // 通用数据
      localData: {
        dailyEntries: [],
        blogPosts: []
      }
    };
  },

  created() {
    // 初始化时加载本地存储的数据
    this.loadLocalData();

    // 从服务器获取最新数据
    this.fetchData();

    // 设置定期同步（每5分钟）
    setInterval(() => {
      this.fetchData();
    }, 300000);
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

    // 从服务器获取数据
    async fetchData() {
      try {
        const response = await fetch('http://localhost:3000/api/data');
        const data = await response.json();

        // 更新日常记录
        if (data.dailyEntries && data.dailyEntries.length > this.entries.length) {
          this.entries = data.dailyEntries;
          this.saveLocalData();
        }

        // 更新博客文章
        if (data.blogPosts && data.blogPosts.length > this.blogPosts.length) {
          this.blogPosts = data.blogPosts;
          this.saveLocalData();
        }

        // 更新通用数据
        this.localData = data;
      } catch (error) {
        console.error('获取服务器数据失败:', error);
      }
    },

    // 添加日常记录
    async addEntry() {
      if (!this.newEntry.trim()) return;

      try {
        // 创建新记录
        const entry = {
          id: Date.now(),
          content: this.newEntry,
          date: new Date().toLocaleDateString('zh-CN')
        };

        // 更新本地数据
        this.entries.unshift(entry);
        this.newEntry = '';
        this.saveLocalData();

        // 同步到服务器
        await fetch('http://localhost:3000/api/daily', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ entries: this.entries })
        });
      } catch (error) {
        console.error('添加日常记录失败:', error);
        this.newEntry = '';
      }
    },

    // 添加博客文章
    async addBlogPost() {
      if (!this.newBlog.title.trim() || !this.newBlog.content.trim()) return;

      try {
        // 创建新博客
        const post = {
          id: Date.now(),
          ...this.newBlog,
          date: new Date().toLocaleString('zh-CN')
        };

        // 更新本地数据
        this.blogPosts.unshift(post);
        this.newBlog = {
          title: '',
          content: ''
        };
        this.saveLocalData();

        // 同步到服务器
        await fetch('http://localhost:3000/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ posts: this.blogPosts })
        });
      } catch (error) {
        console.error('添加博客文章失败:', error);
        this.newBlog = {
          title: '',
          content: ''
        };
      }
    }
  }
}).mount('#app');