export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 微信验证
    if (path === '/74cf5d7bdf837bc5265408f73dc37c64.txt') {
      return new Response('c2709fda62cf267017bab0c9b98b9327da2055bb', {
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
      });
    }
    
    const authCheck = (request, env) => {
      const auth = request.headers.get('Authorization') || '';
      const pwd = env.ADMIN_PASSWORD || 'admin123';
      return auth === 'Bearer ' + pwd;
    };
    
    // 获取公告
    if (path === '/api/announcement' && request.method === 'GET') {
      try {
        const result = await env.DB.prepare('SELECT * FROM announcements ORDER BY updated_at DESC LIMIT 1').first();
        return new Response(JSON.stringify(result || { content: '暂无公告' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 更新公告
    if (path === '/api/announcement' && request.method === 'PUT') {
      try {
        if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const body = await request.json();
        const content = String(body.content || '').substring(0, 500);
        const now = Date.now();
        const existing = await env.DB.prepare('SELECT * FROM announcements LIMIT 1').first();
        if (existing) {
          await env.DB.prepare('UPDATE announcements SET content = ?, updated_at = ? WHERE id = ?').bind(content, now, existing.id).run();
        } else {
          await env.DB.prepare('INSERT INTO announcements (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), content, now, now).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 获取使用说明
    if (path === '/api/help' && request.method === 'GET') {
      try {
        const result = await env.DB.prepare('SELECT * FROM help_text ORDER BY updated_at DESC LIMIT 1').first();
        return new Response(JSON.stringify(result || { content: '使用说明内容' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 更新使用说明
    if (path === '/api/help' && request.method === 'PUT') {
      try {
        if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const body = await request.json();
        const content = String(body.content || '').substring(0, 1000);
        const now = Date.now();
        const existing = await env.DB.prepare('SELECT * FROM help_text LIMIT 1').first();
        if (existing) {
          await env.DB.prepare('UPDATE help_text SET content = ?, updated_at = ? WHERE id = ?').bind(content, now, existing.id).run();
        } else {
          await env.DB.prepare('INSERT INTO help_text (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), content, now, now).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 获取更新内容
    if (path === '/api/changelog' && request.method === 'GET') {
      try {
        const result = await env.DB.prepare('SELECT * FROM changelog ORDER BY updated_at DESC LIMIT 1').first();
        return new Response(JSON.stringify(result || { content: '暂无更新内容' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 更新更新内容
    if (path === '/api/changelog' && request.method === 'PUT') {
      try {
        if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const body = await request.json();
        const content = String(body.content || '').substring(0, 1000);
        const now = Date.now();
        const existing = await env.DB.prepare('SELECT * FROM changelog LIMIT 1').first();
        if (existing) {
          await env.DB.prepare('UPDATE changelog SET content = ?, updated_at = ? WHERE id = ?').bind(content, now, existing.id).run();
        } else {
          await env.DB.prepare('INSERT INTO changelog (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), content, now, now).run();
        }
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 搜索
    if (path === '/api/search' && request.method === 'GET') {
      try {
        const query = url.searchParams.get('q') || '';
        const filter = url.searchParams.get('filter') || 'all';
        let postsQuery = 'SELECT * FROM posts WHERE (content LIKE ? OR nickname LIKE ?)';
        let params = ['%' + query + '%', '%' + query + '%'];
        if (filter === 'admin') { postsQuery += ' AND is_admin = 1'; }
        else if (filter === 'liked') { postsQuery += ' AND admin_liked = 1'; }
        else if (filter === 'supported') { postsQuery += ' AND admin_support = 1'; }
        else if (filter === 'replied') { postsQuery += ' AND id IN (SELECT DISTINCT post_id FROM comments WHERE is_admin = 1)'; }
        else if (filter === 'unreplied') { postsQuery += ' AND id NOT IN (SELECT DISTINCT post_id FROM comments WHERE is_admin = 1)'; }
        postsQuery += ' ORDER BY is_pinned DESC, created_at DESC LIMIT 50';
        const { results: posts } = await env.DB.prepare(postsQuery).bind(...params).all();
        const { results: comments } = await env.DB.prepare('SELECT c.* FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.content LIKE ? LIMIT 20').bind('%' + query + '%').all();
        return new Response(JSON.stringify({ posts, comments }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 获取帖子
    if (path === '/api/posts' && request.method === 'GET') {
      try {
        const filter = url.searchParams.get('filter') || 'all';
        let query = 'SELECT * FROM posts';
        let params = [];
        if (filter === 'admin') { query += ' WHERE is_admin = 1'; }
        else if (filter === 'liked') { query += ' WHERE admin_liked = 1'; }
        else if (filter === 'supported') { query += ' WHERE admin_support = 1'; }
        else if (filter === 'replied') { query += ' WHERE id IN (SELECT DISTINCT post_id FROM comments WHERE is_admin = 1)'; }
        else if (filter === 'unreplied') { query += ' WHERE id NOT IN (SELECT DISTINCT post_id FROM comments WHERE is_admin = 1)'; }
        query += ' ORDER BY is_pinned DESC, created_at DESC LIMIT 50';
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 创建帖子
    if (path === '/api/posts' && request.method === 'POST') {
      try {
        const body = await request.json();
        let { nickname, content, images } = body;
        const isAdmin = authCheck(request, env);
        if (isAdmin) nickname = env.ADMIN_NICKNAME || '管理员';
        if (!content && (!images || images.length === 0)) return new Response(JSON.stringify({ error: '内容不能为空' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const id = crypto.randomUUID();
        await env.DB.prepare('INSERT INTO posts (id, nickname, content, images, created_at, is_pinned, admin_liked, admin_support, is_admin) VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)').bind(id, String(nickname || '匿名').substring(0, 20), String(content || '').substring(0, 500), JSON.stringify(images || []), Date.now(), isAdmin ? 1 : 0).run();
        const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
        return new Response(JSON.stringify(post), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 更新/删除/置顶/支持/赞过 路由
    if (path.match(/^\/api\/posts\/[^\/]+$/) && request.method === 'PUT') {
      const postId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const body = await request.json();
      await env.DB.prepare('UPDATE posts SET content = ? WHERE id = ?').bind(String(body.content || '').substring(0, 500), postId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/posts\/[^\/]+$/) && request.method === 'DELETE') {
      const postId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      await env.DB.prepare('DELETE FROM featured_comments WHERE post_id = ?').bind(postId).run();
      await env.DB.prepare('DELETE FROM comments WHERE post_id = ?').bind(postId).run();
      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/posts\/[^\/]+\/pin$/) && request.method === 'PUT') {
      const postId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const post = await env.DB.prepare('SELECT is_pinned FROM posts WHERE id = ?').bind(postId).first();
      await env.DB.prepare('UPDATE posts SET is_pinned = ? WHERE id = ?').bind(post.is_pinned ? 0 : 1, postId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/posts\/[^\/]+\/support$/) && request.method === 'PUT') {
      const postId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const post = await env.DB.prepare('SELECT admin_support FROM posts WHERE id = ?').bind(postId).first();
      await env.DB.prepare('UPDATE posts SET admin_support = ? WHERE id = ?').bind(post.admin_support ? 0 : 1, postId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/posts\/[^\/]+\/like$/) && request.method === 'PUT') {
      const postId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const post = await env.DB.prepare('SELECT admin_liked FROM posts WHERE id = ?').bind(postId).first();
      await env.DB.prepare('UPDATE posts SET admin_liked = ? WHERE id = ?').bind(post.admin_liked ? 0 : 1, postId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // 评论相关
    if (path.match(/^\/api\/posts\/[^\/]+\/comments$/) && request.method === 'GET') {
      const postId = path.split('/')[3];
      const { results } = await env.DB.prepare('SELECT c.*, fc.id as featured_id FROM comments c LEFT JOIN featured_comments fc ON c.id = fc.comment_id WHERE c.post_id = ? ORDER BY c.created_at ASC').bind(postId).all();
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/posts\/[^\/]+\/comments$/) && request.method === 'POST') {
      const postId = path.split('/')[3];
      const body = await request.json();
      let { nickname, content } = body;
      if (!content || !content.trim()) return new Response(JSON.stringify({ error: '评论不能为空' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const isAdmin = authCheck(request, env) ? 1 : 0;
      if (isAdmin) nickname = env.ADMIN_NICKNAME || '管理员';
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO comments (id, post_id, nickname, content, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, postId, String(nickname || '匿名').substring(0, 20), String(content).substring(0, 300), isAdmin, Date.now()).run();
      const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
      return new Response(JSON.stringify(comment), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/comments\/[^\/]+$/) && request.method === 'PUT') {
      const commentId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const body = await request.json();
      await env.DB.prepare('UPDATE comments SET content = ? WHERE id = ?').bind(String(body.content || '').substring(0, 300), commentId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/comments\/[^\/]+$/) && request.method === 'DELETE') {
      const commentId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      await env.DB.prepare('DELETE FROM featured_comments WHERE comment_id = ?').bind(commentId).run();
      await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(commentId).run();
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (path.match(/^\/api\/comments\/[^\/]+\/feature$/) && request.method === 'PUT') {
      const commentId = path.split('/')[3];
      if (!authCheck(request, env)) return new Response(JSON.stringify({ error: '无权限' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const comment = await env.DB.prepare('SELECT post_id FROM comments WHERE id = ?').bind(commentId).first();
      const existing = await env.DB.prepare('SELECT id FROM featured_comments WHERE comment_id = ?').bind(commentId).first();
      if (existing) {
        await env.DB.prepare('DELETE FROM featured_comments WHERE comment_id = ?').bind(commentId).run();
        return new Response(JSON.stringify({ success: true, featured: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } else {
        await env.DB.prepare('INSERT INTO featured_comments (id, post_id, comment_id, created_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), comment.post_id, commentId, Date.now()).run();
        return new Response(JSON.stringify({ success: true, featured: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    // 登录
    if (path === '/api/admin/login' && request.method === 'POST') {
      const body = await request.json();
      const pwd = env.ADMIN_PASSWORD || 'admin123';
      if (body.password === pwd) return new Response(JSON.stringify({ success: true, token: pwd, nickname: env.ADMIN_NICKNAME || '管理员' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: '密码错误' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    return new Response(getHTML(), { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  }
};

function getHTML() {
  return '<!DOCTYPE html>\n' +
'<html lang="zh-CN">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>万能墙</title>\n' +
'  <style>\n' +
'    *{margin:0;padding:0;box-sizing:border-box}\n' +
'    body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh;padding:20px}\n' +
'    .container{max-width:700px;margin:0 auto;background:white;border-radius:20px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,0.3)}\n' +
'    h1{text-align:center;color:#333;margin-bottom:5px;font-size:2.5em}\n' +
'    .subtitle{text-align:center;color:#666;margin-bottom:5px}\n' +
'    .notice{text-align:center;color:#999;font-size:13px;margin-bottom:5px;line-height:1.6}\n' +
'    .credit{text-align:center;color:#aaa;font-size:12px;margin-bottom:10px;font-style:italic}\n' +
'    .announcement-box{background:#fff3cd;border:1px solid #ffc107;border-radius:10px;padding:12px 15px;margin-bottom:15px;text-align:center;position:relative}\n' +
'    .announcement-title{font-weight:bold;color:#856404;font-size:13px;margin-bottom:5px}\n' +
'    .announcement-content{color:#856404;font-size:12px;line-height:1.5;white-space:pre-wrap}\n' +
'    .announcement-time{color:#aaa;font-size:10px;margin-top:3px}\n' +
'    .announcement-edit-btn{position:absolute;top:8px;right:8px;background:#ff9800;color:white;border:none;padding:2px 10px;border-radius:10px;font-size:10px;cursor:pointer;display:none}\n' +
'    .announcement-edit-area{margin-top:8px;display:none}\n' +
'    .announcement-edit-area textarea{width:100%;min-height:60px;font-size:12px;border:1px solid #ffc107;border-radius:5px;padding:8px}\n' +
'    .top-bar{display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:15px;flex-wrap:wrap}\n' +
'    .top-btn{background:#667eea;color:white;border:none;padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer;font-weight:bold}\n' +
'    .top-btn:hover{background:#5568d3}\n' +
'    .filter-bar{display:flex;justify-content:center;gap:5px;margin-bottom:15px;flex-wrap:wrap}\n' +
'    .filter-btn{background:#e0e0e0;color:#333;border:none;padding:5px 12px;border-radius:15px;font-size:11px;cursor:pointer}\n' +
'    .filter-btn.active{background:#667eea;color:white}\n' +
'    .filter-btn:hover{background:#667eea;color:white}\n' +
'    .search-bar{display:flex;gap:5px;margin-bottom:15px;justify-content:center}\n' +
'    .search-input{padding:6px 12px;border:2px solid #e0e0e0;border-radius:20px;font-size:13px;width:200px}\n' +
'    .search-input:focus{outline:none;border-color:#667eea}\n' +
'    .search-btn{background:#667eea;color:white;border:none;padding:6px 15px;border-radius:20px;font-size:12px;cursor:pointer}\n' +
'    .search-btn:hover{background:#5568d3}\n' +
'    .form-box{background:#f7f7f7;padding:20px;border-radius:12px;margin-bottom:25px}\n' +
'    textarea{width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:16px;resize:vertical;min-height:80px;font-family:inherit}\n' +
'    textarea:focus{outline:none;border-color:#667eea}\n' +
'    .row{display:flex;gap:10px;margin-top:12px;align-items:center;flex-wrap:wrap}\n' +
'    input[type="text"]{flex:1;min-width:120px;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px}\n' +
'    input[type="text"]:focus{outline:none;border-color:#667eea}\n' +
'    input[type="password"]{flex:1;min-width:120px;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px}\n' +
'    input[type="password"]:focus{outline:none;border-color:#667eea}\n' +
'    .file-btn{background:#667eea;color:white;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;display:inline-block;user-select:none}\n' +
'    .file-btn:hover{background:#5568d3}\n' +
'    #imageInput{display:none}\n' +
'    .btn{background:#667eea;color:white;border:none;padding:8px 20px;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold}\n' +
'    .btn:hover{background:#5568d3}\n' +
'    .btn:disabled{background:#ccc;cursor:not-allowed}\n' +
'    .btn-sm{background:#667eea;color:white;border:none;padding:5px 15px;border-radius:5px;cursor:pointer;font-size:12px}\n' +
'    .btn-sm:hover{background:#5568d3}\n' +
'    .btn-danger{background:#ff4444;color:white;border:none;padding:5px 15px;border-radius:5px;cursor:pointer;font-size:12px}\n' +
'    .btn-danger:hover{background:#cc0000}\n' +
'    .btn-success{background:#4CAF50;color:white;border:none;padding:5px 15px;border-radius:5px;cursor:pointer;font-size:12px}\n' +
'    .btn-warning{background:#ff9800;color:white;border:none;padding:5px 15px;border-radius:5px;cursor:pointer;font-size:12px}\n' +
'    .btn-outline{background:white;color:#667eea;border:2px solid #667eea;padding:5px 15px;border-radius:5px;cursor:pointer;font-size:12px}\n' +
'    #preview{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}\n' +
'    .preview-img{width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid #e0e0e0}\n' +
'    .post-card{background:white;border:1px solid #e0e0e0;padding:18px;border-radius:12px;margin-bottom:15px;position:relative}\n' +
'    .post-card.pinned{border:2px solid #ff9800;background:#fff8f0}\n' +
'    .post-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;flex-wrap:wrap;gap:5px}\n' +
'    .post-header-left{display:flex;flex-direction:column;gap:3px}\n' +
'    .nickname-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n' +
'    .nickname{font-weight:bold;color:#667eea;font-size:15px}\n' +
'    .nickname.admin{color:#ff0000 !important;font-weight:bold}\n' +
'    .admin-tag{background:#ff0000;color:white;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:bold;margin-left:3px}\n' +
'    .badges{display:flex;gap:5px;flex-wrap:wrap}\n' +
'    .pin-badge{background:#ff9800;color:white;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:bold;display:inline-block;width:fit-content}\n' +
'    .support-badge{background:#e8f5e9;color:#2e7d32;padding:2px 10px;border-radius:12px;font-size:11px;display:inline-block;width:fit-content;border:1px solid #4CAF50}\n' +
'    .like-badge{background:#fce4ec;color:#c62828;padding:2px 10px;border-radius:12px;font-size:11px;display:inline-block;width:fit-content;border:1px solid #e91e63}\n' +
'    .time{color:#999;font-size:12px;white-space:nowrap}\n' +
'    .content{color:#333;line-height:1.6;margin-bottom:10px;word-break:break-word;margin-top:8px}\n' +
'    .images{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}\n' +
'    .post-img{width:120px;height:120px;object-fit:cover;border-radius:8px;cursor:pointer;transition:transform 0.2s}\n' +
'    .post-img:hover{transform:scale(1.05)}\n' +
'    .post-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}\n' +
'    .comments-section{margin-top:12px;padding-top:12px;border-top:1px solid #f0f0f0}\n' +
'    .featured-comments{margin-bottom:10px}\n' +
'    .comment-item{background:#f9f9f9;padding:10px;border-radius:8px;margin-bottom:8px}\n' +
'    .comment-item.featured{background:#fff8e1;border-left:3px solid #ffc107}\n' +
'    .comment-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}\n' +
'    .comment-nickname{font-weight:bold;color:#667eea;font-size:13px}\n' +
'    .comment-nickname.admin{color:#ff0000 !important}\n' +
'    .comment-time{color:#999;font-size:11px}\n' +
'    .comment-content{color:#555;font-size:14px;line-height:1.5}\n' +
'    .featured-tag{background:#ffc107;color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-right:5px}\n' +
'    .comment-form{display:flex;gap:8px;margin-top:10px;align-items:center}\n' +
'    .comment-input{flex:1;padding:8px;border:1px solid #e0e0e0;border-radius:5px;font-size:13px}\n' +
'    .admin-comments-section{margin-top:8px;padding:8px;background:#fff9c4;border-radius:8px}\n' +
'    .admin-comment-item{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:6px 0;border-bottom:1px dashed #e0e0e0}\n' +
'    .admin-comment-item:last-child{border-bottom:none}\n' +
'    .admin-comment-content{color:#555;font-size:13px;line-height:1.5;flex:1}\n' +
'    .admin-comment-time{color:#999;font-size:10px;white-space:nowrap}\n' +
'    .admin-comments-title{font-size:11px;color:#f57f17;font-weight:bold;margin-bottom:5px}\n' +
'    .loading{text-align:center;color:#999;padding:30px}\n' +
'    .msg{display:none;text-align:center;padding:10px;border-radius:8px;margin-bottom:15px}\n' +
'    .msg-error{background:#ffe6e6;color:#ff4444}\n' +
'    .msg-success{background:#e8f5e9;color:#4CAF50}\n' +
'    .lightbox{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:1000;justify-content:center;align-items:center;cursor:pointer}\n' +
'    .lightbox.show{display:flex}\n' +
'    .lightbox img{max-width:90%;max-height:90%;border-radius:8px}\n' +
'    .edit-input{border:1px dashed #667eea;padding:5px;border-radius:4px;width:100%;font-size:14px}\n' +
'    .modal-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:999;justify-content:center;align-items:center}\n' +
'    .modal-overlay.show{display:flex}\n' +
'    .modal-box{background:white;border-radius:15px;padding:25px;width:90%;max-width:400px;box-shadow:0 20px 40px rgba(0,0,0,0.3);max-height:80vh;overflow-y:auto}\n' +
'    .modal-title{font-size:18px;font-weight:bold;margin-bottom:15px;text-align:center}\n' +
'    .modal-close{float:right;cursor:pointer;font-size:20px;color:#999}\n' +
'    .modal-close:hover{color:#333}\n' +
'    @media(max-width:600px){.container{padding:15px}.row{flex-direction:column}}\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="container">\n' +
'    <h1>📝 万能墙</h1>\n' +
'    <p class="subtitle">留下你的足迹，分享精彩瞬间</p>\n' +
'    <p class="notice">注：发布内容可匿名 | 管理员发帖显示红色昵称</p>\n' +
'    <p class="credit">by 海与迟落 & DeepSeek</p>\n' +
'    \n' +
'    <div class="announcement-box" id="announcementBox">\n' +
'      <button class="announcement-edit-btn" id="announcementEditBtn">✏️ 编辑</button>\n' +
'      <div class="announcement-title">📢 公告</div>\n' +
'      <div id="announcementDisplay">\n' +
'        <div class="announcement-content" id="announcementContent">加载中...</div>\n' +
'        <div class="announcement-time" id="announcementTime"></div>\n' +
'      </div>\n' +
'      <div class="announcement-edit-area" id="announcementEditArea">\n' +
'        <textarea id="announcementEditInput" placeholder="输入公告内容..."></textarea>\n' +
'        <div style="margin-top:5px;">\n' +
'          <button class="btn-sm btn-success" id="announcementSaveBtn">💾 保存</button>\n' +
'          <button class="btn-sm btn-outline" id="announcementCancelBtn" style="margin-left:5px;">取消</button>\n' +
'        </div>\n' +
'      </div>\n' +
'    </div>\n' +
'    \n' +
'    <div class="top-bar">\n' +
'      <button class="top-btn" id="helpBtn">📖 使用说明</button>\n' +
'      <button class="top-btn" id="changelogBtn">🔄 更新内容</button>\n' +
'      <button class="top-btn" id="loginBtn2">🔐 管理员登录</button>\n' +
'      <button class="top-btn" id="logoutTopBtn" style="display:none;background:#ff4444;">🚪 退出</button>\n' +
'    </div>\n' +
'    <div style="text-align:center;margin-bottom:10px;">\n' +
'      <span style="font-size:11px;color:#999;" id="adminStatusText"></span>\n' +
'    </div>\n' +
'    \n' +
'    <div class="search-bar">\n' +
'      <input type="text" class="search-input" id="searchInput" placeholder="搜索关键词...">\n' +
'      <button class="search-btn" id="searchBtn">🔍</button>\n' +
'      <button class="search-btn" id="clearSearchBtn" style="background:#999;">✕</button>\n' +
'    </div>\n' +
'    \n' +
'    <div class="filter-bar" id="filterBar">\n' +
'      <button class="filter-btn active" data-filter="all">全部</button>\n' +
'      <button class="filter-btn" data-filter="admin">管理员</button>\n' +
'      <button class="filter-btn" data-filter="liked">站长赞过</button>\n' +
'      <button class="filter-btn" data-filter="supported">站长支持</button>\n' +
'      <button class="filter-btn" data-filter="replied">已回复</button>\n' +
'      <button class="filter-btn" data-filter="unreplied">未回复</button>\n' +
'    </div>\n' +
'    \n' +
'    <div id="errorMsg" class="msg msg-error"></div>\n' +
'    <div id="successMsg" class="msg msg-success"></div>\n' +
'    \n' +
'    <div class="form-box">\n' +
'      <textarea id="contentInput" placeholder="说点什么吧..." maxlength="500"></textarea>\n' +
'      <div class="row">\n' +
'        <input type="text" id="nicknameInput" placeholder="你的昵称（可选）" maxlength="20">\n' +
'        <label for="imageInput" class="file-btn">📷 选择图片</label>\n' +
'        <input type="file" id="imageInput" accept="image/*" multiple>\n' +
'        <button class="btn" id="publishBtn">✨ 发布</button>\n' +
'      </div>\n' +
'      <div id="preview"></div>\n' +
'    </div>\n' +
'    \n' +
'    <div id="postsList"></div>\n' +
'  </div>\n' +
'  \n' +
'  <div class="modal-overlay" id="loginModal">\n' +
'    <div class="modal-box">\n' +
'      <span class="modal-close" id="closeLoginModal">&times;</span>\n' +
'      <div class="modal-title">管理员登录</div>\n' +
'      <input type="password" id="modalPasswordInput" placeholder="请输入管理员密码" style="width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:8px;margin-bottom:10px;">\n' +
'      <button class="btn" id="modalLoginBtn" style="width:100%;">登录</button>\n' +
'    </div>\n' +
'  </div>\n' +
'  \n' +
'  <div class="modal-overlay" id="helpModal">\n' +
'    <div class="modal-box">\n' +
'      <span class="modal-close" id="closeHelpModal">&times;</span>\n' +
'      <div class="modal-title">📖 使用说明</div>\n' +
'      <div id="helpDisplay" style="line-height:1.8;font-size:14px;color:#555;">加载中...</div>\n' +
'      <div id="helpEditArea" style="display:none;margin-top:10px;">\n' +
'        <textarea id="helpEditInput" style="width:100%;min-height:80px;font-size:13px;"></textarea>\n' +
'        <button class="btn-sm btn-success" id="helpSaveBtn" style="margin-top:5px;">保存</button>\n' +
'        <button class="btn-sm btn-outline" id="helpCancelBtn" style="margin-top:5px;margin-left:5px;">取消</button>\n' +
'      </div>\n' +
'      <button class="btn-sm btn-warning" id="editHelpBtn" style="display:none;margin-top:10px;">编辑</button>\n' +
'    </div>\n' +
'  </div>\n' +
'  \n' +
'  <div class="modal-overlay" id="changelogModal">\n' +
'    <div class="modal-box">\n' +
'      <span class="modal-close" id="closeChangelogModal">&times;</span>\n' +
'      <div class="modal-title">🔄 更新内容</div>\n' +
'      <div id="changelogDisplay" style="line-height:1.8;font-size:14px;color:#555;">加载中...</div>\n' +
'      <div id="changelogEditArea" style="display:none;margin-top:10px;">\n' +
'        <textarea id="changelogEditInput" style="width:100%;min-height:80px;font-size:13px;"></textarea>\n' +
'        <button class="btn-sm btn-success" id="changelogSaveBtn" style="margin-top:5px;">保存</button>\n' +
'        <button class="btn-sm btn-outline" id="changelogCancelBtn" style="margin-top:5px;margin-left:5px;">取消</button>\n' +
'      </div>\n' +
'      <button class="btn-sm btn-warning" id="editChangelogBtn" style="display:none;margin-top:10px;">编辑</button>\n' +
'    </div>\n' +
'  </div>\n' +
'  \n' +
'  <div class="lightbox" id="lightbox">\n' +
'    <img id="lightboxImg" src="">\n' +
'  </div>\n' +
'\n' +
'  <script>\n' +
'    (function() {\n' +
'      var adminToken = localStorage.getItem("adminToken") || "";\n' +
'      var adminNickname = localStorage.getItem("adminNickname") || "管理员";\n' +
'      var selectedFiles = [];\n' +
'      var currentFilter = "all";\n' +
'      var isSearchMode = false;\n' +
'      \n' +
'      var els = {};\n' +
'      ["publishBtn","contentInput","nicknameInput","imageInput","preview","postsList","errorMsg","successMsg","lightbox","lightboxImg",\n' +
'       "loginModal","helpModal","changelogModal","modalPasswordInput","logoutTopBtn","adminStatusText","searchInput",\n' +
'       "announcementEditBtn","announcementEditArea","announcementEditInput","announcementContent","announcementTime","announcementDisplay","announcementSaveBtn","announcementCancelBtn",\n' +
'       "helpDisplay","helpEditArea","helpEditInput","editHelpBtn","helpSaveBtn","helpCancelBtn",\n' +
'       "changelogDisplay","changelogEditArea","changelogEditInput","editChangelogBtn","changelogSaveBtn","changelogCancelBtn",\n' +
'       "closeLoginModal","closeHelpModal","closeChangelogModal","modalLoginBtn","helpBtn","changelogBtn","loginBtn2","searchBtn","clearSearchBtn"\n' +
'      ].forEach(function(id) { els[id] = document.getElementById(id); });\n' +
'      \n' +
'      loadAnnouncement();\n' +
'      loadPosts();\n' +
'      updateAdminUI();\n' +
'      \n' +
'      els.publishBtn.addEventListener("click", handlePublish);\n' +
'      els.lightbox.addEventListener("click", function() { els.lightbox.classList.remove("show"); });\n' +
'      els.modalPasswordInput.addEventListener("keypress", function(e) { if (e.key === "Enter") handleLogin(); });\n' +
'      els.searchInput.addEventListener("keypress", function(e) { if (e.key === "Enter") doSearch(); });\n' +
'      \n' +
'      els.imageInput.addEventListener("change", function(e) {\n' +
'        selectedFiles = Array.from(e.target.files);\n' +
'        els.preview.innerHTML = "";\n' +
'        selectedFiles.forEach(function(file) {\n' +
'          if (file.size > 5 * 1024 * 1024) { showMessage("图片不能超过 5MB", "error"); return; }\n' +
'          var reader = new FileReader();\n' +
'          reader.onload = function(e) { var img = document.createElement("img"); img.src = e.target.result; img.className = "preview-img"; els.preview.appendChild(img); };\n' +
'          reader.readAsDataURL(file);\n' +
'        });\n' +
'      });\n' +
'      \n' +
'      els.loginBtn2.addEventListener("click", function() { els.loginModal.classList.add("show"); els.modalPasswordInput.focus(); });\n' +
'      els.closeLoginModal.addEventListener("click", function() { els.loginModal.classList.remove("show"); els.modalPasswordInput.value = ""; });\n' +
'      els.modalLoginBtn.addEventListener("click", handleLogin);\n' +
'      els.helpBtn.addEventListener("click", function() { els.helpModal.classList.add("show"); loadHelpContent(); });\n' +
'      els.closeHelpModal.addEventListener("click", function() { els.helpModal.classList.remove("show"); });\n' +
'      els.changelogBtn.addEventListener("click", function() { els.changelogModal.classList.add("show"); loadChangelogContent(); });\n' +
'      els.closeChangelogModal.addEventListener("click", function() { els.changelogModal.classList.remove("show"); });\n' +
'      \n' +
'      els.announcementEditBtn.addEventListener("click", function() {\n' +
'        if (els.announcementEditArea.style.display === "block") return;\n' +
'        els.announcementEditInput.value = els.announcementContent.textContent;\n' +
'        els.announcementEditArea.style.display = "block";\n' +
'        els.announcementEditBtn.style.display = "none";\n' +
'        els.announcementDisplay.style.display = "none";\n' +
'      });\n' +
'      \n' +
'      els.announcementSaveBtn.addEventListener("click", async function() {\n' +
'        var content = els.announcementEditInput.value.trim();\n' +
'        if (!content) { showMessage("公告不能为空", "error"); return; }\n' +
'        try {\n' +
'          var res = await fetch("/api/announcement", { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + adminToken }, body: JSON.stringify({ content: content }) });\n' +
'          if (res.ok) {\n' +
'            showMessage("公告已更新", "success");\n' +
'            els.announcementEditArea.style.display = "none";\n' +
'            els.announcementDisplay.style.display = "block";\n' +
'            els.announcementEditBtn.style.display = "inline-block";\n' +
'            loadAnnouncement();\n' +
'          } else { showMessage("保存失败", "error"); }\n' +
'        } catch(e) { showMessage("网络错误", "error"); }\n' +
'      });\n' +
'      \n' +
'      els.announcementCancelBtn.addEventListener("click", function() {\n' +
'        els.announcementEditArea.style.display = "none";\n' +
'        els.announcementDisplay.style.display = "block";\n' +
'        els.announcementEditBtn.style.display = "inline-block";\n' +
'      });\n' +
'      \n' +
'      els.editHelpBtn.addEventListener("click", function() {\n' +
'        if (els.helpEditArea.style.display === "block") return;\n' +
'        els.helpEditInput.value = els.helpDisplay.textContent;\n' +
'        els.helpEditArea.style.display = "block";\n' +
'        els.editHelpBtn.style.display = "none";\n' +
'        els.helpDisplay.style.display = "none";\n' +
'      });\n' +
'      \n' +
'      els.helpSaveBtn.addEventListener("click", async function() {\n' +
'        var content = els.helpEditInput.value.trim();\n' +
'        if (!content) return;\n' +
'        await fetch("/api/help", { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + adminToken }, body: JSON.stringify({ content: content }) });\n' +
'        els.helpEditArea.style.display = "none";\n' +
'        els.helpDisplay.style.display = "block";\n' +
'        els.editHelpBtn.style.display = "inline-block";\n' +
'        loadHelpContent();\n' +
'      });\n' +
'      \n' +
'      els.helpCancelBtn.addEventListener("click", function() {\n' +
'        els.helpEditArea.style.display = "none";\n' +
'        els.helpDisplay.style.display = "block";\n' +
'        els.editHelpBtn.style.display = "inline-block";\n' +
'      });\n' +
'      \n' +
'      els.editChangelogBtn.addEventListener("click", function() {\n' +
'        if (els.changelogEditArea.style.display === "block") return;\n' +
'        els.changelogEditInput.value = els.changelogDisplay.textContent;\n' +
'        els.changelogEditArea.style.display = "block";\n' +
'        els.editChangelogBtn.style.display = "none";\n' +
'        els.changelogDisplay.style.display = "none";\n' +
'      });\n' +
'      \n' +
'      els.changelogSaveBtn.addEventListener("click", async function() {\n' +
'        var content = els.changelogEditInput.value.trim();\n' +
'        if (!content) return;\n' +
'        await fetch("/api/changelog", { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + adminToken }, body: JSON.stringify({ content: content }) });\n' +
'        els.changelogEditArea.style.display = "none";\n' +
'        els.changelogDisplay.style.display = "block";\n' +
'        els.editChangelogBtn.style.display = "inline-block";\n' +
'        loadChangelogContent();\n' +
'      });\n' +
'      \n' +
'      els.changelogCancelBtn.addEventListener("click", function() {\n' +
'        els.changelogEditArea.style.display = "none";\n' +
'        els.changelogDisplay.style.display = "block";\n' +
'        els.editChangelogBtn.style.display = "inline-block";\n' +
'      });\n' +
'      \n' +
'      els.searchBtn.addEventListener("click", doSearch);\n' +
'      els.clearSearchBtn.addEventListener("click", clearSearch);\n' +
'      \n' +
'      document.querySelectorAll(".filter-btn").forEach(function(btn) {\n' +
'        btn.addEventListener("click", function() {\n' +
'          currentFilter = this.dataset.filter;\n' +
'          document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });\n' +
'          this.classList.add("active");\n' +
'          isSearchMode = false;\n' +
'          els.searchInput.value = "";\n' +
'          loadPosts();\n' +
'        });\n' +
'      });\n' +
'      \n' +
'      els.logoutTopBtn.addEventListener("click", handleLogout);\n' +
'      \n' +
'      function doSearch() {\n' +
'        var q = els.searchInput.value.trim();\n' +
'        if (!q) { showMessage("请输入搜索关键词", "error"); return; }\n' +
'        isSearchMode = true;\n' +
'        loadSearchResults(q);\n' +
'      }\n' +
'      \n' +
'      function clearSearch() {\n' +
'        els.searchInput.value = "";\n' +
'        isSearchMode = false;\n' +
'        currentFilter = "all";\n' +
'        document.querySelectorAll(".filter-btn").forEach(function(b, i) { b.classList.toggle("active", i === 0); });\n' +
'        loadPosts();\n' +
'      }\n' +
'      \n' +
'      async function loadAnnouncement() {\n' +
'        try {\n' +
'          var res = await fetch("/api/announcement");\n' +
'          var data = await res.json();\n' +
'          els.announcementContent.textContent = data.content || "暂无公告";\n' +
'          if (data.updated_at) els.announcementTime.textContent = "更新于：" + new Date(data.updated_at).toLocaleString("zh-CN");\n' +
'        } catch(e) {}\n' +
'      }\n' +
'      \n' +
'      async function loadHelpContent() {\n' +
'        try {\n' +
'          var res = await fetch("/api/help");\n' +
'          var data = await res.json();\n' +
'          els.helpDisplay.innerHTML = (data.content || "暂无说明").replace(/\\n/g, "<br>");\n' +
'        } catch(e) {}\n' +
'      }\n' +
'      \n' +
'      async function loadChangelogContent() {\n' +
'        try {\n' +
'          var res = await fetch("/api/changelog");\n' +
'          var data = await res.json();\n' +
'          els.changelogDisplay.innerHTML = (data.content || "暂无更新内容").replace(/\\n/g, "<br>");\n' +
'        } catch(e) {}\n' +
'      }\n' +
'      \n' +
'      async function compressImages(files) {\n' +
'        var images = [];\n' +
'        for (var i = 0; i < files.length; i++) {\n' +
'          var base64 = await new Promise(function(resolve) {\n' +
'            var reader = new FileReader();\n' +
'            reader.onload = function(e) {\n' +
'              var img = new Image();\n' +
'              img.onload = function() {\n' +
'                var canvas = document.createElement("canvas");\n' +
'                var w = img.width, h = img.height;\n' +
'                if (w > 800) { h = (800 / w) * h; w = 800; }\n' +
'                canvas.width = w; canvas.height = h;\n' +
'                canvas.getContext("2d").drawImage(img, 0, 0, w, h);\n' +
'                resolve(canvas.toDataURL("image/jpeg", 0.6));\n' +
'              };\n' +
'              img.src = e.target.result;\n' +
'            };\n' +
'            reader.readAsDataURL(files[i]);\n' +
'          });\n' +
'          images.push(base64);\n' +
'        }\n' +
'        return images;\n' +
'      }\n' +
'      \n' +
'      async function handlePublish() {\n' +
'        var content = els.contentInput.value.trim();\n' +
'        if (!content && selectedFiles.length === 0) { showMessage("请输入内容或选择图片", "error"); return; }\n' +
'        els.publishBtn.disabled = true; els.publishBtn.textContent = "发布中...";\n' +
'        try {\n' +
'          var images = []; if (selectedFiles.length > 0) images = await compressImages(selectedFiles);\n' +
'          var headers = { "Content-Type": "application/json" }; if (adminToken) headers["Authorization"] = "Bearer " + adminToken;\n' +
'          var res = await fetch("/api/posts", { method: "POST", headers: headers, body: JSON.stringify({ nickname: els.nicknameInput.value.trim() || "匿名", content: content, images: images }) });\n' +
'          if (res.ok) { showMessage("发布成功！", "success"); els.contentInput.value = ""; els.nicknameInput.value = ""; els.preview.innerHTML = ""; els.imageInput.value = ""; selectedFiles = []; loadPosts(); }\n' +
'          else { var d = await res.json(); showMessage(d.error || "失败", "error"); }\n' +
'        } catch(e) { showMessage("网络错误", "error"); }\n' +
'        finally { els.publishBtn.disabled = false; els.publishBtn.textContent = "✨ 发布"; }\n' +
'      }\n' +
'      \n' +
'      async function loadSearchResults(q) {\n' +
'        els.postsList.innerHTML = "<div class=\\"loading\\">搜索中...</div>";\n' +
'        try {\n' +
'          var res = await fetch("/api/search?q=" + encodeURIComponent(q) + "&filter=" + currentFilter);\n' +
'          var data = await res.json();\n' +
'          var posts = data.posts || [];\n' +
'          if (posts.length === 0) { els.postsList.innerHTML = "<div class=\\"loading\\">未找到相关内容</div>"; return; }\n' +
'          renderPosts(posts);\n' +
'        } catch(e) { els.postsList.innerHTML = "<div class=\\"loading\\">搜索失败</div>"; }\n' +
'      }\n' +
'      \n' +
'      async function loadPosts() {\n' +
'        if (isSearchMode) return;\n' +
'        els.postsList.innerHTML = "<div class=\\"loading\\">加载中...</div>";\n' +
'        try {\n' +
'          var url = "/api/posts";\n' +
'          if (currentFilter !== "all") url += "?filter=" + currentFilter;\n' +
'          var res = await fetch(url);\n' +
'          var posts = await res.json();\n' +
'          if (!posts || posts.length === 0) { els.postsList.innerHTML = "<div class=\\"loading\\">还没有留言</div>"; return; }\n' +
'          renderPosts(posts);\n' +
'        } catch(e) { els.postsList.innerHTML = "<div class=\\"loading\\">加载失败</div>"; }\n' +
'      }\n' +
'      \n' +
'      function renderPosts(posts) {\n' +
'        var html = "";\n' +
'        for (var i = 0; i < posts.length; i++) {\n' +
'          var post = posts[i];\n' +
'          var images = []; try { images = JSON.parse(post.images || "[]"); } catch(e) {}\n' +
'          // 使用 is_admin 字段判断，而不是比较昵称\n' +
'          var isAdminPost = post.is_admin === 1;\n' +
'          var isPinned = post.is_pinned === 1;\n' +
'          var isSupported = post.admin_support === 1;\n' +
'          var isLiked = post.admin_liked === 1;\n' +
'          var time = new Date(post.created_at).toLocaleString("zh-CN");\n' +
'          var badges = "";\n' +
'          if (isPinned || isSupported || isLiked) {\n' +
'            badges = "<div class=\\"badges\\">";\n' +
'            if (isPinned) badges += "<span class=\\"pin-badge\\">📌 置顶</span>";\n' +
'            if (isSupported) badges += "<span class=\\"support-badge\\">✅ 站长支持</span>";\n' +
'            if (isLiked) badges += "<span class=\\"like-badge\\">❤️ 站长赞过</span>";\n' +
'            badges += "</div>";\n' +
'          }\n' +
'          var imagesHtml = "";\n' +
'          if (images.length > 0) {\n' +
'            imagesHtml = "<div class=\\"images\\">";\n' +
'            for (var j = 0; j < images.length; j++) imagesHtml += "<img src=\\"" + images[j] + "\\" class=\\"post-img\\" onclick=\\"event.stopPropagation();document.getElementById(\'lightboxImg\').src=\'" + images[j] + "\';document.getElementById(\'lightbox\').classList.add(\'show\')\\">";\n' +
'            imagesHtml += "</div>";\n' +
'          }\n' +
'          var actionBtns = "";\n' +
'          if (adminToken) {\n' +
'            actionBtns += "<button class=\\"btn-sm btn-warning\\" onclick=\\"pinPost(\'" + post.id + "\')\\">" + (isPinned ? "取消置顶" : "📌 置顶") + "</button>";\n' +
'            actionBtns += "<button class=\\"btn-sm btn-success\\" onclick=\\"supportPost(\'" + post.id + "\')\\">" + (isSupported ? "取消支持" : "✅ 站长支持") + "</button>";\n' +
'            actionBtns += "<button class=\\"btn-sm\\" style=\\"background:#e91e63;\\" onclick=\\"likePost(\'" + post.id + "\')\\">" + (isLiked ? "取消赞过" : "❤️ 站长赞过") + "</button>";\n' +
'            actionBtns += "<button class=\\"btn-sm\\" onclick=\\"editPost(\'" + post.id + "\')\\">✏️ 编辑</button>";\n' +
'            actionBtns += "<button class=\\"btn-danger\\" onclick=\\"deletePostFn(\'" + post.id + "\')\\">删除</button>";\n' +
'          }\n' +
'          // 昵称 + 管理员标识\n' +
'          var nicknameHtml = "<span class=\\"nickname" + (isAdminPost ? " admin" : "") + "\\">👤 " + escapeHtml(post.nickname || "匿名") + "</span>";\n' +
'          if (isAdminPost) nicknameHtml += "<span class=\\"admin-tag\\">管理员</span>";\n' +
'          \n' +
'          html += "<div class=\\"post-card" + (isPinned ? " pinned" : "") + "\\">";\n' +
'          html += "<div class=\\"post-header\\"><div class=\\"post-header-left\\"><div class=\\"nickname-row\\">" + nicknameHtml + "</div>" + badges + "</div><span class=\\"time\\">" + time + "</span></div>";\n' +
'          html += "<div id=\\"post-content-" + post.id + "\\">" + (post.content ? "<div class=\\"content\\">" + escapeHtml(post.content) + "</div>" : "") + "</div>";\n' +
'          html += imagesHtml;\n' +
'          html += "<div id=\\"admin-comments-" + post.id + "\\" class=\\"admin-comments-section\\" style=\\"display:none;\\"></div>";\n' +
'          html += "<div class=\\"post-actions\\"><button class=\\"btn-sm\\" onclick=\\"toggleComments(\'" + post.id + "\')\\">💬 评论</button>" + actionBtns + "</div>";\n' +
'          html += "<div class=\\"comments-section\\" id=\\"comments-" + post.id + "\\" style=\\"display:none\\"><div class=\\"loading\\">加载中...</div></div>";\n' +
'          html += "</div>";\n' +
'        }\n' +
'        els.postsList.innerHTML = html;\n' +
'        for (var k = 0; k < posts.length; k++) loadAdminComments(posts[k].id);\n' +
'        \n' +
'        window.toggleComments = async function(pid) { var s = document.getElementById("comments-" + pid); if (s.style.display === "none") { s.style.display = "block"; await loadComments(pid); } else s.style.display = "none"; };\n' +
'        window.pinPost = async function(pid) { await fetch("/api/posts/" + pid + "/pin", { method: "PUT", headers: { "Authorization": "Bearer " + adminToken } }); loadPosts(); };\n' +
'        window.supportPost = async function(pid) { await fetch("/api/posts/" + pid + "/support", { method: "PUT", headers: { "Authorization": "Bearer " + adminToken } }); loadPosts(); };\n' +
'        window.likePost = async function(pid) { await fetch("/api/posts/" + pid + "/like", { method: "PUT", headers: { "Authorization": "Bearer " + adminToken } }); loadPosts(); };\n' +
'        window.editPost = function(pid) { var d = document.getElementById("post-content-" + pid); var t = d.textContent.trim(); d.innerHTML = "<textarea id=\\"ep-" + pid + "\\" class=\\"edit-input\\" style=\\"min-height:60px;\\">" + escapeHtml(t) + "</textarea><button class=\\"btn-sm btn-success\\" onclick=\\"savePost(\'" + pid + "\')\\">保存</button><button class=\\"btn-sm btn-outline\\" onclick=\\"loadPosts()\\" style=\\"margin-left:3px;\\">取消</button>"; };\n' +
'        window.savePost = async function(pid) { var v = document.getElementById("ep-" + pid).value.trim(); if (!v) return; await fetch("/api/posts/" + pid, { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + adminToken }, body: JSON.stringify({ content: v }) }); showMessage("已保存", "success"); loadPosts(); };\n' +
'        window.deletePostFn = async function(pid) { if (!confirm("确定删除？")) return; await fetch("/api/posts/" + pid, { method: "DELETE", headers: { "Authorization": "Bearer " + adminToken } }); showMessage("已删除", "success"); loadPosts(); };\n' +
'        window.submitComment = async function(pid) { var inp = document.getElementById("ci-" + pid); var v = inp.value.trim(); if (!v) return; var h = { "Content-Type": "application/json" }; if (adminToken) h["Authorization"] = "Bearer " + adminToken; await fetch("/api/posts/" + pid + "/comments", { method: "POST", headers: h, body: JSON.stringify({ nickname: "用户", content: v }) }); inp.value = ""; await loadComments(pid); loadAdminComments(pid); };\n' +
'        window.deleteComment = async function(cid) { if (!confirm("删除？")) return; await fetch("/api/comments/" + cid, { method: "DELETE", headers: { "Authorization": "Bearer " + adminToken } }); showMessage("已删除", "success"); refreshComments(); };\n' +
'        window.editComment = function(cid) { var d = document.getElementById("cc-" + cid); var t = d.textContent.trim(); d.innerHTML = "<input id=\\"ec-" + cid + "\\" class=\\"edit-input\\" value=\\"" + escapeHtml(t) + "\\"><button class=\\"btn-sm btn-success\\" onclick=\\"saveComment(\'" + cid + "\')\\">保存</button>"; };\n' +
'        window.saveComment = async function(cid) { var v = document.getElementById("ec-" + cid).value.trim(); if (!v) return; await fetch("/api/comments/" + cid, { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + adminToken }, body: JSON.stringify({ content: v }) }); refreshComments(); };\n' +
'        window.featureComment = async function(cid) { await fetch("/api/comments/" + cid + "/feature", { method: "PUT", headers: { "Authorization": "Bearer " + adminToken } }); refreshComments(); };\n' +
'      }\n' +
'      \n' +
'      async function refreshComments() {\n' +
'        var ss = document.querySelectorAll(".comments-section");\n' +
'        for (var i = 0; i < ss.length; i++) { if (ss[i].style.display === "block") { var pid = ss[i].id.replace("comments-", ""); await loadComments(pid); await loadAdminComments(pid); } }\n' +
'      }\n' +
'      \n' +
'      async function loadAdminComments(pid) {\n' +
'        var s = document.getElementById("admin-comments-" + pid);\n' +
'        try {\n' +
'          var res = await fetch("/api/posts/" + pid + "/comments");\n' +
'          var comments = await res.json();\n' +
'          var adminComments = [];\n' +
'          for (var i = 0; i < comments.length; i++) { if (comments[i].is_admin === 1) adminComments.push(comments[i]); }\n' +
'          if (adminComments.length > 0) {\n' +
'            s.style.display = "block";\n' +
'            var html = "<div class=\\"admin-comments-title\\">👑 管理员回复</div>";\n' +
'            for (var j = 0; j < adminComments.length; j++) {\n' +
'              var c = adminComments[j];\n' +
'              html += "<div class=\\"admin-comment-item\\"><div class=\\"admin-comment-content\\">" + escapeHtml(c.content) + "</div><span class=\\"admin-comment-time\\">" + new Date(c.created_at).toLocaleString("zh-CN") + "</span></div>";\n' +
'            }\n' +
'            s.innerHTML = html;\n' +
'          } else { s.style.display = "none"; }\n' +
'        } catch(e) {}\n' +
'      }\n' +
'      \n' +
'      async function loadComments(pid) {\n' +
'        var s = document.getElementById("comments-" + pid);\n' +
'        try {\n' +
'          var res = await fetch("/api/posts/" + pid + "/comments");\n' +
'          var comments = await res.json();\n' +
'          var fhtml = "", nhtml = "";\n' +
'          for (var i = 0; i < comments.length; i++) {\n' +
'            var c = comments[i];\n' +
'            var isAdmin = c.is_admin === 1;\n' +
'            var isF = c.featured_id ? true : false;\n' +
'            var nickHtml = "<span class=\\"comment-nickname" + (isAdmin ? " admin" : "") + "\\">" + escapeHtml(c.nickname) + "</span>";\n' +
'            if (isAdmin) nickHtml += "<span class=\\"admin-tag\\">管理员</span>";\n' +
'            \n' +
'            var ch = "<div class=\\"comment-item" + (isF ? " featured" : "") + "\\"><div class=\\"comment-header\\"><span>" + (isF ? "<span class=\\"featured-tag\\">精</span>" : "") + nickHtml + "</span><span style=\\"display:flex;align-items:center;gap:5px;\\"><span class=\\"comment-time\\">" + new Date(c.created_at).toLocaleString("zh-CN") + "</span>";\n' +
'            if (adminToken) ch += "<button class=\\"btn-sm btn-warning\\" style=\\"font-size:10px;padding:2px 6px;\\" onclick=\\"featureComment(\'" + c.id + "\')\\">" + (isF ? "取消精选" : "精选") + "</button><button class=\\"btn-sm\\" style=\\"font-size:10px;padding:2px 6px;\\" onclick=\\"editComment(\'" + c.id + "\')\\">编辑</button><button class=\\"btn-danger\\" style=\\"font-size:10px;padding:2px 6px;\\" onclick=\\"deleteComment(\'" + c.id + "\')\\">删除</button>";\n' +
'            ch += "</span></div><div class=\\"comment-content\\" id=\\"cc-" + c.id + "\\">" + escapeHtml(c.content) + "</div></div>";\n' +
'            if (isF) fhtml += ch; else nhtml += ch;\n' +
'          }\n' +
'          var html = (fhtml ? "<div class=\\"featured-comments\\">" + fhtml + "</div>" : "") + nhtml;\n' +
'          if (comments.length === 0) html = "<p style=\\"color:#999;font-size:13px;padding:10px;\\">暂无评论</p>";\n' +
'          html += "<div class=\\"comment-form\\"><input type=\\"text\\" class=\\"comment-input\\" id=\\"ci-" + pid + "\\" placeholder=\\"写下评论...\\"><button class=\\"btn-sm\\" onclick=\\"submitComment(\'" + pid + "\')\\">发送</button></div>";\n' +
'          s.innerHTML = html;\n' +
'        } catch(e) { s.innerHTML = "<p style=\\"color:#999;\\">加载失败</p>"; }\n' +
'      }\n' +
'      \n' +
'      async function handleLogin() {\n' +
'        var pw = els.modalPasswordInput.value;\n' +
'        if (!pw) { showMessage("请输入密码", "error"); return; }\n' +
'        try {\n' +
'          var res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });\n' +
'          var data = await res.json();\n' +
'          if (data.success) {\n' +
'            adminToken = data.token; adminNickname = data.nickname || "管理员";\n' +
'            localStorage.setItem("adminToken", adminToken); localStorage.setItem("adminNickname", adminNickname);\n' +
'            updateAdminUI(); loadPosts(); els.loginModal.classList.remove("show"); els.modalPasswordInput.value = "";\n' +
'            showMessage("登录成功！" + adminNickname, "success");\n' +
'          } else showMessage("密码错误", "error");\n' +
'        } catch(e) { showMessage("登录失败", "error"); }\n' +
'      }\n' +
'      \n' +
'      function handleLogout() {\n' +
'        if (!confirm("确定退出？")) return;\n' +
'        adminToken = ""; adminNickname = "管理员";\n' +
'        localStorage.removeItem("adminToken"); localStorage.removeItem("adminNickname");\n' +
'        updateAdminUI(); loadPosts(); showMessage("已退出", "success");\n' +
'      }\n' +
'      \n' +
'      function updateAdminUI() {\n' +
'        if (adminToken) {\n' +
'          els.logoutTopBtn.style.display = "inline-block";\n' +
'          els.adminStatusText.textContent = "👑 " + adminNickname;\n' +
'          els.announcementEditBtn.style.display = "inline-block";\n' +
'          els.editHelpBtn.style.display = "inline-block";\n' +
'          els.editChangelogBtn.style.display = "inline-block";\n' +
'        } else {\n' +
'          els.logoutTopBtn.style.display = "none";\n' +
'          els.adminStatusText.textContent = "";\n' +
'          els.announcementEditBtn.style.display = "none";\n' +
'          els.announcementEditArea.style.display = "none";\n' +
'          els.announcementDisplay.style.display = "block";\n' +
'          els.editHelpBtn.style.display = "none";\n' +
'          els.editChangelogBtn.style.display = "none";\n' +
'          els.helpEditArea.style.display = "none";\n' +
'          els.helpDisplay.style.display = "block";\n' +
'          els.changelogEditArea.style.display = "none";\n' +
'          els.changelogDisplay.style.display = "block";\n' +
'        }\n' +
'      }\n' +
'      \n' +
'      function showMessage(text, type) {\n' +
'        var el = type === "error" ? els.errorMsg : els.successMsg;\n' +
'        el.textContent = text; el.style.display = "block";\n' +
'        setTimeout(function() { el.style.display = "none"; }, 3000);\n' +
'      }\n' +
'      \n' +
'      function escapeHtml(text) {\n' +
'        var div = document.createElement("div");\n' +
'        div.textContent = text;\n' +
'        return div.innerHTML;\n' +
'      }\n' +
'    })();\n' +
'  </script>\n' +
'</body>\n' +
'</html>';
}
