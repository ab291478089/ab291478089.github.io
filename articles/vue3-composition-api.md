# Vue3组合式API最佳实践

date: 2022-08-20
tags: [Vue3, Composition API, Pinia, Composables]
categories: [Vue]

### 一、组合式 API 概述

Vue 3 于 2020 年正式发布，其中最引人注目的新特性莫过于**组合式 API（Composition API）**。组合式 API 并非为了替代选项式 API（Options API），而是提供了一种更灵活、更强大的方式来组织和复用组件逻辑。在 Vue 2 的选项式 API 中，当组件逻辑变得复杂时，相关代码会被分散到不同的选项（data、methods、computed、watch 等）中，导致"代码拆分困难"的问题。组合式 API 通过 `setup()` 函数或 `<script setup>` 语法糖，允许开发者按照**逻辑关注点**而非选项类型来组织代码，极大提升了大型组件的可维护性。

### 二、响应式系统：ref 与 reactive 的选择

Vue 3 的响应式系统基于 **Proxy** 实现，相比 Vue 2 的 `Object.defineProperty`，能够检测到属性的新增和删除，性能更优。Vue 3 提供了两个核心的响应式 API：`ref` 和 `reactive`。

`ref` 用于包装基本类型值（如 number、string），也可以包装对象。访问和修改需要通过 `.value` 属性。`reactive` 则用于创建深层响应式对象，访问时不需要 `.value`，但存在解构丢失响应性的问题。

最佳实践建议：**优先使用 ref**。原因有三：一是 ref 的行为更一致，无论是基本类型还是对象；二是 ref 在模板中会自动解包，使用体验与 reactive 无异；三是 ref 可以避免 reactive 解构时的响应性丢失问题。示例如下：

```
import { ref, reactive } from 'vue';

// 推荐：使用 ref
const count = ref(0);
const user = ref({ name: 'Alice', age: 25 });

// 不推荐：使用 reactive 后解构
const state = reactive({ count: 0, name: 'Alice' });
const { count, name } = state; // 丢失响应性！

// 如果必须使用 reactive，配合 toRefs 保持响应性
const { count, name } = toRefs(state);
```

### 三、Composables 模式：逻辑复用的新范式

Composables 是 Vue 3 中实现逻辑复用的核心模式，类似于 React 的自定义 Hooks。一个 Composable 是一个利用 Vue 组合式 API 封装和复用有状态逻辑的函数。相比 Vue 2 的 Mixins，Composables 具有**来源清晰、命名冲突少、类型推断友好**等优势。

以下是一个典型的 Composable 示例，用于封装鼠标位置监听逻辑：

```
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));

  return { x, y };
}

// 在组件中使用
export default {
  setup() {
    const { x, y } = useMouse();
    return { x, y };
  }
}
```

编写 Composable 时应遵循以下原则：一是函数名以 `use` 开头，便于识别；二是返回值使用对象或 ref，保持响应性；三是内部的生命周期钩子会在调用者的组件实例上下文中执行，无需额外传递上下文。

### 四、状态管理：从 Vuex 到 Pinia

Vue 3 生态中，**Pinia** 已逐渐取代 Vuex 成为官方推荐的状态管理库。Pinia 由 Vue 核心团队成员开发，完全支持 TypeScript，去除了 Vuex 中的 mutations，仅保留 state、getters 和 actions，API 设计更简洁直观。

Pinia 与组合式 API 的配合非常自然：

```
// stores/counter.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // setup 语法，与组合式 API 风格一致
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});

// 在组件中使用
export default {
  setup() {
    const counter = useCounterStore();
    return { count: counter.count, increment: counter.increment };
  }
}
```

Pinia 的 setup 语法与组合式 API 完全一致，使得状态管理逻辑与组件逻辑风格统一，降低了心智负担。同时 Pinia 支持 SSR、模块热更新、插件扩展等高级特性，是 Vue 3 项目的理想选择。

### 五、性能优化实践

Vue 3 在性能上相比 Vue 2 有显著提升，但仍有一些最佳实践值得遵循：

**1. 使用 computed 缓存计算结果**：对于依赖响应式数据的复杂计算，始终使用 `computed` 而非方法调用，以利用其缓存机制避免重复计算。

```
import { ref, computed } from 'vue';

const items = ref([/* 大量数据 */]);
const filteredItems = computed(() => {
  return items.value.filter(item => item.active);
});
```

**2. 使用 v-memo 指令缓存子树**：Vue 3.2 引入的 `v-memo` 指令可以缓存模板中某部分渲染结果，仅当依赖值变化时才重新渲染，适用于大型列表渲染场景。

```
<div v-for="item in list" :key="item.id" v-memo="[item.selected]">
  <p>{{ item.name }}</p>
  <span v-if="item.selected">已选中</span>
</div>
```

**3. 合理使用 shallowRef 和 shallowReactive**：对于不需要深层响应的大型对象或第三方库实例，使用 `shallowRef` 或 `shallowReactive` 可以避免深层代理带来的性能开销。

```
import { shallowRef } from 'vue';

// 仅监听 .value 的整体替换，不深层追踪属性
const largeData = shallowRef({ /* 大量嵌套数据 */ });
largeData.value = { ...largeData.value, updated: true };
```

**4. 异步组件与代码分割**：使用 `defineAsyncComponent` 实现按需加载，减少首屏包体积。

```
import { defineAsyncComponent } from 'vue';

const AsyncModal = defineAsyncComponent(() =>
  import('./components/HeavyModal.vue')
);
```

### 六、<script setup> 语法糖

Vue 3.2 稳定了 `<script setup>` 语法糖，这是使用组合式 API 的推荐方式。它在编译时被转换为 `setup()` 函数，具有以下优势：一是代码更简洁，无需 `return` 暴露变量；二是顶层变量和函数自动暴露给模板；三是更好的类型推断，对 TypeScript 支持更友好；四是编译时优化，生成的渲染函数性能更好。

```
<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
}
</script>

<template>
  <div>
    <p>用户：{{ userStore.name }}</p>
    <p>计数：{{ count }}，双倍：{{ doubleCount }}</p>
    <button @click="increment">增加</button>
  </div>
</template>
```

### 七、总结

Vue 3 的组合式 API 为前端开发带来了更灵活的代码组织方式和更强大的逻辑复用能力。掌握 ref 与 reactive 的选择、Composables 模式的运用、Pinia 状态管理、以及性能优化技巧，是构建高质量 Vue 3 应用的关键。这些实践不仅能提升代码的可维护性和性能，也是面试中展示 Vue 技术深度的重要内容。随着 Vue 生态的持续演进，组合式 API 已成为 Vue 开发者的必备技能。
