<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import DevelopBottomPanel from './modules/DevelopBottomPanel.vue';
import DevelopEditorArea from './modules/DevelopEditorArea.vue';
import DevelopInstanceDrawer from './modules/DevelopInstanceDrawer.vue';
import DevelopLeftPanel from './modules/DevelopLeftPanel.vue';
import { useDevelopMock } from './useDevelopMock';

defineOptions({ name: 'Develop' });

// ============= 左侧面板可拖拽调整宽度 =============
const leftPanelWidth = ref(280);
const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
let isDragging = false;

function onResizerMouseDown(e: MouseEvent) {
  isDragging = true;
  const startX = e.clientX;
  const startWidth = leftPanelWidth.value;

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isDragging) return;
    const delta = moveEvent.clientX - startX;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
    leftPanelWidth.value = newWidth;
  };

  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

// NOTE: 模板里不要用 vm.xxx（嵌套 ref 不会自动解包，会导致 TS 报错）
const {
  activeMainTab,
  leftSearch,
  treeData,

  openedScripts,
  activeScriptId,
  activeScript,
  dirtyMap,
  handleEditorTabEdit,
  handleTreeSelect,
  setActiveScriptContent,
  handleSave,

  profile,
  engine,
  schema,
  limit,

  bottomPanelCollapsed,
  activeBottomTab,
  runs,
  selectedRun,
  resultColumns,
  historyColumns,
  statusTagColor,
  handleRun,
  handleRunStatement,
  handleStop,
  openInstance,

  instanceDrawerOpen,

  handleSubmit,
} = useDevelopMock();
</script>

<template>
  <Page auto-content-height content-class="p-0">
    <div class="h-full w-full p-4">
      <div
        class="h-full w-full overflow-hidden rounded-md border border-border bg-background"
      >
        <div class="flex h-full w-full">
          <!-- left: 目录树（全高，可拖拽调整宽度） -->
          <DevelopLeftPanel
            v-model:active-tab="activeMainTab"
            v-model:search="leftSearch"
            :tree-data="treeData"
            :style="{ width: `${leftPanelWidth}px` }"
            @tree-select="handleTreeSelect"
            @create="() => {}"
          />

          <!-- resizer: 拖拽调整宽度 -->
          <div
            class="resizer h-full w-1 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-primary/30"
            @mousedown="onResizerMouseDown"
          ></div>

          <!-- right: 编辑区 + 底部面板（垂直布局） -->
          <div class="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
            <DevelopEditorArea
              :opened-scripts="openedScripts"
              :active-script-id="activeScriptId"
              :active-script="activeScript"
              :dirty-map="dirtyMap"
              :schema="schema"
              :limit="limit"
              :engine="engine"
              :profile="profile"
              @update:active-script-id="(v) => (activeScriptId = v)"
              @edit-tab="handleEditorTabEdit"
              @update:schema="(v) => (schema = v)"
              @update:limit="(v) => (limit = v)"
              @update:profile="(v) => (profile = v)"
              @save="handleSave"
              @run="handleRun"
              @run-statement="handleRunStatement"
              @stop="handleStop"
              @submit="handleSubmit"
              @update:content="setActiveScriptContent"
            />

            <DevelopBottomPanel
              v-model:collapsed="bottomPanelCollapsed"
              v-model:active-tab="activeBottomTab"
              :runs="runs"
              :selected-run="selectedRun"
              :result-columns="resultColumns"
              :history-columns="historyColumns"
              :status-tag-color="statusTagColor"
              @open-instance="openInstance"
            />
          </div>
        </div>
      </div>

      <DevelopInstanceDrawer
        v-model:open="instanceDrawerOpen"
        :selected-run="selectedRun"
        :engine="engine"
        :schema="schema"
        :limit="limit"
        :status-tag-color="statusTagColor"
      />
    </div>
  </Page>
</template>
