# Next.js全栈开发指南

date: 2021-12-25
tags: [Next.js, SSR, SSG, API Routes]
categories: [React]

### 一、Next.js框架概述与核心优势

Next.js是Vercel团队开发的基于React的全栈Web框架，它提供了开箱即用的服务端渲染（SSR）、静态站点生成（SSG）、API路由、自动代码分割、图片优化等核心能力。相比纯客户端渲染的SPA应用，Next.js最大的优势在于能够显著提升首屏加载速度和SEO友好性；相比传统的SSR方案（如自行搭建Express+React），Next.js提供了约定优于配置的开发体验，开发者无需手动处理路由匹配、数据预取、代码分割等复杂逻辑。

Next.js的核心设计理念包括：零配置启动，基于文件系统的自动路由；混合渲染模式，每个页面可以独立选择SSR、SSG或CSR；内置API路由，无需额外的后端服务即可实现全栈开发；增量静态再生成（ISR），允许在运行时按需更新静态页面。这些特性使得Next.js成为构建现代Web应用的理想选择，尤其适合电商、内容平台、SaaS产品等对SEO和性能有较高要求的场景。

### 二、SSR与SSG：渲染策略深度解析

Next.js提供了三种主要的渲染策略：客户端渲染（CSR）、服务端渲染（SSR）和静态站点生成（SSG）。CSR模式下，页面在客户端通过JavaScript动态渲染，适用于交互密集、数据实时性要求高的页面；SSR模式下，每次请求都由服务端渲染页面HTML，适用于数据频繁变化、需要实时性的页面；SSG模式下，页面在构建时生成静态HTML，适用于内容相对固定的页面，如博客文章、产品文档等。

```
// SSG: 构建时生成静态页面
// pages/posts/[id].js
export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// 构建时获取所有文章ID，生成对应的静态页面
export async function getStaticPaths() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json());

  const paths = posts.map(post => ({
    params: { id: post.id.toString() },
  }));

  return { paths, fallback: 'blocking' };
}

// 构建时获取每篇文章的数据
export async function getStaticProps({ params }) {
  const post = await fetch(
    `https://api.example.com/posts/${params.id}`
  ).then(res => res.json());

  return {
    props: { post },
    // 每60秒后，下次请求时重新生成页面（ISR）
    revalidate: 60,
  };
}
```

```
// SSR: 每次请求时服务端渲染
// pages/dashboard.js
export default function Dashboard({ userData }) {
  return (
    <div>
      <h1>欢迎, {userData.name}</h1>
      <p>今日待办: {userData.todoCount} 项</p>
    </div>
  );
}

