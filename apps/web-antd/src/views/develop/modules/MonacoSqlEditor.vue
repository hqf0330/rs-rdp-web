<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

defineOptions({ name: 'MonacoSqlEditor' });

const props = defineProps<{
  /** 不传时自动撑满父容器高度 */
  height?: number;
  language?: string;
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
}>();

const elRef = ref<HTMLDivElement | null>(null);

let editor: any;
let monaco: any;
let updatingFromModel = false;
let onWheelFocus: ((e: WheelEvent) => void) | null = null;

async function setupEditor() {
  if (!elRef.value) return;

  // NOTE: 需要安装依赖：monaco-editor
  // pnpm -F @vben/web-antd add monaco-editor
  // 先做最小接入（高亮/行号/编辑），worker 细节后面再补。
  const m = await import('monaco-editor');
  monaco = m;

  editor = monaco.editor.create(elRef.value, {
    value: props.modelValue ?? '',
    language: props.language ?? 'sql',
    automaticLayout: true,
    minimap: { enabled: false },
    mouseWheelScrollSensitivity: 1,
    fastScrollSensitivity: 5,
    fontSize: 13,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    scrollBeyondLastLine: false,
    roundedSelection: true,
    scrollbar: {
      // 某些容器/焦点组合下，默认滚轮体验会“像失效一样”
      // 这里显式放开并让编辑器获得焦点，保证滚轮一定生效
      alwaysConsumeMouseWheel: false,
    },
  });

  editor.onDidChangeModelContent(() => {
    if (updatingFromModel) return;
    emit('update:modelValue', editor.getValue());
  });

  // 保障滚轮滚动：只要滚轮进入编辑器区域就 focus
  onWheelFocus = () => {
    editor?.focus?.();
  };
  elRef.value.addEventListener('wheel', onWheelFocus, { passive: true });
}

onMounted(async () => {
  await setupEditor();
});

watch(
  () => props.modelValue,
  (v) => {
    if (!editor) return;
    const current = editor.getValue();
    if (current === v) return;
    updatingFromModel = true;
    editor.setValue(v ?? '');
    updatingFromModel = false;
  },
);

onBeforeUnmount(() => {
  if (elRef.value && onWheelFocus) {
    elRef.value.removeEventListener('wheel', onWheelFocus);
  }
  onWheelFocus = null;
  if (editor) {
    editor.dispose();
    editor = null;
  }
  monaco = null;
});
</script>

<template>
  <div
    ref="elRef"
    class="h-full w-full rounded-md border border-border bg-background"
    :style="{ height: height ? `${height}px` : '100%' }"
  ></div>
</template>
