const fs = require('fs');
const path = require('path');

// Article list
const articles = [
  { path: '2020/03/15/Vue3新特性解析/index.html', filename: 'vue3-features.md' },
  { path: '2020/05/20/React-Hooks深入理解/index.html', filename: 'react-hooks.md' },
  { path: '2020/07/10/TypeScript入门指南/index.html', filename: 'typescript-guide.md' },
  { path: '2020/09/18/前端性能优化实战/index.html', filename: 'frontend-performance.md' },
  { path: '2020/11/25/ES2020新特性总结/index.html', filename: 'es2020-features.md' },
  { path: '2021/01/18/React-Server-Components详解/index.html', filename: 'react-server-components.md' },
  { path: '2021/03/22/Vue3+TypeScript项目实战/index.html', filename: 'vue3-typescript.md' },
  { path: '2021/05/10/前端工程化之Monorepo实践/index.html', filename: 'monorepo-practice.md' },
  { path: '2021/06/28/Vite源码解析与原理分析/index.html', filename: 'vite-source.md' },
  { path: '2021/08/15/React状态管理方案对比/index.html', filename: 'react-state-management.md' },
  { path: '2021/09/20/微前端架构设计与实践/index.html', filename: 'micro-frontend.md' },
  { path: '2021/11/08/前端监控体系搭建/index.html', filename: 'frontend-monitoring.md' },
  { path: '2021/12/25/Next.js全栈开发指南/index.html', filename: 'nextjs-guide.md' },
  { path: '2022/04/12/React18新特性与并发模式/index.html', filename: 'react18-features.md' },
  { path: '2022/08/20/Vue3组合式API最佳实践/index.html', filename: 'vue3-composition-api.md' },
  { path: '2022/11/15/前端工程化之CI-CD实践/index.html', filename: 'cicd-practice.md' },
  { path: '2023/06/10/React19新特性前瞻/index.html', filename: 'react19-features.md' },
  { path: '2024/03/15/AI辅助前端开发实践/index.html', filename: 'ai-frontend-dev.md' },
  { path: '2024/09/20/前端架构演进之路/index.html', filename: 'frontend-architecture.md' }
];

// HTML to Markdown converter
function htmlToMarkdown(html) {
  let md = html;
  
  // Handle code blocks first (preserve them)
  const codeBlocks = [];
  md = md.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
    const index = codeBlocks.length;
    codeBlocks.push(code);
    return `__CODE_BLOCK_${index}__`;
  });
  
  // Convert headings
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n');
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n');
  
  // Convert paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n');
  
  // Convert lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n');
  
  // Convert bold
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
  
  // Convert italic
  md = md.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
  
  // Convert inline code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/g, '`$1`');
  
  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');
  
  // Convert images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, '![]($1)');
  
  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');
  
  // Restore code blocks
  md = md.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    const code = codeBlocks[parseInt(index)];
    // Decode entities in code
    const decodedCode = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return '```\n' + decodedCode + '\n```\n';
  });
  
  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();
  
  return md;
}

// Extract content from HTML
function extractContent(html) {
  const match = html.match(/<div class="post-content-article">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
  return match ? match[1] : '';
}

// Extract title from HTML
function extractTitle(html) {
  const match = html.match(/<h2 class="post-title-article">(.*?)<\/h2>/);
  return match ? match[1] : '';
}

// Extract date from HTML
function extractDate(html) {
  const match = html.match(/发布日期: (\d{4})年(\d{2})月(\d{2})日/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return '';
}

// Generate tags based on filename
function generateTags(filename) {
  const tagMap = {
    'vue3-features.md': ['Vue3', 'Composition API', 'Proxy', 'Teleport'],
    'react-hooks.md': ['React', 'Hooks', 'useState', 'useEffect'],
    'typescript-guide.md': ['TypeScript', '类型系统', '接口', '泛型'],
    'frontend-performance.md': ['性能优化', '懒加载', '代码分割', '缓存'],
    'es2020-features.md': ['ES2020', 'JavaScript', '可选链', '空值合并'],
    'react-server-components.md': ['React', 'Server Components', 'SSR', 'RSC'],
    'vue3-typescript.md': ['Vue3', 'TypeScript', 'Pinia', 'Vite'],
    'monorepo-practice.md': ['Monorepo', 'pnpm', 'Turborepo', '工程化'],
    'vite-source.md': ['Vite', '构建工具', 'ESM', 'HMR'],
    'react-state-management.md': ['React', 'Redux', 'MobX', 'Zustand', 'Jotai'],
    'micro-frontend.md': ['微前端', 'qiankun', 'Module Federation'],
    'frontend-monitoring.md': ['监控', '性能', '错误追踪', 'Web Vitals'],
    'nextjs-guide.md': ['Next.js', 'SSR', 'SSG', 'API Routes'],
    'react18-features.md': ['React18', '并发模式', 'Suspense', 'Transitions'],
    'vue3-composition-api.md': ['Vue3', 'Composition API', 'Pinia', 'Composables'],
    'cicd-practice.md': ['CI/CD', 'GitHub Actions', '自动化部署', '工程化'],
    'react19-features.md': ['React19', 'Compiler', 'Server Actions', 'Hooks'],
    'ai-frontend-dev.md': ['AI', 'Copilot', 'Cursor', 'Prompt Engineering'],
    'frontend-architecture.md': ['架构', 'MVC', 'MVVM', '微前端', 'Islands']
  };
  return tagMap[filename] || ['前端开发'];
}

// Generate category based on filename
function generateCategory(filename) {
  const categoryMap = {
    'vue3-features.md': 'Vue',
    'react-hooks.md': 'React',
    'typescript-guide.md': 'TypeScript',
    'frontend-performance.md': '性能优化',
    'es2020-features.md': 'JavaScript',
    'react-server-components.md': 'React',
    'vue3-typescript.md': 'Vue',
    'monorepo-practice.md': '工程化',
    'vite-source.md': '构建工具',
    'react-state-management.md': 'React',
    'micro-frontend.md': '架构',
    'frontend-monitoring.md': '监控',
    'nextjs-guide.md': 'React',
    'react18-features.md': 'React',
    'vue3-composition-api.md': 'Vue',
    'cicd-practice.md': '工程化',
    'react19-features.md': 'React',
    'ai-frontend-dev.md': 'AI',
    'frontend-architecture.md': '架构'
  };
  return categoryMap[filename] || '前端开发';
}

// Process each article
articles.forEach(article => {
  const htmlPath = path.join(__dirname, article.path);
  const mdPath = path.join(__dirname, 'articles', article.filename);
  
  try {
    // Read HTML file
    const html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Extract metadata
    const title = extractTitle(html);
    const date = extractDate(html);
    const tags = generateTags(article.filename);
    const category = generateCategory(article.filename);
    
    // Extract content
    const contentHtml = extractContent(html);
    const contentMd = htmlToMarkdown(contentHtml);
    
    // Generate markdown
    const markdown = `# ${title}

date: ${date}
tags: [${tags.join(', ')}]
categories: [${category}]

${contentMd}
`;
    
    // Write markdown file
    fs.writeFileSync(mdPath, markdown, 'utf-8');
    console.log(`✓ Converted: ${article.path} -> ${article.filename}`);
  } catch (error) {
    console.error(`✗ Error converting ${article.path}:`, error.message);
  }
});

console.log('\nConversion completed!');
