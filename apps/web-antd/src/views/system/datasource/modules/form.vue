<script lang="ts" setup>
import type { DevelopDatasourceApi } from '#/api/develop/datasource';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createDatasource,
  getDatasource,
  testDatasourceConnection,
  updateDatasource,
} from '#/api/develop/datasource';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<DevelopDatasourceApi.Datasource>();
const testing = ref(false);

const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['数据源'])
    : $t('ui.actionTitle.create', ['数据源']);
});

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    formItemClass: 'col-span-2',
    labelWidth: 100,
  },
  layout: 'horizontal',
  schema: useFormSchema(),
  showDefaultActions: false,
});

/** 测试连接 */
async function handleTestConnection() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }
  testing.value = true;
  try {
    const data = (await formApi.getValues()) as DevelopDatasourceApi.Datasource;
    const success = await testDatasourceConnection(data);
    if (success) {
      message.success('连接成功');
    } else {
      message.error('连接失败');
    }
  } catch {
    message.error('连接测试失败');
  } finally {
    testing.value = false;
  }
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    modalApi.lock();
    const data = (await formApi.getValues()) as DevelopDatasourceApi.Datasource;
    try {
      await (formData.value?.id
        ? updateDatasource(data)
        : createDatasource(data));
      await modalApi.close();
      emit('success');
      message.success($t('ui.actionMessage.operationSuccess'));
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }
    const data = modalApi.getData<DevelopDatasourceApi.Datasource>();
    if (!data || !data.id) {
      return;
    }
    modalApi.lock();
    try {
      formData.value = await getDatasource(data.id);
      await formApi.setValues(formData.value);
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-[600px]">
    <Form class="mx-4" />
    <template #prepend-footer>
      <Button :loading="testing" @click="handleTestConnection">
        测试连接
      </Button>
    </template>
  </Modal>
</template>
