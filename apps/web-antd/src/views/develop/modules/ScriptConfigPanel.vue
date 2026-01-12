<script setup lang="ts">
import type { ScriptItem } from '../types';

import { computed, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  Collapse,
  DatePicker,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  TimePicker,
} from 'ant-design-vue';

defineOptions({ name: 'ScriptConfigPanel' });

const props = defineProps<{
  open: boolean;
  script?: ScriptItem;
}>();

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void;
  (e: 'save'): void;
}>();

// ============= 折叠面板展开状态 =============
const activeKeys = ref<string[]>(['basic', 'schedule']);

// ============= Mock 数据 =============
const mockBasicInfo = {
  taskId: '10307212',
  owner: 'admin',
  description: 'TPCH 示例查询',
  runProperty: '正常调度',
  datasource: 'MySQL_prod', // 改成数据源
  schema: 'public',
  priority: 0,
};

const mockSchedule = {
  period: '每天调度',
  frequency: '执行一次',
  startTime: '00:00',
  startDate: '2026-01-10',
  endType: 'never' as 'never' | 'date',
  endDate: '2026-12-31',
  instanceGenMode: '发布后生效',
};

// 调度依赖 Mock 数据
const mockDependencies: {
  key: string;
  name: string;
  workspace: string;
  outputTable: string;
  period: string;
  startTime: string;
  addMethod: string;
  strategy: string;
}[] = [];

const selfDepend = ref(false);
const dependSearch = ref('');

const mockParams: {
  key: string;
  name: string;
  source: string;
  value: string;
  type: string;
  encrypt: boolean;
  ignore: boolean;
}[] = [];

const mockHistory = [
  {
    id: '1',
    time: '2026/01/10 00:49:39',
    user: 'admin',
    type: 'save',
  },
  {
    id: '2',
    time: '2026/01/09 15:30:00',
    user: 'admin',
    type: 'save',
  },
];

// ============= 表格列定义 =============
const dependColumns = [
  { title: '名称', dataIndex: 'name', width: 100, ellipsis: true },
  { title: '调度周期', dataIndex: 'period', width: 80 },
  { title: '依赖策略', dataIndex: 'strategy', width: 80 },
  { title: '操作', dataIndex: 'action', width: 60 },
];

const paramColumns = [
  { title: '参数名称', dataIndex: 'name', width: 100 },
  { title: '取值来源', dataIndex: 'source', width: 80 },
  { title: '参数取值', dataIndex: 'value', width: 100 },
  { title: '类型', dataIndex: 'type', width: 60 },
  { title: '操作', dataIndex: 'action', width: 60 },
];

const historyColumns = [
  { title: '修改时间', dataIndex: 'time', width: 140 },
  { title: '修改人', dataIndex: 'user', width: 80 },
  { title: '操作', dataIndex: 'action', width: 100 },
];

const panelTitle = computed(() => props.script?.name ?? '脚本配置');
</script>

