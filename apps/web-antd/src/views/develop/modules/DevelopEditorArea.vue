<script setup lang="ts">
import type { ScriptItem } from '../types';

import { Button, Divider, Select, Space, Tabs, Tag } from 'ant-design-vue';

import MonacoSqlEditor from './MonacoSqlEditor.vue';

defineOptions({ name: 'DevelopEditorArea' });

defineProps<{
  activeScript?: ScriptItem;
  activeScriptId: string;
  dirtyMap: Record<string, boolean>;
  engine: string;
  limit: number;
  openedScripts: ScriptItem[];
  schema: string;
}>();

const emit = defineEmits<{
  (e: 'update:activeScriptId', v: string): void;
  (e: 'editTab', targetKey: any, action: 'add' | 'remove'): void;
  (e: 'update:schema', v: string): void;
  (e: 'update:limit', v: number): void;
  (e: 'save'): void;
  (e: 'run'): void;
  (e: 'stop'): void;
  (e: 'update:content', v: string): void;
}>();
</script>

<template>
  <div class="develop-editor-area flex h-full min-w-0 flex-1 flex-col">
    <!-- editor tabs -->
    <div class="border-b border-border bg-background px-0 pt-0">
      <Tabs
        :active-key="activeScriptId"
        type="editable-card"
        hide-add
        size="small"
        @update:active-key="(v) => emit('update:activeScriptId', String(v))"
        @edit="(targetKey, action) => emit('editTab', targetKey, action as any)"
      >
        <Tabs.TabPane
          v-for="s in openedScripts"
          :key="s.id"
          :tab="s.name"
          closable
        >
          <template #tab>
            <div class="flex items-center gap-2">
              <span class="max-w-[260px] truncate">{{ s.name }}</span>
              <span v-if="dirtyMap[s.id]" class="text-red-500">●</span>
            </div>
          </template>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <!-- toolbar -->
    <div
      class="flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-1"
    >
      <Space size="small" wrap>
        <Tag color="default">未提交</Tag>
        <Tag color="default">{ } 参数 0</Tag>
        <Tag color="default">调度</Tag>
        <Divider type="vertical" />
        <Button size="small" type="text" @click="emit('save')">保存代码</Button>
        <Divider type="vertical" />
        <Space size="small">
          <span class="text-xs text-muted-foreground">Schema</span>
          <Select
            :value="schema"
            size="small"
            style="width: 140px"
            @update:value="(v) => emit('update:schema', String(v))"
          >
            <Select.Option value="public">public</Select.Option>
            <Select.Option value="default">default</Select.Option>
          </Select>
        </Space>
      </Space>

      <Space size="small">
        <Tag color="default">{{ engine }}</Tag>
        <Select
          :value="limit"
          size="small"
          style="width: 96px"
          @update:value="(v) => emit('update:limit', Number(v))"
        >
          <Select.Option :value="100">100</Select.Option>
          <Select.Option :value="1000">1000</Select.Option>
          <Select.Option :value="5000">5000</Select.Option>
        </Select>
        <Button size="small" type="primary" @click="emit('run')">运行</Button>
        <Button size="small" @click="emit('stop')">停止</Button>
        <Button type="default" disabled>提交</Button>
      </Space>
    </div>

    <!-- editor -->
    <div class="h-0 flex-1 overflow-auto bg-background px-4 py-3">
      <template v-if="activeScript">
        <MonacoSqlEditor
          :model-value="activeScript.content"
          language="sql"
          @update:model-value="(v) => emit('update:content', v)"
        />
      </template>
      <template v-else>
        <div class="p-6 text-sm text-muted-foreground">
          未打开脚本（点击左侧树打开）
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 压缩 tabs 的高度（更接近 Lakehouse 的“薄”样式） */
.develop-editor-area :deep(.ant-tabs-nav) {
  margin: 0;
}
.develop-editor-area :deep(.ant-tabs-tab) {
  padding: 0 8px;
  font-size: 12px;
  line-height: 26px;
  min-height: 28px;
}
.develop-editor-area :deep(.ant-tabs-tab-remove) {
  margin-left: 6px;
  transform: scale(0.9);
}

/* editable-card 模式下的 tab 本身更高，这里再压一档 */
.develop-editor-area :deep(.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab) {
  padding: 0 8px;
  height: 28px;
  line-height: 26px;
}
</style>
