# React Hooks最佳实践总结

date: 2026-07-10
tags: [React, Hooks, 前端]
categories: [前端框架]

## 前言

React Hooks是React 16.8引入的新特性，它让函数组件也能拥有状态和生命周期。本文将总结在实际项目中使用Hooks的最佳实践。

## useState的使用技巧

### 基础用法

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
```

### 对象状态管理

```javascript
const [state, setState] = useState({
  name: '',
  age: 0,
  email: ''
});

// 更新单个字段
setState(prev => ({
  ...prev,
  name: '新名字'
}));
```

## useEffect的正确使用

### 依赖数组的重要性

```javascript
useEffect(() => {
  // 副作用逻辑
  console.log('组件挂载或依赖变化时执行');
  
  return () => {
    // 清理函数
    console.log('组件卸载或依赖变化前执行');
  };
}, [dependency1, dependency2]); // 依赖数组
```

### 常见陷阱

```javascript
// ❌ 错误：缺少依赖
useEffect(() => {
  fetchData(userId); // userId未加入依赖
}, []);

// ✅ 正确：包含所有依赖
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

## 自定义Hooks

### 提取通用逻辑

```javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// 使用
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

## 性能优化

### useMemo和useCallback

```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## 总结

React Hooks让代码更简洁、更易复用。掌握这些最佳实践，能让你的React应用更加健壮和高效。