<template>
  <div
    v-if="open"
    class="script-config-panel absolute right-0 top-0 z-10 h-full w-[480px] border-l border-border bg-background shadow-lg"
  >
    <!-- header -->
    <div
      class="flex items-center justify-between border-b border-border px-4 py-2"
    >
      <span class="font-medium">{{ panelTitle }}</span>
      <Button type="text" size="small" @click="emit('update:open', false)">
        <IconifyIcon icon="lucide:x" />
      </Button>
    </div>

    <!-- 可滚动的折叠面板区域 -->
    <div class="h-[calc(100%-100px)] overflow-y-auto">
      <Collapse
        v-model:activeKey="activeKeys"
        :bordered="false"
        expand-icon-position="end"
        class="config-collapse"
      >
        <!-- 基础信息 -->
        <Collapse.Panel key="basic" header="基础信息">
          <Form layout="vertical" size="small" class="px-1">
            <div class="grid grid-cols-2 gap-x-3">
              <Form.Item label="任务ID">
                <Input :value="mockBasicInfo.taskId" disabled />
              </Form.Item>
              <Form.Item label="负责人" required>
                <Select :value="mockBasicInfo.owner" style="width: 100%">
                  <Select.Option value="admin">admin</Select.Option>
                  <Select.Option value="binghu">binghu</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div class="grid grid-cols-2 gap-x-3">
              <Form.Item label="描述">
                <Input
                  :value="mockBasicInfo.description"
                  placeholder="请输入描述"
                />
              </Form.Item>
              <Form.Item label="运行属性">
                <Select :value="mockBasicInfo.runProperty" style="width: 100%">
                  <Select.Option value="正常调度">正常调度</Select.Option>
                  <Select.Option value="暂停调度">暂停调度</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div class="grid grid-cols-2 gap-x-3">
              <Form.Item label="数据源" required>
                <Select :value="mockBasicInfo.datasource" style="width: 100%">
                  <Select.Option value="MySQL_prod">MySQL_prod</Select.Option>
                  <Select.Option value="PostgreSQL_dev">
                    PostgreSQL_dev
                  </Select.Option>
                  <Select.Option value="ClickHouse_prod">
                    ClickHouse_prod
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Schema" required>
                <Select :value="mockBasicInfo.schema" style="width: 100%">
                  <Select.Option value="public">public</Select.Option>
                  <Select.Option value="default">default</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="任务优先级">
              <Select :value="mockBasicInfo.priority" style="width: 100%">
                <Select.Option :value="0">0</Select.Option>
                <Select.Option :value="1">1</Select.Option>
                <Select.Option :value="2">2</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Collapse.Panel>

        <!-- 调度定时 -->
        <Collapse.Panel key="schedule" header="调度定时">
          <Form layout="vertical" size="small" class="px-1">
            <Form.Item label="调度周期" required>
              <Select :value="mockSchedule.period" style="width: 100%">
                <Select.Option value="每天调度">每天调度</Select.Option>
                <Select.Option value="每周调度">每周调度</Select.Option>
                <Select.Option value="每月调度">每月调度</Select.Option>
                <Select.Option value="仅一次">仅一次</Select.Option>
              </Select>
            </Form.Item>

            <div class="grid grid-cols-2 gap-x-3">
              <Form.Item label="调度频率" required>
                <Select :value="mockSchedule.frequency" style="width: 100%">
                  <Select.Option value="执行一次">执行一次</Select.Option>
                  <Select.Option value="间隔执行">间隔执行</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="开始调度时间">
                <TimePicker
                  :value="null"
                  format="HH:mm"
                  style="width: 100%"
                  placeholder="00:00"
                />
              </Form.Item>
            </div>

            <Form.Item label="生效日期" required>
              <DatePicker
                :value="null"
                style="width: 100%"
                placeholder="2026-01-10"
              />
            </Form.Item>

            <Form.Item label="失效日期">
              <Radio.Group :value="mockSchedule.endType" class="mb-2">
                <Radio value="never">永不结束</Radio>
                <Radio value="date">指定日期</Radio>
              </Radio.Group>
              <DatePicker
                v-if="mockSchedule.endType === 'date'"
                :value="null"
                style="width: 100%"
                placeholder="2026-12-31"
              />
            </Form.Item>

            <Button type="link" class="px-0">
              <IconifyIcon icon="lucide:eye" class="mr-1" />
              预览调度时间
            </Button>
          </Form>
        </Collapse.Panel>

        <!-- 调度依赖（新增） -->
        <Collapse.Panel key="depend" header="调度依赖">
          <div class="px-1">
            <!-- 搜索上游任务 -->
            <div class="mb-3 flex items-center gap-2">
              <Input
                v-model:value="dependSearch"
                size="small"
                placeholder="请输入父节点名称或输出表名"
                class="flex-1"
              >
                <template #prefix>
                  <IconifyIcon
                    icon="lucide:search"
                    class="text-muted-foreground"
                  />
                </template>
              </Input>
              <Button size="small" type="primary">
                <IconifyIcon icon="lucide:sparkles" class="mr-1" />
                智能解析
              </Button>
            </div>

            <!-- 依赖表格 -->
            <Table
              :columns="dependColumns"
              :data-source="mockDependencies"
              :pagination="false"
              size="small"
              :scroll="{ y: 120 }"
            >
              <template #emptyText>
                <div class="py-4 text-center text-xs text-muted-foreground">
                  暂无依赖
                </div>
              </template>
              <template #bodyCell="{ column }">
                <template v-if="column.dataIndex === 'action'">
                  <Button type="link" size="small" danger class="px-0">
                    删除
                  </Button>
                </template>
              </template>
            </Table>

            <!-- 自依赖 -->
            <div class="mt-4 border-t border-border pt-3">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium">自依赖</span>
                <Switch v-model:checked="selfDepend" size="small" />
              </div>
              <p class="text-xs text-muted-foreground">
                开启对自身上一周期实例的依赖。如果上一周期失败，会阻塞新一轮调度运行。
              </p>
            </div>

            <!-- 预览依赖关系 -->
            <Button type="link" class="mt-3 px-0">
              <IconifyIcon icon="lucide:eye" class="mr-1" />
              预览依赖关系
            </Button>
          </div>
        </Collapse.Panel>

        <!-- 实例信息 -->
        <Collapse.Panel key="instance" header="实例信息">
          <Form layout="vertical" size="small" class="px-1">
            <Form.Item label="实例生成方式" required>
              <Select :value="mockSchedule.instanceGenMode" style="width: 100%">
                <Select.Option value="发布后生效">发布后生效</Select.Option>
                <Select.Option value="立即生效">立即生效</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Collapse.Panel>

        <!-- 参数配置 -->
        <Collapse.Panel key="params" header="参数配置">
          <div class="px-1">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                共 {{ mockParams.length }} 参数
              </span>
              <Space size="small">
                <Button size="small">预览</Button>
                <Button size="small">加载</Button>
                <Button size="small" type="primary">
                  <IconifyIcon icon="lucide:plus" class="mr-1" />
                  新建
                </Button>
              </Space>
            </div>
            <div
              class="mb-2 rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-600"
            >
              在代码中通过${参数名}的方式定义变量，任务运行时会动态替换
            </div>
            <Table
              :columns="paramColumns"
              :data-source="mockParams"
              :pagination="false"
              size="small"
              :scroll="{ y: 150 }"
            >
              <template #emptyText>
                <div class="py-4 text-center text-xs text-muted-foreground">
                  暂无参数
                </div>
              </template>
            </Table>
          </div>
        </Collapse.Panel>

        <!-- 历史版本 -->
        <Collapse.Panel key="history" header="历史版本">
          <div class="px-1">
            <Tabs default-active-key="save" size="small">
              <Tabs.TabPane key="save" tab="保存历史">
                <Table
                  :columns="historyColumns"
                  :data-source="mockHistory"
                  :pagination="false"
                  size="small"
                  row-key="id"
                >
                  <template #bodyCell="{ column }">
                    <template v-if="column.dataIndex === 'action'">
                      <Space size="small">
                        <Button type="link" size="small" class="px-0">
                          查看
                        </Button>
                        <Button type="link" size="small" class="px-0">
                          回滚
                        </Button>
                      </Space>
                    </template>
                  </template>
                </Table>
              </Tabs.TabPane>
              <Tabs.TabPane key="commit" tab="提交版本">
                <div class="py-4 text-center text-xs text-muted-foreground">
                  暂无提交版本
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>

    <!-- footer -->
    <div
      class="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 border-t border-border bg-background px-4 py-3"
    >
      <Button @click="emit('update:open', false)">取消</Button>
      <Button type="primary" @click="emit('save')">确定</Button>
    </div>
  </div>
</template>

<style scoped>
/* 折叠面板样式优化 */
.config-collapse :deep(.ant-collapse-header) {
  padding: 10px 16px !important;
  font-weight: 500;
  background: var(--color-background-soft, #fafafa);
}

.config-collapse :deep(.ant-collapse-content-box) {
  padding: 12px 16px !important;
}

.config-collapse :deep(.ant-collapse-item) {
  border-bottom: 1px solid var(--color-border, #f0f0f0);
}

/* 表单项更紧凑 */
.config-collapse :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.config-collapse :deep(.ant-form-item-label) {
  padding-bottom: 4px;
}

.config-collapse :deep(.ant-form-item-label > label) {
  font-size: 12px;
  color: var(--color-muted-foreground, #666);
}
</style>
