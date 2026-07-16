# React Hooks深入理解

date: 2020-05-20
tags: [React, Hooks, useState, useEffect]
categories: [React]

### 前言

React Hooks是React 16.8引入的新特性，它让函数组件能够使用state和其他React特性，彻底改变了React组件的编写方式。本文将深入探讨React Hooks的核心概念、使用方法和最佳实践。

### useState详解

useState是最基础的Hook，它让函数组件能够拥有自己的状态。useState接收一个初始状态值，返回一个数组，包含当前状态值和更新状态的函数。

```
import React, { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
      <button onClick={() => setCount(prev => prev - 1)}>
        减少
      </button>
    </div>
  )
}

```

需要注意的是，useState的更新函数有两种使用方式：直接传入新值，或传入一个函数来基于前一个状态计算新值。在需要基于前一个状态更新时，应该使用函数式更新，避免状态不一致的问题。

另外，与类组件的setState不同，useState不会自动合并对象。如果状态是对象类型，需要手动进行合并操作：

```
const [state, setState] = useState({ name: '', age: 0 })

// 错误：会丢失name字段
setState({ age: 25 })

// 正确：使用展开运算符合并
setState(prev => ({ ...prev, age: 25 }))

```

### useEffect详解

useEffect用于处理副作用，比如数据获取、订阅、手动修改DOM等。它可以看作是componentDidMount、componentDidUpdate和componentWillUnmount的组合。

```
import React, { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // 副作用逻辑
    let cancelled = false
    
    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data)
      }
    })
    
    // 清理函数
    return () => {
      cancelled = true
    }
  }, [userId]) // 依赖数组
  
  return user ? <div>{user.name}</div> : <div>加载中...</div>
}

```

useEffect的第二个参数是依赖数组，它决定了effect何时重新执行。如果传入空数组，effect只在组件挂载和卸载时执行一次。如果省略这个参数，每次渲染后都会执行effect，这通常不是我们想要的。

清理函数非常重要，它可以防止内存泄漏。当组件卸载或effect重新执行前，React会调用清理函数。在上面的例子中，我们使用cancelled标志来避免在组件卸载后更新状态。

### 自定义Hook

自定义Hook是React Hooks最强大的特性之一，它允许我们将组件逻辑提取到可重用的函数中。自定义Hook的名称必须以use开头，这是React的规则。

```
import { useState, useEffect } from 'react'

// 自定义Hook：获取窗口尺寸
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  return size
}

// 使用自定义Hook
function ResponsiveComponent() {
  const { width, height } = useWindowSize()
  
  return (
    <div>
      <p>窗口宽度: {width}px</p>
      <p>窗口高度: {height}px</p>
    </div>
  )
}

```

自定义Hook可以调用其他Hook，这使得我们可以组合出更复杂的逻辑。比如，我们可以创建一个useFetch Hook来封装数据获取逻辑：

```
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data)
          setLoading(false)
        }
      })
      .catch(error => {
        if (!cancelled) {
          setError(error)
          setLoading(false)
        }
      })
    
    return () => {
      cancelled = true
    }
  }, [url])
  
  return { data, loading, error }
}

```

### Hooks使用规则

React Hooks有两个重要的规则必须遵守：

第一，只能在函数组件的顶层调用Hook，不能在循环、条件语句或嵌套函数中调用。这是因为React依赖Hook的调用顺序来正确关联状态。每次渲染时，Hook的调用顺序必须保持一致。

第二，只能在React函数组件或自定义Hook中调用Hook，不能在普通JavaScript函数中调用。这确保了状态逻辑在组件中是可见的。

### 常见陷阱与解决方案

使用Hooks时常见的一个陷阱是闭包问题。在useEffect中，我们可能会捕获到过时的state值：

```
function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      // 这里count永远是0
      console.log(count)
    }, 1000)
    
    return () => clearInterval(timer)
  }, []) // 空依赖数组
  
  return <div>{count}</div>
}

```

解决方案有两种：一是将count添加到依赖数组中，二是使用函数式更新：

```
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1)
  }, 1000)
  
  return () => clearInterval(timer)
}, [])

```

### 总结

React Hooks为函数组件带来了强大的能力，使得代码更加简洁、逻辑复用更加容易。useState和useEffect是最常用的两个Hook，自定义Hook则提供了强大的逻辑复用能力。理解Hooks的工作原理和使用规则，对于编写高质量的React应用至关重要。虽然Hooks有一些需要注意的陷阱，但只要遵循最佳实践，就能充分发挥其优势。
