/**
 * 组合式API：错误监控钩子（可在任意组件中调用）
 */
import { onMounted } from 'vue';
import { errorMonitor } from '@/utils/errorMonitor.js';

export function useErrorMonitor() {
  // 组件挂载后重试失败的上报
  onMounted(() => {
    errorMonitor.retryFailedReports();
  });

  // 暴露手动上报错误的方法（业务代码中主动上报）
  const reportManualError = (errorInfo) => {
    if (import.meta.env.MODE === 'production') {
      errorMonitor.addToQueue({
        type: 'MANUAL_REPORT_ERROR',
        ...errorInfo,
        ...errorMonitor.getBaseInfo()
      });
    }
  };

  return {
    reportManualError
  };
}
