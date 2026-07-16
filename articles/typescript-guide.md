# TypeScript入门指南

date: 2020-07-10
tags: [TypeScript, 类型系统, 接口, 泛型]
categories: [TypeScript]

### 前言

TypeScript是JavaScript的超集，由微软开发。它在JavaScript的基础上添加了类型系统，使得代码更加健壮、可维护。本文将介绍TypeScript的核心概念，包括类型系统、接口、泛型等，帮助开发者快速入门TypeScript。

### 为什么使用TypeScript

TypeScript的主要优势包括：静态类型检查可以在编译时发现错误，而不是在运行时；更好的IDE支持，提供智能提示、重构等功能；类型本身就是一种文档，提高代码的可读性；更好的团队协作，减少沟通成本。

虽然TypeScript需要编译，增加了构建步骤，但它带来的好处远远超过了这一点成本。现在越来越多的开源项目和公司都在使用TypeScript。

### 基础类型

TypeScript提供了丰富的基础类型，包括基本类型、数组、元组、枚举等。

```
// 基本类型
let isDone: boolean = false
let count: number = 42
let name: string = 'TypeScript'

// 数组
let list: number[] = [1, 2, 3]
let list2: Array<number> = [1, 2, 3] // 泛型数组

// 元组：固定长度的数组
let tuple: [string, number] = ['hello', 10]

// 枚举
enum Color { Red, Green, Blue }
let c: Color = Color.Green

// any类型：任意类型
let notSure: any = 4
notSure = 'maybe a string'

// void类型：没有返回值
function warnUser(): void {
  console.log('This is a warning')
}

// null和undefined
let u: undefined = undefined
let n: null = null

```

### 接口

接口是TypeScript中最重要的概念之一，它用于定义对象的形状。接口可以被实现，也可以被继承。

```
// 基本接口
interface User {
  name: string
  age: number
  email?: string // 可选属性
}

function printUser(user: User) {
  console.log(`${user.name}, ${user.age}岁`)
}

const user: User = {
  name: '张三',
  age: 25
}

// 只读属性
interface Point {
  readonly x: number
  readonly y: number
}

let point: Point = { x: 10, y: 20 }
// point.x = 5 // 错误：不能修改只读属性

// 函数接口
interface SearchFunc {
  (source: string, subString: string): boolean
}

let mySearch: SearchFunc
mySearch = function(src: string, sub: string): boolean {
  return src.search(sub) !== -1
}

// 接口继承
interface Animal {
  name: string
  eat(): void
}

interface Dog extends Animal {
  bark(): void
}

let dog: Dog = {
  name: '旺财',
  eat() { console.log('eating') },
  bark() { console.log('woof') }
}

```

### 泛型

泛型允许我们在定义函数、接口或类时不预先指定具体的类型，而在使用时再指定。这使得我们可以创建可重用的组件。

```
// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

let output1 = identity<string>('hello')
let output2 = identity<number>(100)

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T
}

let myIdentity: GenericIdentityFn<number> = identity

// 泛型类
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
}

let myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = function(x, y) {
  return x + y
}

// 泛型约束
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

loggingIdentity([1, 2, 3]) // 正确
// loggingIdentity(3) // 错误：number没有length属性

```

### 类型别名与联合类型

类型别名用于给类型起一个新名字，联合类型表示值可以是多种类型之一。

```
// 类型别名
type ID = string | number
type User = {
  id: ID
  name: string
}

// 联合类型
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase())
  } else {
    console.log(id)
  }
}

// 交叉类型
type Employee = {
  name: string
  startDate: Date
}

type Manager = Employee & {
  team: string[]
}

let manager: Manager = {
  name: '李四',
  startDate: new Date(),
  team: ['张三', '王五']
}

// 字面量类型
type Direction = 'up' | 'down' | 'left' | 'right'
let direction: Direction = 'up'

// 类型守卫
function isString(value: any): value is string {
  return typeof value === 'string'
}

function processValue(value: string | number) {
  if (isString(value)) {
    console.log(value.toUpperCase())
  } else {
    console.log(value.toFixed(2))
  }
}

```

### 类与装饰器

TypeScript增强了JavaScript的类，添加了访问修饰符、抽象类等特性。装饰器是TypeScript的实验性特性，用于给类或类成员添加元数据或修改行为。

```
// 访问修饰符
class Person {
  public name: string
  private age: number
  protected id: string
  
  constructor(name: string, age: number, id: string) {
    this.name = name
    this.age = age
    this.id = id
  }
  
  public getAge(): number {
    return this.age
  }
}

// 抽象类
abstract class Animal {
  abstract makeSound(): void
  
  move(): void {
    console.log('moving...')
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log('woof')
  }
}

// 装饰器（需要开启experimentalDecorators）
function log(target: any, key: string) {
  console.log(`Method ${key} was called`)
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b
  }
}

```

### 配置与编译

TypeScript通过tsconfig.json文件来配置编译选项。常用的配置包括目标版本、模块系统、严格模式等。

```
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}

```

strict选项开启后会启用所有严格的类型检查，包括noImplicitAny、strictNullChecks等。建议在新项目中始终开启strict模式。

### 总结

TypeScript为JavaScript添加了强大的类型系统，使得代码更加健壮、可维护。本文介绍了TypeScript的基础类型、接口、泛型、类型别名等核心概念。虽然TypeScript有一定的学习成本，但它带来的好处是显而易见的。对于大型项目和团队协作，TypeScript是一个非常好的选择。建议开发者在实际项目中逐步采用TypeScript，享受类型系统带来的便利。
