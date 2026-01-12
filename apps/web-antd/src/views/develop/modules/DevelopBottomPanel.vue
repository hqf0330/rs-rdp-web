<script setup lang="ts">
import type { TableColumnsType } from 'ant-design-vue';

import type { BottomTabKey, RunRecord, RunStatus } from '../types';

import { IconifyIcon } from '@vben/icons';

import { Badge, Table, Tabs, Tag } from 'ant-design-vue';

defineOptions({ name: 'DevelopBottomPanel' });

defineProps<{
  activeTab: BottomTabKey;
  collapsed: boolean;
  historyColumns: TableColumnsType<RunRecord>;
  resultColumns: TableColumnsType;
  runs: RunRecord[];
  selectedRun?: RunRecord;
  statusTagColor: (s: RunStatus) => string;
}>();

const emit = defineEmits<{
  (e: 'update:collapsed', v: boolean): void;
  (e: 'update:activeTab', v: BottomTabKey): void;
  (e: 'openInstance', r: RunRecord): void;
}>();
</script>

<template>
  <div class="border-t border-border bg-background">
    <!-- 收起时的轻量 header -->
    <div
      class="flex cursor-pointer items-center justify-between px-3 py-1.5 hover:bg-accent/50"
      @click="emit('update:collapsed', !collapsed)"
    >
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <IconifyIcon
          :icon="collapsed ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          class="text-base"
        />
        <span>运行面板</span>
      </div>

      <Badge :count="runs.length" :show-zero="false" :offset="[6, 0]">
        <span class="text-xs text-muted-foreground">运行历史</span>
      </Badge>
    </div>

    <div v-show="!collapsed" class="h-[240px] border-t border-border">
      <Tabs
        :active-key="activeTab"
        class="h-full px-3 pt-1"
        @update:active-key="(v) => emit('update:activeTab', v as BottomTabKey)"
      >
        <Tabs.TabPane key="result" tab="结果">
          <div class="h-[180px] overflow-auto">
            <Table
              size="small"
              :columns="resultColumns"
              :data-source="selectedRun?.resultPreview || []"
              :pagination="false"
              row-key="__rowKey"
            />
            <div
              v-if="!selectedRun?.resultPreview"
              class="py-8 text-center text-sm text-muted-foreground"
            >
              暂无结果（先点运行生成 mock 结果）
            </div>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane key="log" tab="日志">
          <div
            class="h-[180px] overflow-auto rounded-md border border-border bg-card p-3"
          >
            <pre class="m-0 whitespace-pre-wrap text-xs">{{
              selectedRun?.log || '暂无日志'
            }}</pre>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane key="history" tab="运行历史">
          <div class="h-[180px] overflow-auto">
            <Table
              size="small"
              :columns="historyColumns"
              :data-source="runs"
              :pagination="false"
              row-key="id"
              :custom-row="
                (record) => ({ onClick: () => emit('openInstance', record) })
              "
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'status'">
                  <Tag :color="statusTagColor(record.status)">
                    {{ record.status }}
                  </Tag>
                </template>
              </template>
            </Table>
            <div
              v-if="runs.length === 0"
              class="py-8 text-center text-sm text-muted-foreground"
            >
              还没有运行记录
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </div>
</template>
