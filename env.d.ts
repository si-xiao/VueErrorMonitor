/// <reference types="vite/client" />
interface ImportMetaEnv {
  // 以VITE_开头的自定义环境变量
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_MODE: string;
  readonly VITE_APP_PROXY_BASE_API: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string; // 可选变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
