#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 所有文章数据
const allArticles = [
  // 2026年
  { path: '2026/07/14/WebAssembly进阶：高性能计算场景实战', title: 'WebAssembly进阶：高性能计算场景实战', date: '2026-07-14' },
  // 2025年
  { path: '2025/08/20/大模型时代的前端工程化', title: '大模型时代的前端工程化', date: '2025-08-20' },
  { path: '2025/03/10/AI驱动的组件生成与智能UI', title: 'AI驱动的组件生成与智能UI', date: '2025-03-10' },
  { path: '2025/03/15/AI Agent前端开发实战', title: 'AI Agent前端开发实战', date: '2025-03-15' },
  // 2024年
  { path: '2024/09/20/前端架构演进之路', title: '前端架构演进之路', date: '2024-09-20' },
  { path: '2024/03/15/AI辅助前端开发实践', title: 'AI辅助前端开发实践', date: '2024-03-15' },
  // 2023年
  { path: '2023/06/10/React19新特性前瞻', title: 'React19新特性前瞻', date: '2023-06-10' },
  // 2022年
  { path: '2022/11/15/前端工程化之CI-CD实践', title: '前端工程化之CI/CD实践', date: '2022-11-15' },
  { path: '2022/08/20/Vue3组合式API最佳实践', title: 'Vue3组合式API最佳实践', date: '2022-08-20' },
  { path: '2022/08/15/前端工程化之Webpack5深度配置', title: '前端工程化之Webpack5深度配置', date: '2022-08-15' },
  { path: '2022/04/12/React18新特性与并发模式', title: 'React18新特性与并发模式', date: '2022-04-12' },
  // 2021年
  { path: '2021/12/25/Next.js全栈开发指南', title: 'Next.js全栈开发指南', date: '2021-12-25' },
  { path: '2021/11/08/前端监控体系搭建', title: '前端监控体系搭建', date: '2021-11-08' },
  { path: '2021/09/20/微前端架构设计与实践', title: '微前端架构设计与实践', date: '2021-09-20' },
  { path: '2021/08/15/React状态管理方案对比', title: 'React状态管理方案对比', date: '2021-08-15' },
  { path: '2021/06/28/Vite源码解析与原理分析', title: 'Vite源码解析与原理分析', date: '2021-06-28' },
  { path: '2021/05/20/React Hooks深入理解', title: 'React Hooks深入理解', date: '2021-05-20' },
  { path: '2021/05/10/前端工程化之Monorepo实践', title: '前端工程化之Monorepo实践', date: '2021-05-10' },
  { path: '2021/03/22/Vue3+TypeScript项目实战', title: 'Vue3+TypeScript项目实战', date: '2021-03-22' },
  { path: '2021/01/18/React Server Components详解', title: 'React Server Components详解', date: '2021-01-18' },
  // 2020年
  { path: '2020/11/25/ES2020新特性总结', title: 'ES2020新特性总结', date: '2020-11-25' },
  { path: '2020/09/18/前端性能优化实战', title: '前端性能优化实战', date: '2020-09-18' },
  { path: '2020/07/10/TypeScript入门指南', title: 'TypeScript入门指南', date: '2020-07-10' },
  { path: '2020/05/20/React Hooks深入理解', title: 'React Hooks深入理解', date: '2020-05-20' },
  { path: '2020/03/15/Vue3新特性解析', title: 'Vue3新特性解析', date: '2020-03-15' },
  // 2019年
  { path: '2019/12/20/防抖节流函数', title: '防抖节流函数', date: '2019-12-20' },
  { path: '2019/11/12/快速修改elementUI样式', title: '快速修改elementUI样式', date: '2019-11-12' },
  { path: '2019/09/08/去哪网坑一', title: '去哪网坑一', date: '2019-09-08' },
  { path: '2019/07/08/React', title: 'React开发', date: '2019-07-08' },
  { path: '2019/07/05/小程序开发遇到的坑', title: '小程序开发遇到的坑', date: '2019-07-05' },
  { path: '2019/06/19/webpack4使用说明', title: 'webpack4使用说明', date: '2019-06-19' },
  { path: '2019/05/29/mongodb在node中使用总结', title: 'mongodb在node中使用总结', date: '2019-05-29' },
  { path: '2019/05/28/JS实现异步请求', title: 'JS实现异步请求4种方法对比', date: '2019-05-28' },
  { path: '2019/05/26/node复习', title: 'Node.js复习', date: '2019-05-26' },
  { path: '2019/05/18/touch', title: '移动端touch事件总结', date: '2019-05-18' },
  { path: '2019/05/10/伸缩布局总结', title: '伸缩布局常用属性总结', date: '2019-05-10' },
  { path: '2019/05/08/background属性总结', title: 'background属性总结', date: '2019-05-08' },
  { path: '2019/05/07/FileReader相关方法', title: 'FileReader相关方法', date: '2019-05-07' },
  { path: '2019/05/06/Apache的安装和配置', title: 'Apache的安装和配置', date: '2019-05-06' },
  { path: '2019/04/30/Ajax初体验', title: 'Ajax初体验', date: '2019-04-30' },
];

console.log('=== 修复归档页面 ===\n');

// 生成文章列表HTML
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

// 读取原始文件
let content = fs.readFileSync(path.join(__dirname, 'archives/index.html'), 'utf-8');

// 替换文章总数
content = content.replace(/总计 \d+ 篇 文章/, `总计 ${allArticles.length} 篇 文章`);

// 替换文章列表 - 使用更精确的匹配
const listStartPattern = /<ul>\s*\n\s*<li>\s*\n\s*<a href="\/2019\/12\/20\/防抖节流函数\/">/;
const listEndPattern = /<\/ul>\s*<\/div>\s*<!-- Archive by month/;

if (listStartPattern.test(content)) {
  // 找到列表开始和结束位置
  const startMatch = content.match(listStartPattern);
  const startIndex = content.indexOf(startMatch[0]);
  
  const endMatch = content.match(listEndPattern);
  const endIndex = content.indexOf(endMatch[0]);
  
  if (startIndex !== -1 && endIndex !== -1) {
    // 替换整个列表
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    content = before + `<ul>\n            \n${archiveItems}\n            \n        </ul>\n    </div>\n\n     <!-- Archive by month` + after.substring(after.indexOf('<!-- Archive by month') + '<!-- Archive by month'.length);
  }
}

fs.writeFileSync(path.join(__dirname, 'archives/index.html'), content, 'utf-8');
console.log(`✓ 归档页面已修复，包含 ${allArticles.length} 篇文章`);
