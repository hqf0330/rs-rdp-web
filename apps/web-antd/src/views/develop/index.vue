<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import DevelopBottomPanel from './modules/DevelopBottomPanel.vue';
import DevelopEditorArea from './modules/DevelopEditorArea.vue';
import DevelopInstanceDrawer from './modules/DevelopInstanceDrawer.vue';
import DevelopLeftPanel from './modules/DevelopLeftPanel.vue';
import { useDevelopMock } from './useDevelopMock';

defineOptions({ name: 'Develop' });

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
  handleStop,
  openInstance,

  instanceDrawerOpen,
} = useDevelopMock();
</script>

<template>
  <Page auto-content-height content-class="p-0">
    <div class="h-full w-full p-4">
      <div
        class="h-full w-full overflow-hidden rounded-md border border-border bg-background"
      >
        <div class="flex h-full w-full flex-col">
          <!-- main: left tree + right editor -->
          <div class="flex h-0 flex-1 overflow-hidden">
            <DevelopLeftPanel
              v-model:active-tab="activeMainTab"
              v-model:search="leftSearch"
              :tree-data="treeData"
              @tree-select="handleTreeSelect"
              @create="() => {}"
            />

            <DevelopEditorArea
              :opened-scripts="openedScripts"
              :active-script-id="activeScriptId"
              :active-script="activeScript"
              :dirty-map="dirtyMap"
              :schema="schema"
              :limit="limit"
              :engine="engine"
              @update:active-script-id="(v) => (activeScriptId = v)"
              @edit-tab="handleEditorTabEdit"
              @update:schema="(v) => (schema = v)"
              @update:limit="(v) => (limit = v)"
              @save="handleSave"
              @run="handleRun"
              @stop="handleStop"
              @update:content="setActiveScriptContent"
            />
          </div>

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
