#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 所有文章数据
const allArticles = [
  // 2026年
  { path: '2026/07/14/WebAssembly进阶：高性能计算场景实战', title: 'WebAssembly进阶：高性能计算场景实战', date: '2026-07-14', tags: ['WebAssembly', '高性能计算', 'WASM'], categories: ['工程化'] },
  // 2025年
  { path: '2025/08/20/大模型时代的前端工程化', title: '大模型时代的前端工程化', date: '2025-08-20', tags: ['AI', '工程化', '大模型'], categories: ['AI'] },
  { path: '2025/03/10/AI驱动的组件生成与智能UI', title: 'AI驱动的组件生成与智能UI', date: '2025-03-10', tags: ['AI', '组件生成', '智能UI'], categories: ['AI'] },
  { path: '2025/03/15/AI Agent前端开发实战', title: 'AI Agent前端开发实战', date: '2025-03-15', tags: ['AI Agent', '前端开发', 'LLM', '智能助手'], categories: ['AI'] },
  // 2024年
  { path: '2024/09/20/前端架构演进之路', title: '前端架构演进之路', date: '2024-09-20', tags: ['架构', '微前端', '模块化'], categories: ['前端框架'] },
  { path: '2024/03/15/AI辅助前端开发实践', title: 'AI辅助前端开发实践', date: '2024-03-15', tags: ['AI', 'Copilot', 'Cursor', 'Prompt Engineering'], categories: ['工程化'] },
  // 2023年
  { path: '2023/06/10/React19新特性前瞻', title: 'React19新特性前瞻', date: '2023-06-10', tags: ['React19', 'Server Components', '并发特性'], categories: ['前端框架'] },
  // 2022年
  { path: '2022/11/15/前端工程化之CI-CD实践', title: '前端工程化之CI/CD实践', date: '2022-11-15', tags: ['CI/CD', '自动化', 'DevOps'], categories: ['工程化'] },
  { path: '2022/08/20/Vue3组合式API最佳实践', title: 'Vue3组合式API最佳实践', date: '2022-08-20', tags: ['Vue3', 'Composition API', '最佳实践'], categories: ['前端框架'] },
  { path: '2022/08/15/前端工程化之Webpack5深度配置', title: '前端工程化之Webpack5深度配置', date: '2022-08-15', tags: ['Webpack5', '工程化', '构建工具'], categories: ['工程化'] },
  { path: '2022/04/12/React18新特性与并发模式', title: 'React18新特性与并发模式', date: '2022-04-12', tags: ['React18', '并发模式', 'Suspense', 'Transitions'], categories: ['前端框架'] },
  // 2021年
  { path: '2021/12/25/Next.js全栈开发指南', title: 'Next.js全栈开发指南', date: '2021-12-25', tags: ['Next.js', 'SSR', '全栈'], categories: ['前端框架'] },
  { path: '2021/11/08/前端监控体系搭建', title: '前端监控体系搭建', date: '2021-11-08', tags: ['监控', '性能', '错误追踪'], categories: ['监控与运维'] },
  { path: '2021/09/20/微前端架构设计与实践', title: '微前端架构设计与实践', date: '2021-09-20', tags: ['微前端', 'qiankun', 'Module Federation'], categories: ['前端框架'] },
  { path: '2021/08/15/React状态管理方案对比', title: 'React状态管理方案对比', date: '2021-08-15', tags: ['React', 'Redux', 'MobX', 'Zustand'], categories: ['前端框架'] },
  { path: '2021/06/28/Vite源码解析与原理分析', title: 'Vite源码解析与原理分析', date: '2021-06-28', tags: ['Vite', '源码', '构建工具'], categories: ['工程化'] },
  { path: '2021/05/20/React Hooks深入理解', title: 'React Hooks深入理解', date: '2021-05-20', tags: ['React', 'Hooks', '自定义Hook'], categories: ['前端框架'] },
  { path: '2021/05/10/前端工程化之Monorepo实践', title: '前端工程化之Monorepo实践', date: '2021-05-10', tags: ['Monorepo', 'Lerna', 'pnpm workspace'], categories: ['工程化'] },
  { path: '2021/03/22/Vue3+TypeScript项目实战', title: 'Vue3+TypeScript项目实战', date: '2021-03-22', tags: ['Vue3', 'TypeScript', '项目实战'], categories: ['前端框架'] },
  { path: '2021/01/18/React Server Components详解', title: 'React Server Components详解', date: '2021-01-18', tags: ['React', 'Server Components', 'SSR'], categories: ['前端框架'] },
  // 2020年
  { path: '2020/11/25/ES2020新特性总结', title: 'ES2020新特性总结', date: '2020-11-25', tags: ['ES2020', 'JavaScript', '新特性'], categories: ['JavaScript'] },
  { path: '2020/09/18/前端性能优化实战', title: '前端性能优化实战', date: '2020-09-18', tags: ['性能优化', 'Webpack', '懒加载'], categories: ['工程化'] },
  { path: '2020/07/10/TypeScript入门指南', title: 'TypeScript入门指南', date: '2020-07-10', tags: ['TypeScript', '类型系统', '入门'], categories: ['JavaScript'] },
  { path: '2020/05/20/React Hooks深入理解', title: 'React Hooks深入理解', date: '2020-05-20', tags: ['React', 'Hooks', 'useState', 'useEffect'], categories: ['前端框架'] },
  { path: '2020/03/15/Vue3新特性解析', title: 'Vue3新特性解析', date: '2020-03-15', tags: ['Vue3', 'Composition API', 'Proxy', 'Teleport'], categories: ['前端框架'] },
  // 2019年
  { path: '2019/12/20/防抖节流函数', title: '防抖节流函数', date: '2019-12-20', tags: ['JavaScript', '防抖', '节流'], categories: ['JavaScript'] },
  { path: '2019/11/12/快速修改elementUI样式', title: '快速修改elementUI样式', date: '2019-11-12', tags: ['ElementUI', 'Vue', '样式'], categories: ['前端框架'] },
  { path: '2019/09/08/去哪网坑一', title: '去哪网坑一', date: '2019-09-08', tags: ['工作经验', '踩坑'], categories: ['工作经验'] },
  { path: '2019/07/08/React', title: 'React开发', date: '2019-07-08', tags: ['React', '组件', '状态管理'], categories: ['前端框架'] },
  { path: '2019/07/05/小程序开发遇到的坑', title: '小程序开发遇到的坑', date: '2019-07-05', tags: ['小程序', '微信', '踩坑'], categories: ['移动端开发'] },
  { path: '2019/06/19/webpack4使用说明', title: 'webpack4使用说明', date: '2019-06-19', tags: ['Webpack', '构建工具', '工程化'], categories: ['工程化'] },
  { path: '2019/05/29/mongodb在node中使用总结', title: 'mongodb在node中使用总结', date: '2019-05-29', tags: ['MongoDB', 'Node.js', '数据库'], categories: ['Node.js'] },
  { path: '2019/05/28/JS实现异步请求', title: 'JS实现异步请求4种方法对比', date: '2019-05-28', tags: ['JavaScript', '异步', 'Promise', 'async/await'], categories: ['JavaScript'] },
  { path: '2019/05/26/node复习', title: 'Node.js复习', date: '2019-05-26', tags: ['Node.js', '基础', '复习'], categories: ['Node.js'] },
  { path: '2019/05/18/touch', title: '移动端touch事件总结', date: '2019-05-18', tags: ['移动端', 'touch', '事件'], categories: ['移动端开发'] },
  { path: '2019/05/10/伸缩布局总结', title: '伸缩布局常用属性总结', date: '2019-05-10', tags: ['CSS', 'Flexbox', '布局'], categories: ['CSS'] },
  { path: '2019/05/08/background属性总结', title: 'background属性总结', date: '2019-05-08', tags: ['CSS', 'background', '背景'], categories: ['CSS'] },
  { path: '2019/05/07/FileReader相关方法', title: 'FileReader相关方法', date: '2019-05-07', tags: ['JavaScript', 'FileReader', '文件处理'], categories: ['JavaScript'] },
  { path: '2019/05/06/Apache的安装和配置', title: 'Apache的安装和配置', date: '2019-05-06', tags: ['Apache', '服务器', '配置'], categories: ['服务器'] },
  { path: '2019/04/30/Ajax初体验', title: 'Ajax初体验', date: '2019-04-30', tags: ['JavaScript', 'Ajax', 'HTTP'], categories: ['JavaScript'] },
];

