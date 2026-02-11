import { RequestLoadingOptions } from '@/components/common/loading/LoadingService.ts'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $requestLoading: {
            show: (options?: RequestLoadingOptions) => void
            hide: () => void
        }
    }
}