#!/usr/bin/env node

/**
 * 批量修复2019年文章的样式问题
 * 1. 修复标题: | Hexo -> | lx_blogs
 * 2. 修复作者: John Doe -> lx_blogs
 * 3. 修复路径: 绝对路径 -> 相对路径
 */

const fs = require('fs');
const path = require('path');

// 2019年所有文章目录
const articles = [
  '2019/04/30/Ajax初体验',
  '2019/05/06/Apache的安装和配置',
  '2019/05/07/FileReader相关方法',
  '2019/05/08/background属性总结',
  '2019/05/10/伸缩布局总结',
  '2019/05/18/touch',
  '2019/05/26/node复习',
  '2019/05/28/JS实现异步请求',
  '2019/05/29/mongodb在node中使用总结',
  '2019/06/19/webpack4使用说明',
  '2019/07/05/小程序开发遇到的坑',
  '2019/07/08/React',
  '2019/09/08/去哪网坑一',
  '2019/11/12/快速修改elementUI样式',
  '2019/12/20/防抖节流函数'
];

function fixArticle(articlePath) {
  const htmlFile = path.join(__dirname, articlePath, 'index.html');
  
  if (!fs.existsSync(htmlFile)) {
    console.log(`✗ 文件不存在: ${htmlFile}`);
    return false;
  }
  
  let content = fs.readFileSync(htmlFile, 'utf-8');
  let modified = false;
  
  // 1. 修复作者: John Doe -> lx_blogs
  if (content.includes('content="John Doe"')) {
    content = content.replace(/content="John Doe"/g, 'content="lx_blogs"');
    modified = true;
    console.log(`  ✓ 修复作者: John Doe -> lx_blogs`);
  }
  
  // 2. 修复标题: | Hexo -> | lx_blogs
  if (content.includes('| Hexo')) {
    content = content.replace(/\| Hexo/g, '| lx_blogs');
    modified = true;
    console.log(`  ✓ 修复标题: | Hexo -> | lx_blogs`);
  }
  
  // 3. 修复路径: 绝对路径 -> 相对路径
  // 计算相对路径深度 (2019/04/30/xxx -> 4层)
  const depth = articlePath.split('/').length;
  const relativePath = '../'.repeat(depth);
  
  // 修复CSS路径
  if (content.includes('href="/css/')) {
    content = content.replace(/href="\/css\//g, `href="${relativePath}css/`);
    modified = true;
    console.log(`  ✓ 修复CSS路径: /css/ -> ${relativePath}css/`);
  }
  
  // 修复JS路径
  if (content.includes('src="/js/')) {
    content = content.replace(/src="\/js\//g, `src="${relativePath}js/`);
    modified = true;
    console.log(`  ✓ 修复JS路径: /js/ -> ${relativePath}js/`);
  }
  
  // 修复图片路径
  if (content.includes('src="/img/') || content.includes('href="/img/')) {
    content = content.replace(/src="\/img\//g, `src="${relativePath}img/`);
    content = content.replace(/href="\/img\//g, `href="${relativePath}img/`);
    modified = true;
    console.log(`  ✓ 修复图片路径: /img/ -> ${relativePath}img/`);
  }
  
  // 修复导航链接
  const navPatterns = [
    { pattern: /href="\/" class="menu-item-home"/g, replacement: `href="${relativePath}" class="menu-item-home"` },
    { pattern: /href="\/archives"/g, replacement: `href="${relativePath}archives"` },
    { pattern: /href="\/categories"/g, replacement: `href="${relativePath}categories"` },
    { pattern: /href="\/tags"/g, replacement: `href="${relativePath}tags"` },
    { pattern: /href="\/about"/g, replacement: `href="${relativePath}about"` },
    { pattern: /href="\/gallery"/g, replacement: `href="${relativePath}gallery"` },
    { pattern: /href="\/atom\.xml"/g, replacement: `href="${relativePath}atom.xml"` }
  ];
  
  navPatterns.forEach(({ pattern, replacement }) => {
    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  // 修复logo链接
  if (content.includes('<a href="/">')) {
    content = content.replace(/<a href="\/">/g, `<a href="${relativePath}">`);
    modified = true;
  }
  
  // 修复favicon路径
  if (content.includes('href="/img/favicon.ico"')) {
    content = content.replace(/href="\/img\/favicon\.ico"/g, `href="${relativePath}img/favicon.ico"`);
    modified = true;
    console.log(`  ✓ 修复favicon路径`);
  }
  
  // 修复header背景图片路径
  if (content.includes('data-normal-src="/img/')) {
    content = content.replace(/data-normal-src="\/img\//g, `data-normal-src="${relativePath}img/`);
    modified = true;
    console.log(`  ✓ 修复header背景图路径`);
  }
  
  // 修复plugin路径
  if (content.includes('src="/plugin/') || content.includes('href="/plugin/')) {
    content = content.replace(/src="\/plugin\//g, `src="${relativePath}plugin/`);
    content = content.replace(/href="\/plugin\//g, `href="${relativePath}plugin/`);
    modified = true;
    console.log(`  ✓ 修复plugin路径`);
  }
  
  // 修复封面图片路径 data-scr="/img/cart_cover.jpg"
  if (content.includes('data-scr="/img/cart_cover.jpg"')) {
    content = content.replace(/data-scr="\/img\/cart_cover\.jpg"/g, `data-scr="${relativePath}img/cart_cover.jpg"`);
    modified = true;
    console.log(`  ✓ 修复封面图片路径`);
  }
  
  // 移除header-date时间组件
  if (content.includes('header-date')) {
    // 移除header-date相关的style和script
    content = content.replace(/<!--\s*\n\s*This is only a demo.*?\n\s*-->\s*<style.*?<\/style>\s*<div class="header-date">.*?<\/div>\s*<script.*?<\/script>\s*<script.*?<\/script>/gs, '');
    // 如果还有残留，继续清理
    content = content.replace(/<div class="header-date">.*?<\/div>/gs, '');
    content = content.replace(/<style[^>]*>\s*\.header-date.*?<\/style>/gs, '');
    content = content.replace(/<script[^>]*>[\s\S]*?time_is_widget[\s\S]*?<\/script>/gs, '');
    content = content.replace(/<script[^>]*widget\.time\.is[\s\S]*?<\/script>/gs, '');
    modified = true;
    console.log(`  ✓ 移除header-date组件`);
  }
  
  // 移除layout-toc目录布局（如果存在）
  if (content.includes('layout-toc') && content.includes('katelog')) {
    content = content.replace(/<!--\s*\n\s*时间：.*?\n\s*描述：.*?\n\s*插件名称：katelog.*?\n\s*插件作者：.*?\n\s*插件来源.*?\n\s*-->\s*<div class="layout-toc">.*?<\/div>\s*<\/div>\s*<script[^>]*katelog[^<]*<\/script>/gs, '');
    modified = true;
    console.log(`  ✓ 移除layout-toc目录`);
  }
  
  if (modified) {
    fs.writeFileSync(htmlFile, content, 'utf-8');
    console.log(`✓ 已修复: ${articlePath}\n`);
    return true;
  } else {
    console.log(`- 无需修复: ${articlePath}\n`);
    return false;
  }
}

console.log('开始修复2019年文章样式...\n');
console.log('='.repeat(60));

let fixedCount = 0;
articles.forEach(article => {
  console.log(`\n处理: ${article}`);
  if (fixArticle(article)) {
    fixedCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n修复完成! 共修复 ${fixedCount}/${articles.length} 篇文章`);
