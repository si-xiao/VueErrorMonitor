import { createApp, h, App } from 'vue'
import RequestLoading from '@/components/common/loading/Loading.vue'

export interface RequestLoadingOptions {
    text?: string
    background?: string
    spinnerColor?: string
    customClass?: string
}

class RequestLoadingService {
    private instance: any = null
    private app: App | null = null
    private mountNode: HTMLElement | null = null
    private visible = false

    show(options: RequestLoadingOptions = {}) {
        if (this.visible) return
        this.visible = true

        const loadingNode = h(RequestLoading, {
            visible: this.visible,
            text: options.text,
            background: options.background,
            spinnerColor: options.spinnerColor,
            customClass: options.customClass
        })

        this.mountNode = document.createElement('div')
        document.body.appendChild(this.mountNode)

        this.app = createApp({
            render() {
                return loadingNode
            }
        })

        this.instance = this.app.mount(this.mountNode)
    }

    hide() {
        // if (!this.visible) return
        this.visible = false

        if (this.app && this.mountNode && document.body.contains(this.mountNode)) {
            this.app.unmount()
            document.body.removeChild(this.mountNode)
        }
        this.instance = null
        this.app = null
        this.mountNode = null
    }
}

// 创建单例
const requestLoadingService = new RequestLoadingService()

// 导出常用方法
export const showRequestLoading = requestLoadingService.show.bind(requestLoadingService)
export const hideRequestLoading = requestLoadingService.hide.bind(requestLoadingService)

// 导出服务实例（如果需要扩展功能）
export default requestLoadingService