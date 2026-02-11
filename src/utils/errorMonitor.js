/**
 * Vue 3 生产环境异常监控（组合式 API 版本）
 * 覆盖：Vue运行时错误、JS全局错误、Promise异常、接口错误、资源加载错误
 */
class ErrorMonitor {
  constructor() {
    this.isProd = import.meta.env.MODE === 'production'; // Vue 3 Vite 环境变量（webpack 可改用 process.env.NODE_ENV）
    this.reportUrl = import.meta.env.VITE_API_BASE_URL || 'https://your-api.com/report-error'; // 环境变量配置上报地址
    this.reportTimer = null; // 防抖定时器
    this.errorQueue = []; // 错误队列
    this.app = null; // Vue 3 应用实例

    if (this.isProd) {
      this.initGlobalListeners(); // 初始化全局监听（非Vue相关的错误）
    }
  }

  /**
   * 初始化全局错误监听（JS/Promise/资源加载）
   */
  initGlobalListeners() {
    // 1. 全局JS运行时错误
    window.onerror = this.captureJsError.bind(this);
    // 2. 未捕获的Promise异常
    window.addEventListener('unhandledrejection', this.capturePromiseError.bind(this));
    // 3. 资源加载错误（图片/脚本/样式）
    window.addEventListener('error', this.captureResourceError.bind(this), true);
  }

  /**
   * 注册Vue 3 运行时错误监听（需传入app实例）
   * @param {import('vue').App} app - Vue 3 createApp 实例
   */
  registerVueErrorHandler(app) {
    if (!this.isProd || !app) return;
    this.app = app;
    // Vue 3 全局错误处理
    app.config.errorHandler = (err, instance, info) => {
      const errorInfo = {
        type: 'VUE_RUNTIME_ERROR',
        message: err.message,
        stack: err.stack,
        component: instance?.type?.name || 'unknown', // Vue 3 组件名称
        lifecycle: info, // 生命周期信息
        ...this.getBaseInfo()
      };
      this.addToQueue(errorInfo);
    };
    // 可选：捕获自定义指令/插件错误
    app.config.warnHandler = (msg, instance, trace) => {
      if (import.meta.env.MODE === 'production') {
        this.addToQueue({
          type: 'VUE_WARN',
          message: msg,
          trace,
          ...this.getBaseInfo()
        });
      }
    };
  }

  /**
   * 捕获JS运行时错误
   */
  captureJsError(message, source, line, column, error) {
    this.addToQueue({
      type: 'JS_RUNTIME_ERROR',
      message,
      source,
      line,
      column,
      stack: error?.stack || '',
      ...this.getBaseInfo()
    });
    return true; // 阻止浏览器默认提示
  }

  /**
   * 捕获Promise未处理异常
   */
  capturePromiseError(event) {
    const reason = event.reason || 'Unknown Promise Error';
    this.addToQueue({
      type: 'PROMISE_REJECT_ERROR',
      message: typeof reason === 'object' ? reason.message : reason,
      stack: typeof reason === 'object' ? reason.stack : '',
      ...this.getBaseInfo()
    });
    event.preventDefault();
  }

  /**
   * 捕获资源加载错误
   */
  captureResourceError(event) {
    const target = event.target;
    if (['IMG', 'SCRIPT', 'LINK', 'IFRAME'].includes(target.tagName)) {
      this.addToQueue({
        type: 'RESOURCE_LOAD_ERROR',
        message: `Resource load failed: ${target.src || target.href}`,
        resourceType: target.tagName.toLowerCase(),
        ...this.getBaseInfo()
      });
    }
  }

  /**
   * 捕获Axios接口错误（组合式API中调用）
   */
  captureAxiosError(error) {
    if (!this.isProd) return;
    const isRequestError = !error.response;
    this.addToQueue({
      type: 'API_REQUEST_ERROR',
      url: error.config?.url || '',
      method: error.config?.method || 'GET',
      params: this.filterSensitiveData(error.config?.params || {}),
      data: this.filterSensitiveData(error.config?.data || {}),
      status: error.response?.status || 0,
      statusText: error.response?.statusText || (isRequestError ? 'Network Error' : ''),
      responseData: error.response?.data || '',
      message: error.message || 'Request failed',
      ...this.getBaseInfo()
    });
  }

  /**
   * 获取基础环境信息（定位问题核心）
   */
  getBaseInfo() {
    return {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      screen: `${screen.width}x${screen.height}`,
      route: this.app?._route?.fullPath || window.location.pathname, // Vue Router 路由信息（可选）
      userId: localStorage.getItem('userId') || 'anonymous' // 业务标识
    };
  }

  /**
   * 过滤敏感信息
   */
  filterSensitiveData(data) {
    const sensitiveKeys = ['password', 'token', 'mobile', 'phone', 'cardNo', 'auth'];
    if (typeof data !== 'object' || !data) return data;
    const result = { ...data };
    sensitiveKeys.forEach(key => {
      if (result[key]) result[key] = '******';
    });
    return result;
  }

  /**
   * 添加错误到队列，防抖上报
   */
  addToQueue(errorInfo) {
    this.errorQueue.push(errorInfo);
    clearTimeout(this.reportTimer);
    this.reportTimer = setTimeout(() => this.reportErrors(), 500);
  }

  /**
   * 异步上报错误到后端
   */
  async reportErrors() {
    if (this.errorQueue.length === 0) return;
    try {
      await fetch(this.reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: this.errorQueue,
          appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
        }),
        credentials: 'omit',
        keepalive: true
      });
      // 上报成功清空队列
      this.errorQueue = [];
    } catch (err) {
      // 上报失败缓存到本地，下次重试
      const failed = JSON.parse(localStorage.getItem('failedErrorReports') || '[]');
      failed.push(...this.errorQueue);
      localStorage.setItem('failedErrorReports', JSON.stringify(failed.slice(-100))); // 限制缓存数量
      this.errorQueue = [];
    }
  }

  /**
   * 重试失败的上报（组合式API中调用）
   */
  retryFailedReports() {
    if (!this.isProd) return;
    const failed = JSON.parse(localStorage.getItem('failedErrorReports') || '[]');
    if (failed.length > 0) {
      failed.forEach(err => this.addToQueue(err));
      localStorage.removeItem('failedErrorReports');
    }
  }
}

// 单例导出
export const errorMonitor = new ErrorMonitor();
