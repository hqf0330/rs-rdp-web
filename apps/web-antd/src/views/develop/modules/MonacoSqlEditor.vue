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
  (e: 'runStatement', statement: string, lineNumber: number): void;
}>();

const elRef = ref<HTMLDivElement | null>(null);

let editor: any;
let monaco: any;
let updatingFromModel = false;
let onWheelFocus: ((e: WheelEvent) => void) | null = null;
let decorations: string[] = [];
let hoverDecorations: string[] = [];
let cachedStatements: StatementLine[] = [];

interface StatementLine {
  line: number;
  endLine: number;
  statement: string;
}

// 简单解析 SQL：找到每个语句的起始行号和结束行号（以分号分割）
function parseStatementLines(text: string): StatementLine[] {
  const lines = text.split('\n');
  const result: StatementLine[] = [];
  let currentStatement = '';
  let startLine = 0;

  for (const [i, line] of lines.entries()) {
    const trimmed = line.trim();

    // 跳过空行和纯注释行
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    // 记录语句开始行号（1-based）
    if (!currentStatement) {
      startLine = i + 1;
    }

    currentStatement = `${currentStatement}${line}\n`;

    // 如果行以分号结尾，说明语句结束
    if (trimmed.endsWith(';')) {
      result.push({
        line: startLine,
        endLine: i + 1,
        statement: currentStatement.trim(),
      });
      currentStatement = '';
      startLine = 0;
    }
  }

  // 处理最后一个没有分号的语句
  if (currentStatement.trim()) {
    result.push({
      line: startLine,
      endLine: lines.length,
      statement: currentStatement.trim(),
    });
  }

  return result;
}

// 更新 gutter 装饰器（绿色播放按钮）
function updateGutterDecorations() {
  if (!editor || !monaco) return;

  const text = editor.getValue();
  cachedStatements = parseStatementLines(text);

  const newDecorations = cachedStatements.map((s) => ({
    range: new monaco.Range(s.line, 1, s.line, 1),
    options: {
      glyphMarginClassName: 'sql-run-glyph',
      glyphMarginHoverMessage: {
        value: `运行此语句 (第 ${s.line}-${s.endLine} 行)`,
      },
      stickiness:
        monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    },
  }));

  decorations = editor.deltaDecorations(decorations, newDecorations);
}

// 高亮语句所在的代码块
function highlightStatement(stmt: null | StatementLine) {
  if (!editor || !monaco) return;

  if (!stmt) {
    // 清除高亮
    hoverDecorations = editor.deltaDecorations(hoverDecorations, []);
    return;
  }

  // 高亮从 startLine 到 endLine
  hoverDecorations = editor.deltaDecorations(hoverDecorations, [
    {
      range: new monaco.Range(stmt.line, 1, stmt.endLine, 1),
      options: {
        isWholeLine: true,
        className: 'sql-statement-highlight',
      },
    },
  ]);
}

// 处理 glyph margin 点击
function handleGlyphClick(e: any) {
  if (!e.target?.type) return;
  // type 2 = GLYPH_MARGIN
  if (e.target.type !== 2) return;

  const lineNumber = e.target.position?.lineNumber;
  if (!lineNumber) return;

  const stmt = cachedStatements.find((s) => s.line === lineNumber);
  if (stmt) {
    emit('runStatement', stmt.statement, lineNumber);
  }
}

// 处理鼠标移动（hover 高亮）
function handleMouseMove(e: any) {
  if (!e.target?.type) {
    highlightStatement(null);
    return;
  }

  // type 2 = GLYPH_MARGIN
  if (e.target.type === 2) {
    const lineNumber = e.target.position?.lineNumber;
    const stmt = cachedStatements.find((s) => s.line === lineNumber);
    highlightStatement(stmt ?? null);
  } else {
    highlightStatement(null);
  }
}

// 处理鼠标离开
function handleMouseLeave() {
  highlightStatement(null);
}

async function setupEditor() {
  if (!elRef.value) return;

  const m = await import('monaco-editor');
  monaco = m;

  editor = monaco.editor.create(elRef.value, {
    value: props.modelValue ?? '',
    language: props.language ?? 'sql',
    automaticLayout: true,
    minimap: { enabled: false },
    glyphMargin: true, // 启用 glyph margin
    mouseWheelScrollSensitivity: 1,
    fastScrollSensitivity: 5,
    fontSize: 13,
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    scrollBeyondLastLine: false,
    roundedSelection: true,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
    },
  });

  editor.onDidChangeModelContent(() => {
    if (updatingFromModel) return;
    emit('update:modelValue', editor.getValue());
    // 内容变化时更新装饰器
    updateGutterDecorations();
  });

  // 监听 glyph margin 点击
  editor.onMouseDown(handleGlyphClick);

  // 监听鼠标移动（hover 高亮）
  editor.onMouseMove(handleMouseMove);
  editor.onMouseLeave(handleMouseLeave);

  // 初始化装饰器
  updateGutterDecorations();

  // 保障滚轮滚动
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
    // modelValue 变化时更新装饰器
    updateGutterDecorations();
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
    class="monaco-sql-editor h-full w-full rounded-md border border-border bg-background"
    :style="{ height: height ? `${height}px` : '100%' }"
  ></div>
</template>

<style>
/* 绿色播放按钮图标（在 Monaco glyph margin 中显示） */
.sql-run-glyph {
  cursor: pointer !important;
  opacity: 0.6;
  transition: opacity 0.15s;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2322c55e'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
  background-size: 18px 18px;
  background-repeat: no-repeat;
  background-position: center;
}
.sql-run-glyph:hover {
  opacity: 1;
}

/* 语句代码块高亮（hover 时显示） */
.sql-statement-highlight {
  background-color: rgba(34, 197, 94, 0.1) !important;
}
</style>
