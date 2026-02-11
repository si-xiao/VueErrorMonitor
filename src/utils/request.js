import axios from 'axios'
import router from '@/router/index.js'
import {
  hideRequestLoading,
  showRequestLoading,
} from '@/components/common/loading/LoadingService.ts'

export const RESPONSE_CODE = {
  code_200: '000000',
  code_021000: '021000',
  // 账号不存在
  code_020000: '020000',
  // 系统异常
  code_000001: '000001',
  code_401: '401',
  code_404: '404',
  // 无效活动
  code_020030: '020030', code_020074: '020074',
}

const service = axios.create({
  baseURL:
    import.meta.env.VITE_MODE === 'DEVELOPMENT'
      ? import.meta.env.VITE_APP_PROXY_BASE_API
      : null,
  timeout: 30000,
  withCredentials: true, // 允许发送 cookies 等认证信息
})

const visibleLoading = () => {
  showRequestLoading({})
}

const closeLoading = () => {
  hideRequestLoading()
}

const handlerGoLogin = async () => {
  await router.push({path: '/login', query: {info: null}})
}

// 请求拦截
service.interceptors.request.use(
  async config => {
    if (config.showLoading) {
      visibleLoading()
    }
    // 添加 token 等逻辑
    config.headers = {
      // 'SLB-ID': 'alb-6fss1j2g7gu93pmeq5',
      'Content-Type': 'application/json',
      'x-token': 'token',
      'X-Timezone': 'timezone',
      'language-Iso': 'pt',
      // 系统类型
      'x-system-type': 'systemType',
      // 终端类型 如 app、web、h5 等
      'x-terminal-type': 'terminalType',
      // 'x-terminal-type': 'ios-app',
      // 设备识别号
      'x-device-id': 'deviceId',
      // 设备名称
      'x-device-name': 'deviceName',
      ...config.headers,
    }
    return config
  },
  error => {
    closeLoading()
    return Promise.reject(error)
  },
)

// 响应拦截
service.interceptors.response.use(
  response => {
    closeLoading()
    let formatReponse =
      typeof response?.data === 'string'
        ? JSON.parse(response?.data)
        : response?.data
    if (formatReponse?.code === RESPONSE_CODE.code_200) {
      return formatReponse
    } else {
      // todo 统一提示错误信息
      return formatReponse
    }
  },
  error => {
    // 统一错误处理
    closeLoading()

    if (!error?.status?.toString()?.includes('40')) {
      if (error.status === 500) {

      } else if (error.code === "ECONNABORTED") {

      } else {

      }
    } else {
      if (error?.status?.toString() === RESPONSE_CODE.code_401) {

      } else if (error?.status?.toString() === RESPONSE_CODE.code_404) {

      } else {

      }
    }
    return Promise.reject(error)
  },
)

export default service
