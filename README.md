# 📝 万能墙

一个基于 Cloudflare Workers + D1 的匿名留言墙应用，支持图片上传、评论、管理员后台、筛选搜索等功能。

## ✨ 功能特点

- 📝 **匿名发布** - 支持文字+图片发布，可选择匿名
- 💬 **评论系统** - 用户可在帖子下评论互动
- 🔐 **管理员后台** - 密码登录后可管理所有内容
- 📌 **置顶功能** - 管理员可置顶重要帖子
- ✅ **站长支持** - 管理员可标记支持的帖子
- ❤️ **站长赞过** - 管理员可点赞帖子
- ⭐ **精选评论** - 管理员可将评论设为精选
- 🔍 **搜索筛选** - 支持关键词搜索和分类筛选
- 📢 **公告系统** - 管理员可发布和编辑公告
- 📖 **使用说明** - 可自定义的使用说明和更新内容
- 🖼️ **图片压缩** - 自动压缩上传的图片
- 🎨 **响应式设计** - 适配手机和电脑

## 🚀 部署教程

### 1. 准备工作

- [Cloudflare](https://cloudflare.com) 账号
- 一个域名（可选，Worker 自带免费域名）

### 2. 创建 D1 数据库

进入 Cloudflare Dashboard → **Workers & Pages** → **D1** → **创建数据库**

名称填写：`message-wall-db`

### 3. 初始化数据库表

在 D1 控制台中**逐条**执行以下 SQL：

```sql
-- 帖子表
CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, nickname TEXT NOT NULL DEFAULT '匿名', content TEXT, images TEXT DEFAULT '[]', created_at INTEGER NOT NULL, is_pinned INTEGER DEFAULT 0, admin_liked INTEGER DEFAULT 0, admin_support INTEGER DEFAULT 0, is_admin INTEGER DEFAULT 0);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, post_id TEXT NOT NULL, nickname TEXT NOT NULL DEFAULT '匿名', content TEXT NOT NULL, is_admin INTEGER DEFAULT 0, created_at INTEGER NOT NULL);

-- 精选评论表
CREATE TABLE IF NOT EXISTS featured_comments (id TEXT PRIMARY KEY, post_id TEXT NOT NULL, comment_id TEXT NOT NULL, created_at INTEGER NOT NULL);

-- 公告表
CREATE TABLE IF NOT EXISTS announcements (id TEXT PRIMARY KEY, content TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);

-- 使用说明表
CREATE TABLE IF NOT EXISTS help_text (id TEXT PRIMARY KEY, content TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);

-- 更新内容表
CREATE TABLE IF NOT EXISTS changelog (id TEXT PRIMARY KEY, content TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);

-- 索引
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

### 4. 创建 Worker
1.进入 Workers & Pages → 创建应用程序 → 创建 Worker
2.名称填写：message-wall
3.点击 部署（先随便部署）
4.进入 Worker 设置 → 变量 → 添加环境变量：
变量名：ADMIN_PASSWORD
值：你的管理员密码
类型：密钥
变量名：ADMIN_NICKNAME
值：你的管理员名称
类型：纯文本
5.进入 Worker 设置 → 绑定 → 添加 D1 数据库绑定：
变量名称：DB
D1 数据库：选择 message-wall-db

### 5.点击 快速编辑，将 worker.js 中的全部代码粘贴进去
点击 保存并部署

🎮 使用方法
####普通用户
在输入框输入内容，可选择性上传图片，输入昵称（可选，默认为"匿名"），点击发布
点击帖子的 💬 按钮查看和发表评论

####管理员
点击顶部 🔐 管理员登录 按钮，输入管理员密码登录
登录后可进行以下操作：
📌 置顶/取消置顶帖子
✅ 标记/取消站长支持
❤️ 标记/取消站长赞过
✏️ 编辑帖子内容
🗑️ 删除帖子
⭐ 设置精选评论
📢 编辑公告
📖 编辑使用说明
🔄 编辑更新内容
🚪 退出登录

###筛选功能
全部 - 显示所有帖子
管理员 - 只显示管理员发布的帖子
站长赞过 - 显示被赞过的帖子
站长支持 - 显示被支持的帖子
已回复 - 显示有管理员回复的帖子
未回复 - 显示暂无管理员回复的帖子

###搜索功能
输入关键词可搜索帖子和评论内容

支持与筛选功能组合使用

##🛠️ 技术栈
前端: HTML + CSS + JavaScript（原生）
后端: Cloudflare Workers
数据库: Cloudflare D1 (SQLite)
存储: Base64 图片存储
部署: Cloudflare 一键部署

##📁 项目结构
text
message-wall/
├── worker.js          # 主程序文件（Workers + HTML）
└── README.md          # 项目说明

##🔧 自定义配置
在 Cloudflare Worker 环境变量中修改：
ADMIN_PASSWORD - 管理员登录密码
ADMIN_NICKNAME - 管理员显示的昵称

##📝 更新日志
###v2.0
添加筛选功能、添加搜索功能、添加站长支持/赞过功能、添加精选评论功能、添加公告/使用说明/更新内容系统、优化管理员UI

###v1.0
基础发帖功能、图片上传、评论系统、管理员后台

##📄 许可证
MIT License

##👤 作者
by 海与迟落 & DeepSeek
