// 临时兜底：部分 TS/LSP 环境在 monorepo 下可能无法解析 monaco-editor 的 typings 字段
// 不影响运行；后续如果你的 IDE 不再报错，可以删掉这个文件以启用 monaco-editor 原生类型。
declare module 'monaco-editor';