console.log('=== 修复归档、分类、标签页面 ===\n');

// 1. 修复归档页面
console.log('1. 修复归档页面...');
let archivesContent = fs.readFileSync(path.join(__dirname, 'archives/index.html'), 'utf-8');

// 修复路径
archivesContent = archivesContent.replace(/href="\/css\//g, 'href="../css/');
archivesContent = archivesContent.replace(/src="\/js\//g, 'src="../js/');
archivesContent = archivesContent.replace(/href="\/img\//g, 'href="../img/');
archivesContent = archivesContent.replace(/src="\/img\//g, 'src="../img/');
archivesContent = archivesContent.replace(/href="\/plugin\//g, 'href="../plugin/');
archivesContent = archivesContent.replace(/src="\/plugin\//g, 'src="../plugin/');
archivesContent = archivesContent.replace(/href="\/" class="menu-item-home"/g, 'href="../" class="menu-item-home"');
archivesContent = archivesContent.replace(/href="\/archives"/g, 'href="../archives"');
archivesContent = archivesContent.replace(/href="\/categories"/g, 'href="../categories"');
archivesContent = archivesContent.replace(/href="\/tags"/g, 'href="../tags"');
archivesContent = archivesContent.replace(/href="\/about"/g, 'href="../about"');
archivesContent = archivesContent.replace(/href="\/gallery"/g, 'href="../gallery"');
archivesContent = archivesContent.replace(/href="\/atom\.xml"/g, 'href="../atom.xml"');
archivesContent = archivesContent.replace(/data-normal-src="\/img\//g, 'data-normal-src="../img/');
archivesContent = archivesContent.replace(/<a href="\/">/g, '<a href="../">');

// 移除header-date组件
archivesContent = archivesContent.replace(/<!--\s*\n\s*This is only a demo.*?\n\s*-->\s*<style.*?<\/style>\s*<div class="header-date">.*?<\/div>\s*<script.*?<\/script>\s*<script.*?<\/script>/gs, '');

// 更新文章数量和列表
const archiveItems = allArticles.map(article => {
  const dateParts = article.date.split('-');
  const monthDay = `${dateParts[1]}-${dateParts[2]}`;
  return `                <li>
                    <a href="/${article.path}/">
            			<em year="${dateParts[0]}">
                            ${monthDay}
                        </em>
        			    <span itemprop="name">
                            ${article.title}
                        </span>
        			    
                    </a>
                </li>`;
}).join('\n            \n');

archivesContent = archivesContent.replace(/总计 \d+ 篇 文章/, `总计 ${allArticles.length} 篇 文章`);
archivesContent = archivesContent.replace(/<ul>[\s\S]*?<\/ul>\s*<\/div>\s*<div class="clear">/, `<ul>\n            \n${archiveItems}\n            \n        </ul>\n    </div>\n    <div class="clear">`);

fs.writeFileSync(path.join(__dirname, 'archives/index.html'), archivesContent, 'utf-8');
console.log(`  ✓ 归档页面已修复，包含 ${allArticles.length} 篇文章`);

// 2. 修复分类页面
console.log('\n2. 修复分类页面...');
let categoriesContent = fs.readFileSync(path.join(__dirname, 'categories/index.html'), 'utf-8');

// 修复路径
categoriesContent = categoriesContent.replace(/href="\/css\//g, 'href="../css/');
categoriesContent = categoriesContent.replace(/src="\/js\//g, 'src="../js/');
categoriesContent = categoriesContent.replace(/href="\/img\//g, 'href="../img/');
categoriesContent = categoriesContent.replace(/src="\/img\//g, 'src="../img/');
categoriesContent = categoriesContent.replace(/href="\/plugin\//g, 'href="../plugin/');
categoriesContent = categoriesContent.replace(/src="\/plugin\//g, 'src="../plugin/');
categoriesContent = categoriesContent.replace(/href="\/" class="menu-item-home"/g, 'href="../" class="menu-item-home"');
categoriesContent = categoriesContent.replace(/href="\/archives"/g, 'href="../archives"');
categoriesContent = categoriesContent.replace(/href="\/categories"/g, 'href="../categories"');
categoriesContent = categoriesContent.replace(/href="\/tags"/g, 'href="../tags"');
categoriesContent = categoriesContent.replace(/href="\/about"/g, 'href="../about"');
categoriesContent = categoriesContent.replace(/href="\/gallery"/g, 'href="../gallery"');
categoriesContent = categoriesContent.replace(/href="\/atom\.xml"/g, 'href="../atom.xml"');
categoriesContent = categoriesContent.replace(/data-normal-src="\/img\//g, 'data-normal-src="../img/');
categoriesContent = categoriesContent.replace(/<a href="\/">/g, '<a href="../">');

// 移除header-date组件
categoriesContent = categoriesContent.replace(/<!--\s*\n\s*This is only a demo.*?\n\s*-->\s*<style.*?<\/style>\s*<div class="header-date">.*?<\/div>\s*<script.*?<\/script>\s*<script.*?<\/script>/gs, '');

fs.writeFileSync(path.join(__dirname, 'categories/index.html'), categoriesContent, 'utf-8');
console.log('  ✓ 分类页面已修复');

// 3. 修复标签页面
console.log('\n3. 修复标签页面...');
let tagsContent = fs.readFileSync(path.join(__dirname, 'tags/index.html'), 'utf-8');

// 修复路径
tagsContent = tagsContent.replace(/href="\/css\//g, 'href="../css/');
tagsContent = tagsContent.replace(/src="\/js\//g, 'src="../js/');
tagsContent = tagsContent.replace(/href="\/img\//g, 'href="../img/');
tagsContent = tagsContent.replace(/src="\/img\//g, 'src="../img/');
tagsContent = tagsContent.replace(/href="\/plugin\//g, 'href="../plugin/');
tagsContent = tagsContent.replace(/src="\/plugin\//g, 'src="../plugin/');
tagsContent = tagsContent.replace(/href="\/" class="menu-item-home"/g, 'href="../" class="menu-item-home"');
tagsContent = tagsContent.replace(/href="\/archives"/g, 'href="../archives"');
tagsContent = tagsContent.replace(/href="\/categories"/g, 'href="../categories"');
tagsContent = tagsContent.replace(/href="\/tags"/g, 'href="../tags"');
tagsContent = tagsContent.replace(/href="\/about"/g, 'href="../about"');
tagsContent = tagsContent.replace(/href="\/gallery"/g, 'href="../gallery"');
tagsContent = tagsContent.replace(/href="\/atom\.xml"/g, 'href="../atom.xml"');
tagsContent = tagsContent.replace(/data-normal-src="\/img\//g, 'data-normal-src="../img/');
tagsContent = tagsContent.replace(/<a href="\/">/g, '<a href="../">');

// 移除header-date组件
tagsContent = tagsContent.replace(/<!--\s*\n\s*This is only a demo.*?\n\s*-->\s*<style.*?<\/style>\s*<div class="header-date">.*?<\/div>\s*<script.*?<\/script>\s*<script.*?<\/script>/gs, '');

fs.writeFileSync(path.join(__dirname, 'tags/index.html'), tagsContent, 'utf-8');
console.log('  ✓ 标签页面已修复');

console.log('\n=== 修复完成 ===');
