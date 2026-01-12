<script setup lang="ts">
import type { TreeProps } from 'ant-design-vue';

import type { MainTabKey } from '../types';

import { Button, Input, Tabs, Tag, Tooltip, Tree } from 'ant-design-vue';

defineOptions({ name: 'DevelopLeftPanel' });

defineProps<{
  activeTab: MainTabKey;
  search: string;
  treeData: TreeProps['treeData'];
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', v: MainTabKey): void;
  (e: 'update:search', v: string): void;
  (e: 'treeSelect', keys: (number | string)[]): void;
  (e: 'create'): void;
}>();
</script>

<template>
  <div
    class="develop-left-panel w-[320px] shrink-0 border-r border-border bg-background"
  >
    <div class="px-1 pt-0">
      <Tabs
        :active-key="activeTab"
        size="small"
        @update:active-key="(v) => emit('update:activeTab', v as MainTabKey)"
      >
        <Tabs.TabPane key="task" tab="任务" />
        <Tabs.TabPane key="taskGroup" tab="任务组" />
        <Tabs.TabPane key="data" tab="数据" />
      </Tabs>
    </div>

    <div class="px-2 pb-2 pt-1">
      <div class="flex items-center gap-2">
        <Input
          :value="search"
          allow-clear
          placeholder="搜索"
          @update:value="(v) => emit('update:search', v)"
        />
        <Tooltip title="新建（mock）">
          <Button size="small" type="primary" @click="emit('create')">+</Button>
        </Tooltip>
      </div>
    </div>

    <div class="h-[calc(100%-70px)] overflow-auto px-2 pb-2">
      <template v-if="activeTab !== 'data'">
        <Tree
          :tree-data="treeData"
          block-node
          show-icon
          @select="(keys) => emit('treeSelect', keys as any)"
        />
      </template>
      <template v-else>
        <div class="p-2 text-sm">
          <div class="mb-2 text-muted-foreground">数据（mock）</div>
          <div class="space-y-2">
            <div class="rounded-md border border-border p-3">
              <div class="flex items-center justify-between">
                <div class="font-medium">LAKEHOUSE_quick_start</div>
                <Tag color="green">连接成功</Tag>
              </div>
              <div class="mt-1 text-xs text-muted-foreground">
                Default datasource for quick_start
              </div>
            </div>
            <div class="rounded-md border border-border p-3">
              <div class="flex items-center justify-between">
                <div class="font-medium">MySQL_demo</div>
                <Tag>未配置</Tag>
              </div>
              <div class="mt-1 text-xs text-muted-foreground">
                示例占位：后续可接数据源管理
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 压缩左侧 Tabs（任务/任务组/数据）的高度 */
.develop-left-panel :deep(.ant-tabs-nav) {
  margin: 0;
}
.develop-left-panel :deep(.ant-tabs-tab) {
  padding: 0 8px;
  font-size: 12px;
  line-height: 26px;
  min-height: 28px;
}
</style>
