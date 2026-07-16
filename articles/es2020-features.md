# ES2020新特性总结

date: 2020-11-25
tags: [ES2020, JavaScript, 可选链, 空值合并]
categories: [JavaScript]

### 前言

ES2020（ES11）是JavaScript语言的最新版本，带来了许多实用的新特性。本文将总结ES2020的主要新特性，包括可选链操作符、空值合并操作符、Promise.allSettled、动态导入等，帮助开发者快速掌握这些新特性。

### 可选链操作符（Optional Chaining）

可选链操作符（?.）允许我们安全地访问嵌套对象的属性，而不用担心中间属性是否存在。如果某个属性为null或undefined，表达式会短路并返回undefined。

```
// 传统方式
const street = user && user.address && user.address.street

// 使用可选链
const street = user?.address?.street

// 访问数组元素
const firstItem = arr?.[0]

// 调用函数
const result = someFunction?.()

// 实际应用
function getUserName(user) {
  return user?.profile?.name || '匿名用户'
}

const user = {
  profile: {
    name: '张三'
  }
}

console.log(getUserName(user)) // '张三'
console.log(getUserName({})) // '匿名用户'
console.log(getUserName(null)) // '匿名用户'

```

可选链操作符大大简化了嵌套属性的访问，避免了大量的if判断和逻辑与操作符。它只在属性不存在时返回undefined，不会抛出错误。

### 空值合并操作符（Nullish Coalescing）

空值合并操作符（??）用于提供默认值。与逻辑或操作符（||）不同，它只在左侧值为null或undefined时才返回右侧的值，而不是在左侧为假值时。

```
// 逻辑或的问题
const count = 0
const result1 = count || 10
console.log(result1) // 10（0被当作假值）

// 空值合并操作符
const result2 = count ?? 10
console.log(result2) // 0（0不是null或undefined）

// 更多示例
const emptyString = ''
console.log(emptyString || 'default') // 'default'
console.log(emptyString ?? 'default') // ''

const falseValue = false
console.log(falseValue || true) // true
console.log(falseValue ?? true) // false

// 实际应用
function createUser(config) {
  return {
    name: config.name ?? '匿名用户',
    age: config.age ?? 18,
    role: config.role ?? 'user'
  }
}

const user = createUser({ name: '李四', age: 0 })
console.log(user) // { name: '李四', age: 0, role: 'user' }

```

空值合并操作符在处理数值、布尔值等可能为假值但有效的数据时非常有用，避免了逻辑或操作符的陷阱。

### Promise.allSettled

Promise.allSettled返回一个Promise，该Promise在所有给定的Promise都已fulfilled或rejected后resolve，并返回一个数组，包含每个Promise的状态和结果。

```
const promise1 = Promise.resolve('成功1')
const promise2 = Promise.reject('失败2')
const promise3 = Promise.resolve('成功3')

Promise.allSettled([promise1, promise2, promise3])
  .then(results => {
    results.forEach(result => {
      console.log(result.status) // 'fulfilled' 或 'rejected'
      if (result.status === 'fulfilled') {
        console.log('值:', result.value)
      } else {
        console.log('原因:', result.reason)
      }
    })
  })

// 输出：
// status: 'fulfilled', 值: '成功1'
// status: 'rejected', 原因: '失败2'
// status: 'fulfilled', 值: '成功3'

// 与Promise.all的区别
// Promise.all在任何一个Promise rejected时就会reject
// Promise.allSettled会等待所有Promise完成，无论成功还是失败

// 实际应用场景：批量请求，需要知道每个请求的结果
async function fetchMultipleUsers(userIds) {
  const promises = userIds.map(id => 
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .catch(error => ({ error: error.message }))
  )
  
  const results = await Promise.allSettled(promises)
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason)
  
  return { successful, failed }
}

```

Promise.allSettled在某些场景下比Promise.all更合适，特别是当我们不关心某个Promise是否失败，而是想知道所有Promise的最终状态时。

### 动态导入（Dynamic Import）

动态导入使用import()函数，可以在运行时动态加载模块。这返回一个Promise，使得我们可以按需加载代码。

