# 前端工程化之Monorepo实践

date: 2021-05-10
tags: [Monorepo, pnpm, Turborepo, 工程化]
categories: [工程化]

### 一、什么是Monorepo

Monorepo（单一代码仓库）是一种将多个项目的代码集中在一个代码仓库中进行管理的策略。与传统的多仓库（Multirepo）策略不同，Monorepo可以让团队在一个仓库中管理多个相关的项目、库或应用。这种策略在大型互联网公司中已经被广泛采用，如Google、Facebook、Microsoft等。

在前端领域，Monorepo的优势尤为明显。前端项目通常由多个相关的包组成，如UI组件库、工具函数库、业务模块等。使用Monorepo可以方便地在这些包之间共享代码、统一版本管理、简化依赖管理。

### 二、pnpm workspace介绍与配置

pnpm是一个高性能的包管理器，它通过硬链接和符号链接的方式，避免了依赖的重复下载和安装。pnpm的workspace功能允许我们在一个仓库中管理多个包，并且可以自动处理包之间的依赖关系。

首先，我们需要在项目根目录创建pnpm-workspace.yaml文件来定义workspace的结构：

```
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'
```

然后，在各个包的package.json中，可以通过workspace:协议来引用其他包：

```
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "version": "1.0.0",
  "dependencies": {
    "@myorg/utils": "workspace:*",
    "react": "^17.0.2"
  }
}
```

使用pnpm workspace的好处在于：首先，它可以自动将workspace:协议替换为实际的版本号，方便发布；其次，pnpm的严格依赖隔离可以避免幽灵依赖问题；最后，pnpm的安装速度比npm和yarn快很多。

### 三、Turborepo实现高效构建

Turborepo是一个针对JavaScript和TypeScript monorepo的高性能构建系统。它可以通过智能的任务调度和缓存机制，显著提升构建速度。Turborepo的核心特性包括：并行任务执行、远程缓存、增量构建等。

在项目根目录创建turbo.json配置文件：

```
// turbo.json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}
```

在上面的配置中，build任务依赖于其依赖包的build任务（通过^build表示），并且会缓存dist和.next目录。这意味着如果某个包的代码没有变化，Turborepo会直接使用缓存的结果，而不需要重新构建。

### 四、依赖管理策略

在Monorepo中，依赖管理是一个需要重点关注的问题。我们需要确保各个包使用相同版本的公共依赖，避免版本冲突和重复安装。pnpm提供了几种机制来帮助我们管理依赖：

首先，我们可以在根目录的package.json中定义公共依赖，这些依赖会被所有包共享：

```
// package.json (root)
{
  "name": "my-monorepo",
  "private": true,
  "devDependencies": {
    "typescript": "^4.5.0",
    "eslint": "^8.0.0",
    "prettier": "^2.5.0",
    "@types/node": "^16.0.0"
  },
  "pnpm": {
    "peerDependencyRules": {
      "ignoreMissing": ["react"]
    }
  }
}
```

其次，我们可以使用pnpm的overrides功能来强制所有包使用特定版本的依赖：

```
// package.json (root)
{
  "pnpm": {
    "overrides": {
      "lodash": "^4.17.21",
      "axios": "^0.24.0"
    }
  }
}
```

这种方式可以确保整个monorepo使用统一的依赖版本，避免安全漏洞和兼容性问题。

### 五、代码共享与版本发布

在Monorepo中，代码共享变得非常简单。我们可以将通用的工具函数、类型定义、组件等提取到独立的包中，其他包可以直接引用。例如：

```
// packages/utils/src/index.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// packages/app/src/index.ts
import { formatDate, debounce } from '@myorg/utils';
```

对于版本发布，我们可以使用Changesets来管理版本变更。Changesets是一个专门用于monorepo版本管理的工具，它可以自动计算版本号、生成CHANGELOG、处理包之间的依赖关系。

```
# 安装changesets
pnpm add -Dw @changesets/cli

# 初始化
pnpm changeset init

# 创建变更集
pnpm changeset

# 版本发布
pnpm changeset version
pnpm changeset publish
```

Changesets会根据每个包的变更自动计算版本号，并更新包之间的依赖关系。这种方式比手动管理版本号更加可靠和高效。

### 六、CI/CD优化

在Monorepo中，CI/CD的优化非常重要。由于仓库中包含多个包，每次提交都构建所有包会非常耗时。我们可以使用Turborepo的过滤功能来只构建受影响的包：

```
# 只构建受@myorg/ui影响的包
pnpm turbo build --filter=@myorg/ui...

# 只构建最近一次提交变更的包
pnpm turbo build --filter=...[HEAD^1]
```

此外，我们还可以结合GitHub Actions等CI工具，实现自动化的构建、测试和发布流程。通过合理的缓存策略和增量构建，可以将CI时间从几十分钟缩短到几分钟。

### 七、总结

Monorepo是一种强大的代码管理策略，它可以提升代码复用性、简化依赖管理、统一开发规范。通过pnpm workspace、Turborepo、Changesets等工具的组合使用，我们可以构建一个高效的Monorepo工程化体系。当然，Monorepo也带来了一些挑战，如仓库体积增大、权限管理复杂等，需要在实践中不断优化和完善。
