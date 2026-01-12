<script setup lang="ts">
import type { RunRecord, RunStatus } from '../types';

import { Descriptions, Divider, Drawer, Tag } from 'ant-design-vue';

defineOptions({ name: 'DevelopInstanceDrawer' });

defineProps<{
  engine: string;
  limit: number;
  open: boolean;
  schema: string;
  selectedRun?: RunRecord;
  statusTagColor: (s: RunStatus) => string;
}>();

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void;
}>();
</script>

<template>
  <Drawer
    :open="open"
    title="实例信息（mock）"
    width="520"
    @update:open="(v) => emit('update:open', v)"
  >
    <template v-if="selectedRun">
      <Descriptions bordered size="small" :column="1">
        <Descriptions.Item label="实例ID">
          {{ selectedRun.id }}
        </Descriptions.Item>
        <Descriptions.Item label="脚本">
          {{ selectedRun.scriptName }}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag :color="statusTagColor(selectedRun.status)">
            {{ selectedRun.status }}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="开始时间">
          {{ selectedRun.startAt }}
        </Descriptions.Item>
        <Descriptions.Item label="结束时间">
          {{ selectedRun.endAt || '-' }}
        </Descriptions.Item>
        <Descriptions.Item label="耗时(ms)">
          {{ selectedRun.durationMs ?? '-' }}
        </Descriptions.Item>
        <Descriptions.Item label="行数">
          {{ selectedRun.rows ?? '-' }}
        </Descriptions.Item>
        <Descriptions.Item label="引擎">{{ engine }}</Descriptions.Item>
        <Descriptions.Item label="Schema">{{ schema }}</Descriptions.Item>
        <Descriptions.Item label="Limit">{{ limit }}</Descriptions.Item>
      </Descriptions>

      <Divider />
      <div class="mb-2 text-sm text-muted-foreground">日志</div>
      <div
        class="max-h-[240px] overflow-auto rounded-md border border-border bg-card p-3"
      >
        <pre class="m-0 whitespace-pre-wrap text-xs">{{ selectedRun.log }}</pre>
      </div>
    </template>
    <template v-else>
      <div class="text-sm text-muted-foreground">未选择实例</div>
    </template>
  </Drawer>
</template>
