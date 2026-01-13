<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DevelopDatasourceApi } from '#/api/develop/datasource';

import { ref } from 'vue';

import { confirm, Page, useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message, Switch, Tag } from 'ant-design-vue';

import { ACTION_ICON, TableAction, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteDatasource,
  getDatasourcePage,
  testDatasourceConnectionById,
  updateDatasourceStatus,
} from '#/api/develop/datasource';
import { $t } from '#/locales';

import { useGridColumns, useSearchSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

/** 刷新表格 */
function handleRefresh() {
  gridApi.query();
}

/** 创建数据源 */
function handleCreate() {
  formModalApi.setData(null).open();
}

/** 编辑数据源 */
function handleEdit(row: DevelopDatasourceApi.Datasource) {
  formModalApi.setData(row).open();
}

/** 删除数据源 */
async function handleDelete(row: DevelopDatasourceApi.Datasource) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
  });
  try {
    await deleteDatasource(row.id!);
    message.success($t('ui.actionMessage.deleteSuccess', [row.name]));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

/** 测试连接（已保存的数据源，根据ID测试） */
async function handleTestConnection(row: DevelopDatasourceApi.Datasource) {
  const hideLoading = message.loading({
    content: '正在测试连接...',
    duration: 0,
  });
  try {
    const success = await testDatasourceConnectionById(row.id!);
    if (success) {
      message.success('连接成功');
    } else {
      message.error('连接失败');
    }
  } catch {
    message.error('连接测试失败');
  } finally {
    hideLoading();
  }
}

/** 切换状态 */
async function handleStatusChange(row: DevelopDatasourceApi.Datasource, checked: boolean) {
  const newStatus = checked ? 1 : 0;
  const hideLoading = message.loading({
    content: '正在更新状态...',
    duration: 0,
  });
  try {
    await updateDatasourceStatus(row.id!, newStatus);
    row.status = newStatus;
    message.success('状态更新成功');
  } catch {
    message.error('状态更新失败');
  } finally {
    hideLoading();
  }
}

/** 批量删除 */
async function handleDeleteBatch() {
  await confirm($t('ui.actionMessage.deleteBatchConfirm'));
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deletingBatch'),
    duration: 0,
  });
  try {
    for (const id of checkedIds.value) {
      await deleteDatasource(id);
    }
    checkedIds.value = [];
    message.success($t('ui.actionMessage.deleteSuccess'));
    handleRefresh();
  } finally {
    hideLoading();
  }
}

const checkedIds = ref<number[]>([]);
function handleRowCheckboxChange({
  records,
}: {
  records: DevelopDatasourceApi.Datasource[];
}) {
  checkedIds.value = records.map((item) => item.id!);
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useSearchSchema(),
  },
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getDatasourcePage({
            pageNo: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<DevelopDatasourceApi.Datasource>,
  gridEvents: {
    checkboxAll: handleRowCheckboxChange,
    checkboxChange: handleRowCheckboxChange,
  },
});
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="handleRefresh" />
    <Grid table-title="数据源列表">
      <template #toolbar-tools>
        <TableAction
          :actions="[
            {
              label: $t('ui.actionTitle.create', ['数据源']),
              type: 'primary',
              icon: ACTION_ICON.ADD,
              // auth: ['develop:datasource:create'], // 暂时去掉权限控制
              onClick: handleCreate,
            },
            {
              label: $t('ui.actionTitle.deleteBatch'),
              type: 'primary',
              danger: true,
              icon: ACTION_ICON.DELETE,
              disabled: isEmpty(checkedIds),
              // auth: ['develop:datasource:delete'], // 暂时去掉权限控制
              onClick: handleDeleteBatch,
            },
          ]"
        />
      </template>
      <template #status="{ row }">
        <Switch
          :checked="row.status === 1"
          checked-children="启用"
          un-checked-children="禁用"
          @change="(checked: boolean) => handleStatusChange(row, checked)"
        />
      </template>
      <template #actions="{ row }">
        <TableAction
          :actions="[
            {
              label: '测试',
              type: 'link',
              icon: 'lucide:plug',
              onClick: handleTestConnection.bind(null, row),
            },
            {
              label: $t('common.edit'),
              type: 'link',
              icon: ACTION_ICON.EDIT,
              // auth: ['develop:datasource:update'], // 暂时去掉权限控制
              onClick: handleEdit.bind(null, row),
            },
            {
              label: $t('common.delete'),
              type: 'link',
              danger: true,
              icon: ACTION_ICON.DELETE,
              // auth: ['develop:datasource:delete'], // 暂时去掉权限控制
              popConfirm: {
                title: $t('ui.actionMessage.deleteConfirm', [row.name]),
                confirm: handleDelete.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </Grid>
  </Page>
</template>
