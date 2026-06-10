// Blog functionality for the Vue application
class BlogManager {
  constructor() {
    this.apiUrl = '/api';
    this.blogPosts = [];
  }

  // 获取所有博客文章
  async getBlogPosts() {
    try {
      const response = await fetch(`${this.apiUrl}/blogs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.blogPosts = await response.json();
      return this.blogPosts;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  // 创建新博客文章
  async createBlogPost(title, content) {
    try {
      const response = await fetch(`${this.apiUrl}/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: content,
          date: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newPost = await response.json();
      this.blogPosts.unshift(newPost);
      return newPost;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  // 删除博客文章
  async deleteBlogPost(id) {
    try {
      const response = await fetch(`${this.apiUrl}/blogs/${id}`, {
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
      const response = await fetch(`${this.apiUrl}/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: content,
          date: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPost = await response.json();
      const index = this.blogPosts.findIndex(post => post.id === id);
      if (index !== -1) {
        this.blogPosts[index] = updatedPost;
      }
      return updatedPost;
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