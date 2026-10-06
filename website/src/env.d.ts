declare module '*.scss?scoped';
declare module 'babel-preset-react-scope-style/vite' {
  import type { Plugin } from 'vite';
  const scopeStyle: (options?: { scopePrefix?: string; scopeNamespace?: string }) => Plugin;
  export default scopeStyle;
}
