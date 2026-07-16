# 微前端架构设计与实践

date: 2021-09-20
tags: [微前端, qiankun, Module Federation]
categories: [架构]

### 一、微前端的背景与核心概念

随着前端业务复杂度的不断增长，单体前端应用逐渐暴露出诸多问题：代码仓库臃肿、技术栈升级困难、团队协作冲突、构建时间过长等。微前端（Micro Frontends）的概念应运而生，其核心思想是将一个大型前端应用拆分为多个独立开发、独立部署、独立运行的小型应用，最终通过某种机制将它们组合为一个完整的用户体验。

微前端的核心理念可以概括为以下几点：技术栈无关，子应用可以使用任意前端框架；独立开发部署，每个子应用拥有独立的代码仓库和CI/CD流程；运行时集成，多个子应用在同一页面中并行运行；渐进式升级，老项目可以逐步迁移到微前端架构，而不需要一次性重写。

### 二、qiankun框架详解

qiankun是蚂蚁金服开源的一款基于single-spa的微前端框架，它在single-spa的基础上做了大量的增强和封装，提供了更加简单易用的API和更完善的沙箱机制。qiankun的核心特性包括：CSS隔离（通过Shadow DOM或实验性样式隔离方案）、JS沙箱（Proxy沙箱和快照沙箱）、应用预加载、预执行等。

在主应用中注册和加载子应用的核心配置如下：

```
// 主应用注册子应用
import { registerMicroApps, start } from 'qiankun';

const apps = [
  {
    name: 'app-react',
    entry: '//localhost:7100',
    container: '#subapp-container',
    activeRule: '/react',
  },
  {
    name: 'app-vue',
    entry: '//localhost:7200',
    container: '#subapp-container',
    activeRule: '/vue',
  }
];

registerMicroApps(apps, {
  beforeLoad: [app => console.log('before load', app)],
  beforeMount: [app => console.log('before mount', app)],
  afterUnmount: [app => console.log('after unmount', app)],
});

start({
  sandbox: { experimentalStyleIsolation: true },
  prefetch: 'all',
});
```

子应用需要导出bootstrap、mount、unmount三个生命周期钩子，以便主应用在适当的时机调用：

```
// 子应用入口文件
let instance = null;

export async function bootstrap() {
  console.log('react app bootstraped');
}

export async function mount(props) {
  instance = ReactDOM.render(
    <App />,
    props.container.querySelector('#root')
  );
  // 存储props用于后续通信
  props.onGlobalStateChange((state, prevStates) => {
    console.log('全局状态变更:', state, prevStates);
  });
}

export async function unmount() {
  ReactDOM.unmountComponentAtNode(document.getElementById('root'));
  instance = null;
}
```

### 三、Module Federation模块联邦方案

Module Federation是Webpack 5引入的一种革命性模块共享方案。与qiankun在运行时加载整个应用不同，Module Federation允许在编译时配置模块的共享关系，实现真正的"微联邦"。它可以在不重新编译的情况下，在运行时动态加载远程模块，并且可以精确控制哪些模块被共享、哪些被独立打包。

```
// 主应用 webpack.config.js（Host端配置）
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'lodash'],
    }),
  ],
};

// 子应用 webpack.config.js（Remote端配置）
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './Utils': './src/utils/helpers',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

在主应用中可以像导入本地模块一样使用远程模块：

```
// 主应用中动态加载远程组件
import React, { lazy, Suspense } from 'react';
const RemoteButton = lazy(() => import('app1/Button'));

function App() {
  return (
    <Suspense fallback="Loading...">
      <RemoteButton text="来自远程模块的按钮" />
    </Suspense>
  );
}
```

### 四、应用间通信机制

微前端架构中，子应用之间的通信是一个核心挑战。常见的通信方案包括：全局状态管理（initGlobalState）、CustomEvent自定义事件、URL参数传递、以及基于发布订阅模式的EventBus。qiankun内置了基于initGlobalState的共享状态方案，适合传递全局用户信息、权限配置等数据。

```
// 主应用初始化全局状态
import { initGlobalState } from 'qiankun';

const initialState = {
  user: { name: '张三', role: 'admin' },
  theme: 'dark',
};

const actions = initGlobalState(initialState);

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('主应用监听状态变化:', state, prev);
});

// 子应用中通过props接收actions
export async function mount(props) {
  const { onGlobalStateChange, setGlobalState } = props;

  // 监听状态变化
  onGlobalStateChange((state, prev) => {
    console.log('子应用监听状态变化:', state, prev);
  });

  // 主动修改全局状态
  setGlobalState({ theme: 'light' });
}
```

对于更复杂的跨应用通信场景，推荐使用CustomEvent或自定义EventBus。CustomEvent方案的优势在于不依赖任何框架，且支持传递任意类型的数据：

```
// 发送事件
window.dispatchEvent(new CustomEvent('micro:notification', {
  detail: { type: 'MESSAGE', payload: { content: 'Hello from app1!' } }
}));

// 接收事件
window.addEventListener('micro:notification', (event) => {
  const { type, payload } = event.detail;
  if (type === 'MESSAGE') {
    console.log('收到消息:', payload.content);
  }
});
```

### 五、样式隔离与JS沙箱

样式隔离是微前端中必须解决的问题，否则子应用之间的CSS会相互污染。qiankun提供了两种样式隔离方案：strictStyleIsolation基于Shadow DOM实现严格的样式隔离，experimentalStyleIsolation通过给子应用的样式选择器添加特定前缀来实现隔离，类似于Vue的scoped样式。实际项目中，推荐使用experimentalStyleIsolation方案，因为Shadow DOM在某些UI组件库（如Ant Design）中会出现弹出层挂载异常等问题。

JS沙箱机制用于防止子应用之间的全局变量污染。qiankun提供了两种沙箱：LegacySandbox（快照沙箱）通过记录全局对象的属性快照来实现隔离，兼容性更好；ProxySandbox（Proxy沙箱）基于ES6 Proxy实现，性能更优且支持多实例运行。在Webpack 5和Module Federation方案中，由于模块作用域天然隔离，沙箱问题得到了一定程度的缓解。

### 六、微前端工程化实践与总结

在实际项目中落地微前端架构，还需要考虑以下工程化问题：子应用的路由配置需要与主应用的activeRule保持一致；子应用的公共依赖可以通过externals或Module Federation的shared配置来共享，避免重复加载；子应用的鉴权信息需要由主应用统一管理和分发；CI/CD流程需要支持子应用的独立构建和部署。

微前端架构并非银弹，它适合团队规模较大、业务模块较多、技术栈多样化的场景。对于小型项目或单一团队维护的项目，传统的单体应用架构可能更加合适。选择微前端架构时，需要权衡其带来的复杂度提升与业务收益，避免为了技术而技术。总的来说，微前端是前端架构演进的重要方向，掌握qiankun和Module Federation等核心方案，对于前端工程师的技术成长具有重要价值。
