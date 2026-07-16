# React18新特性与并发模式

date: 2022-04-12
tags: [React18, 并发模式, Suspense, Transitions]
categories: [React]

### 一、React 18 概述

React 18 是 React 框架自 2020 年发布 React 17 之后，时隔两年推出的全新大版本更新。它于 2022 年 3 月正式发布，带来了诸多令人兴奋的新特性，其中最核心的变化是引入了**并发渲染（Concurrent Rendering）**能力。React 18 并非完全重写，而是在保持向后兼容的基础上，通过底层调度机制的升级，使 React 应用能够获得更流畅的用户体验、更高的性能以及更灵活的状态管理能力。React 18 的更新可以划分为三个主要方向：并发特性、Suspense 增强、以及开发者体验的优化。

### 二、并发模式（Concurrent Mode）

并发模式是 React 18 最核心的底层能力升级。在 React 17 及之前的版本中，React 的渲染过程是**同步且不可中断**的：一旦 React 开始渲染，它会一直执行直到整棵组件树渲染完成，期间不会让出主线程。如果组件树庞大或计算密集，就会导致主线程被长时间占用，页面出现卡顿、掉帧等问题。

React 18 引入了基于 **Fiber 架构**的并发渲染机制。Fiber 将渲染任务拆分为一个个小的工作单元（Fiber Node），每个单元执行完成后，React 可以检查主线程是否有更紧急的任务（如用户输入、动画），如果有，React 会暂停当前渲染，让出主线程，等主线程空闲时再继续渲染。这种"可中断渲染"的能力就是并发模式的核心。

需要注意的是，React 18 的"并发"并非多线程并发，而是**单线程上的任务优先级调度**。React 内部维护了一个优先级队列，高优先级任务（如用户点击）可以打断低优先级任务（如数据列表渲染），从而保证交互的即时响应。

### 三、Suspense 的增强

Suspense 最早在 React 16.6 引入，但最初仅支持 `React.lazy` 进行代码分割。React 18 将 Suspense 提升为一等公民，使其成为处理异步数据加载的标准方式。配合 `useDeferredValue` 和 `startTransition` 等新 API，Suspense 可以在数据请求期间展示优雅的 fallback UI，而不会阻塞整个应用的交互。

以下是一个典型的 Suspense 使用示例：

```
import { Suspense } from 'react';
import UserProfile from './UserProfile';
import Posts from './Posts';

function ProfilePage() {
  return (
    <Suspense fallback={<div>加载用户信息中...</div>}>
      <UserProfile />
      <Suspense fallback={<div>加载文章列表中...</div>}>
        <Posts />
      </Suspense>
    </Suspense>
  );
}
```

在这个例子中，`UserProfile` 和 `Posts` 各自独立加载，即使 `Posts` 数据尚未就绪，`UserProfile` 也可以先渲染出来，实现了**渐进式加载**，大幅提升了用户感知性能。

### 四、Transitions（过渡更新）

React 18 引入了 `useTransition` 和 `startTransition` API，用于区分**紧急更新**和**非紧急更新**。紧急更新是指用户直接交互（如输入框打字、按钮点击），需要立即响应；非紧急更新是指 UI 的过渡效果（如列表过滤、页面切换），可以延迟执行而不影响用户体验。

使用 `useTransition` 的示例如下：

```
import { useTransition, useState } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 紧急更新：立即更新输入框
    setQuery(e.target.value);

    // 非紧急更新：延迟过滤结果
    startTransition(() => {
      setSearchQuery(e.target.value);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <div>正在搜索...</div>}
      <Results query={searchQuery} />
    </div>
  );
}
```

通过 `startTransition`，React 知道 `setSearchQuery` 触发的渲染是低优先级的，可以被用户后续的输入打断。这样即使用户快速输入，也不会因为大量重渲染而卡顿。`isPending` 状态则允许我们展示过渡指示器，提升用户体验。

### 五、自动批处理（Automatic Batching）

在 React 17 及之前，React 仅在自身管理的事件处理函数中进行**状态批处理**。这意味着在 `setTimeout`、`Promise.then`、原生事件处理器中多次调用 `setState`，每次都会触发一次重新渲染，造成不必要的性能损耗。

React 18 引入了**自动批处理**机制，无论状态更新发生在何处，React 都会自动将它们合并为一次渲染。示例如下：

```
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 18: 仅触发一次渲染
  // React 17: 在 setTimeout 中会触发两次渲染
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 18: 同样仅触发一次渲染
}, 1000);
```

自动批处理是一个"免费"的性能优化，开发者无需修改现有代码即可享受收益。如果某些场景确实需要立即同步渲染，可以使用 `ReactDOM.flushSync()` 显式退出批处理。

### 六、新的 Root API 与 Strict Mode 变更

React 18 引入了新的 `createRoot` API 来替代旧的 `ReactDOM.render`。新 API 是启用并发特性的前提：

```
// React 17
ReactDOM.render(<App />, document.getElementById('root'));

// React 18
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

此外，React 18 的 Strict Mode 在开发环境下会**双重调用**组件的挂载、卸载和状态更新函数，以检测副作用是否正确清理。这有助于开发者提前发现内存泄漏、重复请求等问题，为并发模式下的组件行为提供保障。

### 七、总结与展望

React 18 是一次承前启后的重要更新。并发模式为 React 应用带来了更流畅的交互体验，Suspense 的增强让异步数据加载变得优雅，Transitions 提供了精细化的优先级控制，自动批处理则带来了开箱即用的性能提升。对于前端工程师而言，深入理解这些新特性的原理和使用场景，不仅有助于构建高性能应用，也是面试中展示技术深度的重要加分项。未来，随着 React Server Components 等特性的成熟，React 的性能上限还将进一步提升。
