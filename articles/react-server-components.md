# React Server Components详解

date: 2021-01-18
tags: [React, Server Components, SSR, RSC]
categories: [React]

### 一、什么是React Server Components

React Server Components（简称RSC）是React团队在2020年底提出的一种全新的组件渲染模式。它允许我们在服务端渲染React组件，并将渲染结果以流式的方式发送到客户端。与传统的SSR不同，RSC并不是简单地将HTML字符串发送到客户端，而是发送一种特殊的序列化格式，客户端可以在不重新执行组件代码的情况下恢复组件树。

RSC的核心思想是将组件分为两类：Server Components和Client Components。Server Components只在服务端执行，不会发送到客户端，因此不会增加客户端的JavaScript bundle大小。Client Components则会在客户端执行，包含交互逻辑和状态管理。

### 二、RSC的工作原理

RSC的工作原理可以分为以下几个步骤：首先，服务端会执行Server Components，生成一个特殊的序列化描述（称为"Flight"格式）。这个描述包含了组件的渲染结果，但不包含组件的代码本身。然后，这个描述会以流式的方式发送到客户端。客户端接收到描述后，会根据描述恢复组件树，并与Client Components进行合并。最后，客户端会对Client Components进行水合（hydration），使其具备交互能力。

RSC的关键在于它使用了React的Suspense和lazy机制来实现流式渲染。当客户端在等待某个Server Component的数据时，可以先渲染其他部分，等数据到达后再填充对应的区域。这种方式可以显著提升首屏加载性能。

### 三、RSC与SSR的对比

RSC与传统的SSR有着本质的区别。首先，SSR是在服务端将组件渲染为HTML字符串，然后发送到客户端进行水合。这意味着客户端需要下载完整的JavaScript bundle才能进行水合。而RSC发送的是一种轻量级的序列化描述，客户端不需要重新执行Server Components的代码。

其次，SSR的组件在服务端和客户端都会执行，这可能导致一些副作用被重复执行。而RSC的Server Components只在服务端执行，客户端永远不会执行这些组件的代码，因此避免了副作用重复执行的问题。

最后，SSR的bundle大小与组件数量成正比，而RSC的Server Components不会增加客户端的bundle大小，只有Client Components才会被打包到客户端。

### 四、Server Components与Client Components的使用场景

Server Components适用于那些不需要交互、只负责展示数据的组件。例如，文章列表、商品详情、用户信息等展示型组件都可以使用Server Components。这些组件可以直接在服务端访问数据库或调用API，无需通过客户端发起网络请求。

```
// Server Component示例
async function ArticleList() {
  const articles = await db.query('SELECT * FROM articles');
  return (
    <ul>
      {articles.map(article => (
        <li key={article.id}>{article.title}</li>
      ))}
    </ul>
  );
}
```

Client Components适用于需要交互、状态管理或访问浏览器API的组件。例如，表单、按钮、轮播图等需要用户交互的组件都应该使用Client Components。

```
// Client Component示例
'use client';
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 五、RSC的优势与局限性

RSC的主要优势包括：减少客户端bundle大小，因为Server Components的代码不会发送到客户端；提升首屏加载性能，因为可以直接在服务端获取数据并渲染；简化数据获取逻辑，因为Server Components可以直接访问后端资源。

RSC的局限性包括：Server Components不能使用useState、useEffect等Hook，也不能访问浏览器API；Server Components之间不能直接传递事件处理函数；目前RSC的支持还不够完善，需要配合Next.js 13+等框架使用。

### 六、总结

React Server Components是React生态中的一次重大革新，它重新定义了服务端渲染的方式。通过合理划分Server Components和Client Components，我们可以构建出性能更优、代码更简洁的React应用。虽然RSC目前还处于发展阶段，但它代表了React未来的发展方向，值得每一位前端开发者深入学习和关注。
