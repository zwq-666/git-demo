// Blog functionality for the Vue application
class BlogManager {
  constructor() {
    this.apiUrl = '/api/blog';
    this.blogPosts = [];
  }

  // 获取所有博客文章
  async getBlogPosts() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.blogPosts = data.posts || [];
      return this.blogPosts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  // 创建新博客文章
  async createBlogPost(title, content) {
    try {
      // 先获取现有博客列表
      const currentPosts = await this.getBlogPosts();
      const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleString('zh-CN')
      };
      currentPosts.unshift(newPost);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts: currentPosts })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.blogPosts = currentPosts;
      return newPost;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  // 删除博客文章
  async deleteBlogPost(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.blogPosts = this.blogPosts.filter(post => post.id !== id);
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  // 更新博客文章
  async updateBlogPost(id, title, content) {
    try {
      // 获取现有博客列表，更新指定文章后整体保存
      const currentPosts = await this.getBlogPosts();
      const index = currentPosts.findIndex(post => post.id === id);
      if (index === -1) {
        throw new Error('博客文章不存在');
      }

      currentPosts[index] = {
        ...currentPosts[index],
        title,
        content,
        date: new Date().toLocaleString('zh-CN')
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts: currentPosts })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.blogPosts = currentPosts;
      return currentPosts[index];
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }
}

// 初始化博客管理器
const blogManager = new BlogManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BlogManager, blogManager };
}