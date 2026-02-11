import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { errorMonitor } from '@/utils/errorMonitor.js'
import service from '@/utils/request.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化Vue 3错误监控
errorMonitor.registerVueErrorHandler(app);

// Axios接口错误拦截（组合式写法）
service.interceptors.response.use(
  res => res,
  err => {
    errorMonitor.captureAxiosError(err);
    return Promise.reject(err);
  }
);

app.mount('#app')
