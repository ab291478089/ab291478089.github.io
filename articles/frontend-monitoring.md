# 前端监控体系搭建

date: 2021-11-08
tags: [监控, 性能, 错误追踪, Web Vitals]
categories: [监控]

### 一、前端监控体系概述

前端监控体系是保障线上应用质量和用户体验的重要基础设施。一个完善的前端监控体系通常包含三大核心模块：性能监控、错误监控和用户行为追踪。性能监控关注页面的加载速度和运行时性能指标；错误监控负责捕获和上报应用中的各类异常；用户行为追踪则记录用户的操作路径和交互行为，为产品优化提供数据支撑。

搭建前端监控体系的核心流程包括：数据采集（SDK层）、数据传输（上报策略）、数据处理（服务端清洗聚合）和数据展示（可视化大盘）。其中，SDK层的设计是整个体系的基础，它直接决定了数据的准确性、完整性和对应用性能的影响程度。

### 二、性能监控：核心指标采集

现代前端性能监控主要基于Performance API和Web Vitals指标体系。Google提出的Core Web Vitals包含三个核心指标：LCP（Largest Contentful Paint，最大内容绘制）衡量页面主要内容加载速度，理想值在2.5秒以内；FID（First Input Delay，首次输入延迟）衡量页面交互响应速度，理想值在100毫秒以内；CLS（Cumulative Layout Shift，累积布局偏移）衡量页面视觉稳定性，理想值在0.1以内。

```
// 性能指标采集核心实现
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // 采集Navigation Timing数据
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.getEntriesByType('navigation')[0];
        this.metrics = {
          // DNS查询时间
          dns: timing.domainLookupEnd - timing.domainLookupStart,
          // TCP连接时间
          tcp: timing.connectEnd - timing.connectStart,
          // SSL连接时间
          ssl: timing.connectEnd - timing.secureConnectionStart,
          // 首字节时间
          ttfb: timing.responseStart - timing.requestStart,
          // DOM解析时间
          domReady: timing.domComplete - timing.domInteractive,
          // 白屏时间
          whiteScreen: timing.domInteractive - timing.navigationStart,
          // 页面完全加载时间
          loadTime: timing.loadEventEnd - timing.navigationStart,
        };
        this.report();
      }, 0);
    });

    // 采集Web Vitals指标
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  observeLCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      this.metrics.lcp = entries[entries.length - 1].startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  observeFID() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      this.metrics.fid = entries[0].processingStart - entries[0].startTime;
    }).observe({ type: 'first-input', buffered: true });
  }

  observeCLS() {
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.cls = clsValue;
    }).observe({ type: 'layout-shift', buffered: true });
  }

  report() {
    const data = {
      url: location.href,
      ua: navigator.userAgent,
      timestamp: Date.now(),
      ...this.metrics,
    };
    // 使用sendBeacon保证页面卸载时数据不丢失
    navigator.sendBeacon('/api/performance', JSON.stringify(data));
  }
}
```

除了页面级别的性能指标，还需要关注资源加载性能。通过PerformanceObserver监听resource类型的条目，可以统计每个资源的加载耗时，识别加载缓慢的第三方脚本、图片和字体资源，为资源优化提供数据依据。

### 三、错误监控：全方位异常捕获

前端错误监控需要覆盖多种异常类型：JavaScript运行时错误、Promise未捕获异常、资源加载失败、接口请求异常以及框架层面的错误。对于JavaScript运行时错误，通过window.onerror全局监听；对于Promise异常，通过unhandledrejection事件捕获；对于React和Vue等框架的错误，需要利用框架提供的错误边界机制。

```
// 错误监控SDK核心实现
class ErrorMonitor {
  constructor() {
    this.errorQueue = [];
    this.init();
  }

  init() {
    // 捕获JS运行时错误
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError({
        type: 'js_error',
        message,
        source,
        lineno,
        colno,
        stack: error?.stack || 'No stack trace',
        timestamp: Date.now(),
      });
    };

    // 捕获Promise未处理异常
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise_error',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || 'No stack trace',
        timestamp: Date.now(),
      });
    });

    // 捕获资源加载错误（利用事件捕获阶段）
    window.addEventListener('error', (event) => {
      const target = event.target;
      if (target !== window && (target.src || target.href)) {
        this.handleError({
          type: 'resource_error',
          url: target.src || target.href,
          tagName: target.tagName.toLowerCase(),
          timestamp: Date.now(),
        });
      }
    }, true);

    // 拦截fetch请求错误
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.handleError({
            type: 'http_error',
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: Date.now(),
          });
        }
        return response;
      } catch (error) {
        this.handleError({
          type: 'http_error',
          url: args[0],
          message: error.message,
          timestamp: Date.now(),
        });
        throw error;
      }
    };
  }

  handleError(errorInfo) {
    // 错误去重，避免同一错误重复上报
    const errorKey = `${errorInfo.type}_${errorInfo.message}`;
    if (this.isDuplicate(errorKey)) return;

    this.errorQueue.push(errorInfo);

    // 批量上报，减少请求次数
    if (this.errorQueue.length >= 5) {
      this.flush();
    }
  }

  isDuplicate(key) {
    // 简单的去重逻辑，实际项目中可以使用布隆过滤器
    return this.errorQueue.some(e => `${e.type}_${e.message}` === key);
  }

  flush() {
    if (this.errorQueue.length === 0) return;
    const data = this.errorQueue.splice(0);
    navigator.sendBeacon('/api/errors', JSON.stringify(data));
  }
}
```

