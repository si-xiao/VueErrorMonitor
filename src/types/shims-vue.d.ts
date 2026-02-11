// 声明 Vue 单文件组件类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 批量声明所有 JS 模块（避免 TS 找不到 JS 文件的类型）
declare module '@/**/*.js' {
  const content: any;
  export default content;
  export * from '@/**/*.js';
}