```
// 静态导入（编译时确定）
import { someFunction } from './module.js'

// 动态导入（运行时确定）
button.addEventListener('click', async () => {
  const module = await import('./module.js')
  module.someFunction()
})

// 条件导入
async function loadModule(moduleName) {
  if (moduleName === 'chart') {
    return await import('./chart.js')
  } else if (moduleName === 'table') {
    return await import('./table.js')
  }
}

// 路由级别的代码分割
const routes = {
  '/home': () => import('./pages/Home.js'),
  '/about': () => import('./pages/About.js'),
  '/contact': () => import('./pages/Contact.js')
}

async function navigate(path) {
  const pageModule = await routes[path]()
  pageModule.render()
}

// 配合Webpack使用
// Webpack会自动进行代码分割，生成独立的chunk文件

```

动态导入是实现代码分割和懒加载的重要手段，可以显著减少初始加载时间，提升应用性能。

### BigInt

BigInt是一种新的数据类型，用于表示任意精度的整数。它可以表示超过Number.MAX_SAFE_INTEGER（2^53 - 1）的整数。

```
// 创建BigInt
const bigInt1 = 1234567890123456789012345678901234567890n
const bigInt2 = BigInt('1234567890123456789012345678901234567890')
const bigInt3 = BigInt(123) // 不推荐

// BigInt运算
const sum = bigInt1 + 1n
const product = bigInt1 * 2n
const division = bigInt1 / 2n

// 注意事项
// BigInt和Number不能直接混合运算
// const invalid = bigInt1 + 1 // TypeError

// 需要转换
const num = 10
const bigNum = BigInt(num)
const result = bigInt1 + bigNum

// 比较可以混合使用
console.log(10n == 10) // true
console.log(10n === 10) // false（类型不同）

// 实际应用场景：处理大整数ID、加密算法等
const largeId = 9007199254740992n
console.log(largeId + 1n) // 9007199254740993n

```

### globalThis

globalThis提供了一个标准的方式来访问全局对象，无论在什么环境中（浏览器、Node.js、Web Worker等）。

```
// 不同环境的全局对象
// 浏览器：window
// Node.js：global
// Web Worker：self

// 以前需要判断环境
let globalObject
if (typeof window !== 'undefined') {
  globalObject = window
} else if (typeof global !== 'undefined') {
  globalObject = global
} else if (typeof self !== 'undefined') {
  globalObject = self
}

// 现在可以直接使用globalThis
console.log(globalThis === window) // 浏览器中为true
console.log(globalThis === global) // Node.js中为true

// 实际应用
globalThis.myGlobalVar = 'value'

//  polyfill示例
if (!globalThis.someFeature) {
  globalThis.someFeature = function() {
    // 实现
  }
}

```

### String.prototype.matchAll

matchAll方法返回一个包含所有匹配正则表达式的结果的迭代器。

```
const str = 'test1test2test3'
const regex = /t(e)(st(\d?))/g

// 使用matchAll
const matches = str.matchAll(regex)

for (const match of matches) {
  console.log(match)
  // match[0] 完整匹配
  // match[1] 第一个捕获组
  // match[2] 第二个捕获组
  // match.index 匹配位置
}

// 转换为数组
const matchesArray = [...str.matchAll(regex)]
console.log(matchesArray.length) // 3

// 实际应用：提取所有匹配项
const text = '价格：100元，折扣：20元，最终价格：80元'
const priceRegex = /(\d+)元/g
const prices = [...text.matchAll(priceRegex)].map(match => match[1])
console.log(prices) // ['100', '20', '80']

```

### 总结

ES2020带来了许多实用的新特性。可选链和空值合并操作符简化了代码，减少了常见的错误；Promise.allSettled提供了更灵活的Promise处理方式；动态导入使得代码分割和懒加载更加容易；BigInt解决了大整数处理的问题；globalThis统一了全局对象的访问方式；matchAll简化了正则匹配的处理。这些新特性使得JavaScript更加强大和易用。建议开发者在实际项目中逐步采用这些新特性，提升代码质量和开发效率。