错误监控的关键在于错误信息的完整性和准确性。对于压缩后的代码，错误堆栈中的行列号往往无法直接定位到源码位置，需要配合SourceMap进行反向解析。在生产环境中，SourceMap文件不应该部署到CDN上，而是保存在内部服务中，由错误监控服务端在需要时进行解析，将行列号还原为源码位置。

### 四、用户行为追踪：操作路径还原

用户行为追踪的目的是记录用户在页面上的操作路径，帮助还原问题发生时的用户场景。常见的追踪维度包括：页面PV/UV统计、用户点击行为、页面跳转路径、表单输入行为等。在实现上，通常采用无埋点（全埋点）和手动埋点相结合的方式。

```
// 用户行为追踪SDK
class BehaviorTracker {
  constructor() {
    this.behaviors = [];
    this.userId = this.generateUserId();
    this.init();
  }

  init() {
    // 自动采集点击事件（基于事件委托）
    document.addEventListener('click', (event) => {
      const target = event.target;
      const behavior = {
        type: 'click',
        tagName: target.tagName,
        text: this.getElementText(target),
        className: target.className,
        id: target.id,
        xpath: this.getXPath(target),
        url: location.href,
        timestamp: Date.now(),
      };
      this.behaviors.push(behavior);
      this.throttleReport();
    }, true);

    // 自动采集页面访问
    this.trackPageView();

    // 监听路由变化（SPA应用）
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackPageView();
    };
    window.addEventListener('popstate', () => this.trackPageView());

    // 页面卸载时上报剩余数据
    window.addEventListener('beforeunload', () => this.flush());
  }

  trackPageView() {
    this.behaviors.push({
      type: 'pv',
      url: location.href,
      referrer: document.referrer,
      title: document.title,
      timestamp: Date.now(),
    });
  }

  getElementText(element) {
    const text = element.textContent || element.innerText;
    return text ? text.trim().substring(0, 50) : '';
  }

  getXPath(element) {
    if (element.id) return `//*[@id="${element.id}"]`;
    const paths = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = element.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE &&
            sibling.tagName === element.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      paths.unshift(`${element.tagName.toLowerCase()}[${index}]`);
      element = element.parentNode;
    }
    return '/' + paths.join('/');
  }

  throttleReport() {
    // 节流上报，每10秒最多上报一次
    if (!this._timer) {
      this._timer = setTimeout(() => {
        this.flush();
        this._timer = null;
      }, 10000);
    }
  }

  flush() {
    if (this.behaviors.length === 0) return;
    const data = this.behaviors.splice(0);
    navigator.sendBeacon('/api/behaviors', JSON.stringify({
      userId: this.userId,
      behaviors: data,
    }));
  }

  generateUserId() {
    let userId = localStorage.getItem('monitor_uid');
    if (!userId) {
      userId = 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('monitor_uid', userId);
    }
    return userId;
  }
}
```

### 五、数据上报策略与性能优化

监控SDK的性能影响必须控制在最低限度。在数据上报方面，推荐使用navigator.sendBeacon API，它可以在页面卸载时异步发送数据，不会阻塞页面关闭，也不会影响用户体验。对于不支持sendBeacon的浏览器，可以降级为Image对象方式上报。

上报策略上，应该采用批量上报和节流机制，避免频繁发送请求影响网络性能。对于错误数据，需要做去重处理，避免同一错误在短时间内被重复上报数千次。对于性能数据，可以在页面load完成后延迟采集和上报，避免阻塞关键渲染路径。此外，SDK本身应该支持动态配置，通过服务端下发的配置来控制采集频率、上报地址、功能开关等，实现监控策略的灵活调整。

### 六、监控数据的可视化与告警

采集到的数据最终需要通过可视化平台展示给开发和运营团队。性能监控大盘应该展示核心指标的P50、P75、P90分位值，以及趋势变化；错误监控大盘应该展示错误数量、影响用户数、错误类型分布和Top N错误排行；用户行为分析则应该支持操作路径回放和漏斗分析。

告警机制是监控体系中不可或缺的一环。当错误率突增、性能指标劣化或接口异常率超过阈值时，应该通过钉钉、邮件、短信等渠道及时通知相关人员。告警规则应该支持灵活配置，避免误报导致告警疲劳。同时，告警信息应该包含足够的上下文（如错误堆栈、影响范围、发生时间），帮助开发者快速定位和修复问题。

搭建一套完善的前端监控体系是前端工程化的重要一环。通过性能监控发现问题、通过错误监控定位问题、通过行为追踪还原问题，三者协同构成了前端质量保障的完整闭环。在实际落地过程中，可以根据团队规模选择使用Sentry、Fundebug等成熟的第三方方案，或者基于上述思路自研轻量级SDK，关键是建立数据驱动的质量意识，持续提升应用的用户体验。
