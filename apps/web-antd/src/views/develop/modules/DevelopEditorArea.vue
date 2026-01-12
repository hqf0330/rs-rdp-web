<script setup lang="ts">
import type { ScriptItem } from '../types';

import { IconifyIcon } from '@vben/icons';

import { Button, Divider, Dropdown, Menu, Select, Space, Tabs, Tag, Tooltip } from 'ant-design-vue';

import MonacoSqlEditor from './MonacoSqlEditor.vue';

defineOptions({ name: 'DevelopEditorArea' });

defineProps<{
  activeScript?: ScriptItem;
  activeScriptId: string;
  dirtyMap: Record<string, boolean>;
  engine: string;
  limit: number;
  openedScripts: ScriptItem[];
  profile: string;
  schema: string;
}>();

const emit = defineEmits<{
  (e: 'update:activeScriptId', v: string): void;
  (e: 'editTab', targetKey: any, action: 'add' | 'remove'): void;
  (e: 'update:schema', v: string): void;
  (e: 'update:limit', v: number): void;
  (e: 'update:profile', v: string): void;
  (e: 'save'): void;
  (e: 'run'): void;
  (e: 'runStatement', statement: string, lineNumber: number): void;
  (e: 'stop'): void;
  (e: 'submit'): void;
  (e: 'update:content', v: string): void;
}>();
</script>

<template>
  <div class="develop-editor-area flex h-0 min-w-0 flex-1 flex-col">
    <!-- editor tabs -->
    <div class="flex items-center border-b border-border bg-background px-0 pt-0">
      <Tabs
        class="flex-1"
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
            <div class="flex items-center gap-1">
              <IconifyIcon class="text-blue-500" icon="lucide:file-code" />
              <span class="max-w-[200px] truncate">{{ s.name }}</span>
              <span v-if="dirtyMap[s.id]" class="text-red-500">●</span>
            </div>
          </template>
        </Tabs.TabPane>
      </Tabs>
      <!-- 新建 Tab 按钮 -->
      <Tooltip title="新建脚本">
        <Button
          class="mr-2"
          size="small"
          type="text"
          @click="emit('editTab', null, 'add')"
        >
          <IconifyIcon icon="lucide:plus" />
        </Button>
      </Tooltip>
    </div>

    <!-- toolbar -->
    <div
      class="flex items-center justify-between gap-3 border-b border-border bg-background px-3 py-1.5"
    >
      <!-- left group -->
      <div class="flex items-center gap-2">
        <Tag color="default">未提交</Tag>
        <Tag color="default">{} 参数 0</Tag>
        <Tag color="default">调度</Tag>

        <Divider type="vertical" class="mx-1" />

        <Button size="small" type="primary" @click="emit('save')">
          <template #icon>
            <IconifyIcon icon="lucide:save" />
          </template>
          保存代码
        </Button>

        <Divider type="vertical" class="mx-1" />

        <div class="flex items-center gap-1">
          <span class="text-xs text-muted-foreground">Schema</span>
          <Select
            :value="schema"
            size="small"
            style="width: 100px"
            @update:value="(v) => emit('update:schema', String(v))"
          >
            <Select.Option value="public">public</Select.Option>
            <Select.Option value="default">default</Select.Option>
          </Select>
        </div>
      </div>

      <!-- right group -->
      <div class="flex items-center gap-2">
        <!-- icon tool strip (简化：只保留常用的) -->
        <Tooltip title="撤销">
          <Button size="small" type="text">
            <IconifyIcon icon="lucide:undo-2" />
          </Button>
        </Tooltip>
        <Tooltip title="重做">
          <Button size="small" type="text">
            <IconifyIcon icon="lucide:redo-2" />
          </Button>
        </Tooltip>
        <Tooltip title="格式化">
          <Button size="small" type="text">
            <IconifyIcon icon="lucide:wand-2" />
          </Button>
        </Tooltip>
        <Tooltip title="查找">
          <Button size="small" type="text">
            <IconifyIcon icon="lucide:search" />
          </Button>
        </Tooltip>
        <Tooltip title="下载">
          <Button size="small" type="text">
            <IconifyIcon icon="lucide:download" />
          </Button>
        </Tooltip>

        <Divider type="vertical" class="mx-1" />

        <!-- 数据源选择 -->
        <div class="flex items-center gap-1">
          <span class="text-xs text-muted-foreground">数据源</span>
          <Select
            :value="profile"
            size="small"
            style="width: 140px"
            @update:value="(v) => emit('update:profile', String(v))"
          >
            <Select.Option value="DEFAULT">MySQL_prod</Select.Option>
            <Select.Option value="DEV">PostgreSQL_dev</Select.Option>
            <Select.Option value="PROD">ClickHouse_prod</Select.Option>
          </Select>
        </div>

        <!-- Run button：Lakehouse 风格一体式绿色按钮 "▶ 1000 ∨" -->
        <Dropdown :trigger="['click']" placement="bottomRight">
          <button class="lh-run-btn" @click.stop="emit('run')">
            <IconifyIcon icon="lucide:play" class="mr-1" />
            <span class="lh-run-limit">{{ limit }}</span>
            <span class="lh-run-divider" @click.stop></span>
            <IconifyIcon icon="lucide:chevron-down" class="lh-run-arrow" />
          </button>
          <template #overlay>
            <Menu @click="(e) => emit('update:limit', Number((e as any).key))">
              <Menu.Item key="100">100 条</Menu.Item>
              <Menu.Item key="1000">1000 条</Menu.Item>
              <Menu.Item key="5000">5000 条</Menu.Item>
            </Menu>
          </template>
        </Dropdown>

        <Button size="small" @click="emit('stop')">停止</Button>
        <Button size="small" type="primary" @click="emit('submit')">提交</Button>
      </div>
    </div>

    <!-- editor -->
    <div class="h-0 flex-1 overflow-auto bg-background px-4 py-3">
      <template v-if="activeScript">
        <MonacoSqlEditor
          :model-value="activeScript.content"
          language="sql"
          @update:model-value="(v) => emit('update:content', v)"
          @run-statement="(stmt, line) => emit('runStatement', stmt, line)"
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

/* Lakehouse 风格：一体式绿色 Run 按钮 */
.lh-run-btn {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 6px 0 10px;
  font-size: 14px;
  font-weight: 400;
  color: white;
  background: rgb(34 197 94); /* green-500 */
  border: 1px solid rgb(34 197 94);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}
.lh-run-btn:hover {
  background: rgb(22 163 74); /* green-600 */
  border-color: rgb(22 163 74);
}
.lh-run-btn:active {
  background: rgb(21 128 61); /* green-700 */
  border-color: rgb(21 128 61);
}

/* 数字样式 */
.lh-run-limit {
  font-variant-numeric: tabular-nums;
}

/* 分割线 */
.lh-run-divider {
  width: 1px;
  height: 14px;
  margin: 0 6px;
  background: rgba(255, 255, 255, 0.3);
}

/* 下拉箭头 */
.lh-run-arrow {
  font-size: 12px;
}
</style>
