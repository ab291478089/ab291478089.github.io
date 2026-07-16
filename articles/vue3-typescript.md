# Vue3+TypeScript项目实战

date: 2021-03-22
tags: [Vue3, TypeScript, Pinia, Vite]
categories: [Vue]

### 一、项目搭建与配置

Vue3的发布带来了许多令人兴奋的新特性，包括Composition API、更好的TypeScript支持、更快的虚拟DOM等。在实际项目中，使用Vue3配合TypeScript可以大大提升代码的可维护性和开发体验。本文将分享一个完整的Vue3+TypeScript项目搭建过程。

首先，我们需要使用Vite来创建项目。Vite是Vue3推荐的构建工具，它基于原生ES模块，启动速度极快。执行以下命令创建项目：

```
npm init vite@latest my-vue3-project -- --template vue-ts
cd my-vue3-project
npm install
```

项目创建后，我们需要配置一些必要的开发依赖。推荐使用ESLint+Prettier进行代码规范检查，使用Husky+lint-staged在提交代码时自动格式化。

### 二、TypeScript类型定义

在Vue3项目中，TypeScript的类型定义是非常重要的一环。我们需要为组件的props、emits、refs等定义清晰的类型。首先，在src目录下创建types文件夹，用于存放全局类型定义。

```
// types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}
```

对于组件的props，我们可以使用defineProps来定义类型。Vue3提供了类型推断，可以让我们的代码更加安全。

```
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
  items: Array<{ id: number; name: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
});
</script>
```

### 三、组件封装实践

在实际项目中，组件封装是提升代码复用性的关键。Vue3的Composition API让我们可以更灵活地封装组件逻辑。下面以封装一个通用的Button组件为例，展示如何进行组件封装。

```
<template>
  <button 
    :class="['btn', `btn-${type}`, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface ButtonProps {
  type?: 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  disabled: false,
  loading: false
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>
```

这个Button组件支持多种类型、禁用状态和加载状态。通过TypeScript的类型定义，我们可以在使用时获得完整的类型提示和检查。

### 四、Composition API的最佳实践

Composition API是Vue3最重要的特性之一。它让我们可以将相关的逻辑组织在一起，而不是分散在data、methods、computed等选项中。在实际项目中，我们可以使用composables来封装可复用的逻辑。

```
// composables/useLoading.ts
import { ref } from 'vue';

export function useLoading() {
  const loading = ref(false);

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    loading.value = true;
    try {
      return await fn();
    } finally {
      loading.value = false;
    }
  };

  return { loading, withLoading };
}

// 使用示例
<script setup lang="ts">
import { useLoading } from '@/composables/useLoading';
import { fetchUsers } from '@/api/user';

const { loading, withLoading } = useLoading();

const loadUsers = async () => {
  await withLoading(async () => {
    const users = await fetchUsers();
    // 处理用户数据
  });
};
</script>
```

通过这种方式，我们可以将loading状态管理逻辑封装成一个composable，在多个组件中复用。这种模式比Vue2的mixins更加清晰，避免了命名冲突和来源不明确的问题。

### 五、状态管理方案

Vue3推荐使用Pinia作为状态管理库，它比Vuex更加轻量，且对TypeScript的支持更好。Pinia的API设计更加直观，没有mutations的概念，只有state、getters和actions。

```
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { login, logout } from '@/api/auth';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string>('');

  const isLoggedIn = computed(() => !!user.value);

  const loginAction = async (username: string, password: string) => {
    const response = await login(username, password);
    user.value = response.data.user;
    token.value = response.data.token;
  };

  const logoutAction = async () => {
    await logout();
    user.value = null;
    token.value = '';
  };

  return { user, token, isLoggedIn, loginAction, logoutAction };
});
```

Pinia支持Composition API的写法，让我们可以使用ref和computed来定义state和getters，代码更加简洁。同时，Pinia对TypeScript的类型推断非常完善，无需手动定义类型。

### 六、总结

Vue3+TypeScript的组合为前端开发带来了更好的开发体验和代码质量。通过合理的类型定义、组件封装和状态管理，我们可以构建出可维护性强的中大型应用。在实际项目中，还需要注意性能优化、错误处理、单元测试等方面，这些都需要在实践中不断探索和总结。
