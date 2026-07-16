#!/usr/bin/env node

/**
 * 修复archives页面和其他遗留问题
 */

const fs = require('fs');
const path = require('path');

// 1. 修复archives页面
const archivesFiles = [
  'archives/index.html',
  'archives/page/2/index.html',
  'archives/2019/index.html',
  'archives/2019/page/2/index.html',
  'archives/2019/04/index.html',
  'archives/2019/05/index.html',
  'archives/2019/06/index.html',
  'archives/2019/07/index.html',
  'archives/2019/09/index.html',
  'archives/2019/11/index.html',
  'archives/2019/12/index.html',
];

console.log('=== 修复archives页面 ===\n');

archivesFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`✗ 文件不存在: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 修复作者
  if (content.includes('content="John Doe"')) {
    content = content.replace(/content="John Doe"/g, 'content="lx_blogs"');
    modified = true;
  }
  
  // 修复标题
  if (content.includes('| Hexo')) {
    content = content.replace(/\| Hexo/g, '| lx_blogs');
    modified = true;
  }
  
  // 修复路径
  const depth = file.split('/').length - 1;
  const prefix = '../'.repeat(depth);
  
  // 修复绝对路径资源引用
  content = content.replace(/href="\/css\//g, `href="${prefix}css/`);
  content = content.replace(/src="\/js\//g, `src="${prefix}js/`);
  content = content.replace(/href="\/img\//g, `href="${prefix}img/`);
  content = content.replace(/src="\/img\//g, `src="${prefix}img/`);
  content = content.replace(/href="\/plugin\//g, `href="${prefix}plugin/`);
  content = content.replace(/src="\/plugin\//g, `src="${prefix}plugin/`);
  
  // 修复导航链接
  content = content.replace(/href="\/" class="menu-item-home"/g, `href="${prefix}" class="menu-item-home"`);
  content = content.replace(/href="\/archives"/g, `href="${prefix}archives"`);
  content = content.replace(/href="\/categories"/g, `href="${prefix}categories"`);
  content = content.replace(/href="\/tags"/g, `href="${prefix}tags"`);
  content = content.replace(/href="\/about"/g, `href="${prefix}about"`);
  content = content.replace(/href="\/gallery"/g, `href="${prefix}gallery"`);
  content = content.replace(/href="\/atom\.xml"/g, `href="${prefix}atom.xml"`);
  content = content.replace(/href="\/img\/favicon\.ico"/g, `href="${prefix}img/favicon.ico"`);
  content = content.replace(/data-normal-src="\/img\//g, `data-normal-src="${prefix}img/`);
  content = content.replace(/<a href="\/">/g, `<a href="${prefix}">`);
  
  modified = true;
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ 已修复: ${file}`);
  }
});

// 2. 修复2019年文章的空标题
console.log('\n=== 修复2019年文章空标题 ===\n');

const articles2019 = [
  { path: '2019/04/30/Ajax初体验', title: 'Ajax初体验' },
  { path: '2019/05/06/Apache的安装和配置', title: 'Apache的安装和配置' },
  { path: '2019/05/07/FileReader相关方法', title: 'FileReader相关方法' },
  { path: '2019/05/08/background属性总结', title: 'background属性总结' },
  { path: '2019/05/10/伸缩布局总结', title: '伸缩布局常用属性总结' },
  { path: '2019/05/18/touch', title: '移动端touch事件总结' },
  { path: '2019/05/26/node复习', title: 'Node.js复习' },
  { path: '2019/05/28/JS实现异步请求', title: 'JS实现异步请求4种方法对比' },
  { path: '2019/05/29/mongodb在node中使用总结', title: 'mongodb在node中使用总结' },
  { path: '2019/06/19/webpack4使用说明', title: 'webpack4使用说明' },
  { path: '2019/07/05/小程序开发遇到的坑', title: '小程序开发遇到的坑' },
  { path: '2019/07/08/React', title: 'React开发' },
  { path: '2019/09/08/去哪网坑一', title: '去哪网坑一' },
  { path: '2019/11/12/快速修改elementUI样式', title: '快速修改elementUI样式' },
  { path: '2019/12/20/防抖节流函数', title: '防抖节流函数' },
];

articles2019.forEach(({ path: articlePath, title }) => {
  const filePath = path.join(__dirname, articlePath, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.log(`✗ 文件不存在: ${articlePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // 修复 <title> 标签中的空标题
  // 匹配 <title>\n    \n       | lx_blogs\n    \n  </title> 这种模式
  const emptyTitlePattern = /<title>\s*\n\s*\n?\s*\|\s*lx_blogs\s*\n\s*<\/title>/;
  if (emptyTitlePattern.test(content)) {
    content = content.replace(emptyTitlePattern, `<title>\n    ${title} | lx_blogs\n  </title>`);
    modified = true;
    console.log(`✓ 修复标题: ${articlePath} -> "${title}"`);
  }
  
  // 修复 article-title 中缺少标题链接的情况
  // 匹配 <div class="article-title">\n\t\t<i ...></i>\n\t\t\n\t</div>
  const emptyArticleTitle = /<div class="article-title">\s*<i class="fa fa-paper-plane-o"[^>]*><\/i>\s*<\/div>/;
  if (emptyArticleTitle.test(content)) {
    const depth = articlePath.split('/').length;
    const articleHref = `/${articlePath.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1/$2/$3')}/`;
    content = content.replace(emptyArticleTitle, 
      `<div class="article-title">\n\t\t<i class="fa fa-paper-plane-o" aria-hidden="true"></i>\n\t\t<a href="${articleHref}" itemprop="url">\n\t\t\t${title}\n\t\t</a>\n\t</div>`);
    modified = true;
    console.log(`  ✓ 修复article-title: "${title}"`);
  }
  
  // 修复导航栏中"当前文章"为空的情况
  const emptyNavTitle = /当前文章&nbsp;:&nbsp;《》/;
  if (emptyNavTitle.test(content)) {
    content = content.replace(emptyNavTitle, `当前文章&nbsp;:&nbsp;《${title}》`);
    modified = true;
    console.log(`  ✓ 修复导航标题: "${title}"`);
  }
  
  // 修复meta description和keywords为空
  if (content.includes('<meta name="keywords" content>') && !content.includes(`<meta name="keywords" content="${title}"`)) {
    content = content.replace(/<meta name="keywords" content>/, `<meta name="keywords" content="${title}">`);
    modified = true;
  }
  if (content.includes('<meta name="description" content>') && !content.includes(`<meta name="description" content="${title}"`)) {
    content = content.replace(/<meta name="description" content>/, `<meta name="description" content="${title}">`);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  } else {
    console.log(`- 无需修复: ${articlePath}`);
  }
});

console.log('\n=== 修复完成 ===');