// 每次请求时都会执行，获取最新数据
export async function getServerSideProps({ req, res }) {
  // 从请求中获取用户认证信息
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  const userData = await fetch('https://api.example.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.json());

  return {
    props: { userData },
  };
}
```

ISR（Incremental Static Regeneration）是Next.js 9.5引入的重要特性，它结合了SSG和SSR的优点。通过设置revalidate参数，可以在指定时间间隔后，在下次请求时触发页面的重新生成。新生成的页面会替换旧的静态页面，用户无需等待，始终获得快速的响应。这种策略特别适合商品列表、新闻首页等数据定期更新但又需要高性能的场景。

### 三、API Routes：全栈开发的核心能力

API Routes是Next.js内置的后端能力，允许开发者在pages/api目录下创建API端点。这些API端点运行在服务端，可以直接访问数据库、调用第三方服务、处理文件上传等操作，无需搭建独立的后端服务。API Routes支持RESTful风格的路由定义，并且可以访问请求对象（req）和响应对象（res），实现灵活的请求处理逻辑。

```
// pages/api/articles.js - 文章列表API
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { db } = await connectToDatabase();
        const { page = 1, pageSize = 10, category } = req.query;

        const filter = category ? { category } : {};
        const articles = await db.collection('articles')
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(parseInt(pageSize))
          .toArray();

        const total = await db.collection('articles')
          .countDocuments(filter);

        res.status(200).json({
          data: articles,
          pagination: {
            page: parseInt(page),
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        });
      } catch (error) {
        res.status(500).json({ error: '获取文章列表失败' });
      }
      break;

    case 'POST':
      try {
        const { db } = await connectToDatabase();
        const { title, content, category, tags } = req.body;

        // 参数校验
        if (!title || !content) {
          return res.status(400).json({ error: '标题和内容不能为空' });
        }

        const result = await db.collection('articles').insertOne({
          title,
          content,
          category,
          tags: tags || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        res.status(201).json({
          data: { id: result.insertedId, title, content },
        });
      } catch (error) {
        res.status(500).json({ error: '创建文章失败' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `不支持 ${method} 方法` });
  }
}
```

API Routes还支持中间件机制，可以通过自定义封装实现认证鉴权、请求日志、参数校验等通用逻辑。在实际项目中，建议将数据库连接、认证逻辑等抽取到独立的工具模块中，保持API路由文件的简洁和可维护性。

### 四、数据获取方案对比与最佳实践

Next.js提供了多种数据获取方案，适用于不同的场景。在服务端，getStaticProps用于构建时获取数据（SSG），getServerSideProps用于请求时获取数据（SSR）。在客户端，可以使用SWR或React Query等数据请求库来实现数据的缓存、重试和实时更新。

```
// 客户端数据获取 - 使用SWR
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => res.json());

function ArticleList() {
  const { data, error, isValidating, mutate } = useSWR(
    '/api/articles?page=1',
    fetcher,
    {
      revalidateOnFocus: true,   // 窗口获焦时重新验证
      revalidateOnReconnect: true, // 网络恢复时重新验证
      refreshInterval: 30000,     // 每30秒自动刷新
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return; // 最多重试3次
        setTimeout(() => revalidate(), 5000); // 5秒后重试
      },
    }
  );

  if (error) return <div>加载失败，请稍后重试</div>;
  if (!data) return <div>加载中...</div>;

  return (
    <ul>
      {data.data.map(article => (
        <li key={article._id}>
          <h3>{article.title}</h3>
          <p>{article.content.substring(0, 100)}...</p>
        </li>
      ))}
    </ul>
  );
}
```

在实际项目中，推荐采用混合数据获取策略：对于SEO敏感且内容相对固定的页面（如文章详情、产品介绍），使用getStaticProps配合ISR实现高性能的静态渲染；对于需要实时数据的页面（如用户中心、仪表盘），使用getServerSideProps在服务端获取数据；对于交互过程中需要动态加载的数据（如无限滚动列表、搜索建议），使用SWR在客户端获取。

### 五、项目架构与工程化实践

一个生产级别的Next.js项目需要合理的目录结构和工程化配置。推荐的目录结构包括：pages目录存放页面和API路由，components目录存放可复用组件，lib目录存放工具函数和第三方服务封装，styles目录存放全局样式，hooks目录存放自定义Hook，types目录存放TypeScript类型定义。

```
// next.config.js - 项目配置
const withImages = require('next-images');

module.exports = withImages({
  // 启用React严格模式
  reactStrictMode: true,

  // 图片域名白名单
  images: {
    domains: ['cdn.example.com', 'images.example.com'],
  },

  // Webpack自定义配置
  webpack: (config, { dev, isServer }) => {
    // 生产环境移除console
    if (!dev && !isServer) {
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: { drop_console: true },
          },
        })
      );
    }
    return config;
  },

  // 自定义HTTP头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // 重定向规则
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
});
```

部署方面，Next.js支持多种部署方式：Vercel平台提供了一键部署和全球CDN加速，是最便捷的选择；Docker容器化部署适合需要自定义运行环境的场景；Node.js服务器部署适合已有基础设施的团队。无论哪种部署方式，都应该配置好环境变量管理、日志收集和性能监控，确保应用的稳定运行。

### 六、总结与展望

Next.js作为React生态中最成熟的全栈框架，通过SSR/SSG/ISR的混合渲染策略、内置的API Routes、强大的数据获取能力和完善的工程化支持，为开发者提供了一套完整的全栈开发解决方案。在实际项目中，合理选择渲染策略、规范项目架构、重视性能优化和安全防护，是构建高质量Next.js应用的关键。随着React Server Components等新特性的不断融入，Next.js将继续引领前端全栈开发的技术方向，值得每一位前端开发者深入学习和实践。
