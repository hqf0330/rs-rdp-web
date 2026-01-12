import type { TableColumnsType, TreeProps } from 'ant-design-vue';

import type {
  BottomTabKey,
  MainTabKey,
  RunRecord,
  RunStatus,
  ScriptItem,
} from './types';

import { computed, reactive, ref } from 'vue';

import { message } from 'ant-design-vue';

import { MOCK_SCRIPTS, mockResultFor, nowStr } from './mock';

export function useDevelopMock() {
  // ============= mock: workspace & datasource =============
  const workspace = ref('quick_start');
  // 数据源选择（JDBC 连接）
  const profile = ref<'DEFAULT' | 'DEV' | 'PROD'>('DEFAULT');
  // 引擎类型（当前固定为 JDBC，未来可扩展 Spark/Flink）
  const engine = ref<'JDBC'>('JDBC');
  const schema = ref('public');
  const limit = ref(1000);

  // ============= left tabs & tree =============
  const activeMainTab = ref<MainTabKey>('task');
  const leftSearch = ref('');

  const scripts = reactive<ScriptItem[]>([...MOCK_SCRIPTS]);

  const treeData = computed<TreeProps['treeData']>(() => {
    const keyword = leftSearch.value.trim().toLowerCase();
    const folderGroups = new Map<string, ScriptItem[]>();
    for (const s of scripts) {
      if (keyword && !s.name.toLowerCase().includes(keyword)) continue;
      const arr = folderGroups.get(s.folder) ?? [];
      arr.push(s);
      folderGroups.set(s.folder, arr);
    }
    return [...folderGroups.entries()].map(([folder, items]) => ({
      key: `folder:${folder}`,
      title: folder,
      selectable: false,
      children: items.map((s) => ({
        key: `script:${s.id}`,
        title: s.name,
        isLeaf: true,
      })),
    }));
  });

  // ============= editor tabs =============
  const openedScriptIds = ref<string[]>(['s1', 's2']);
  const activeScriptId = ref<string>('s1');
  const dirtyMap = reactive<Record<string, boolean>>({});

  const openedScripts = computed(
    () =>
      openedScriptIds.value
        .map((id) => scripts.find((s) => s.id === id))
        .filter(Boolean) as ScriptItem[],
  );

  const activeScript = computed(() =>
    scripts.find((s) => s.id === activeScriptId.value),
  );

  function openScriptById(id: string) {
    if (!openedScriptIds.value.includes(id)) {
      openedScriptIds.value = [...openedScriptIds.value, id];
    }
    activeScriptId.value = id;
  }

  function closeScriptById(id: string) {
    const next = openedScriptIds.value.filter((x) => x !== id);
    openedScriptIds.value = next.length > 0 ? next : [];
    if (activeScriptId.value === id) {
      activeScriptId.value = next[0] ?? '';
    }
  }

  function handleEditorTabEdit(targetKey: any, action: 'add' | 'remove') {
    if (action === 'remove') {
      closeScriptById(String(targetKey));
    } else if (action === 'add') {
      // 创建新脚本（mock）
      const newId = `s${Date.now()}`;
      const newScript: ScriptItem = {
        id: newId,
        name: `Untitled_${scripts.length + 1}`,
        folder: 'Tpch_100g',
        content: '-- 新建脚本\nSELECT 1;',
      };
      scripts.push(newScript);
      openScriptById(newId);
      message.success('已新建脚本（mock）');
    }
  }

  function handleTreeSelect(selectedKeys: (number | string)[]) {
    const key = String(selectedKeys?.[0] ?? '');
    if (!key.startsWith('script:')) return;
    const id = key.replace('script:', '');
    openScriptById(id);
  }

  function setActiveScriptContent(v: string) {
    const s = activeScript.value;
    if (!s) return;
    s.content = v;
    dirtyMap[s.id] = true;
  }

  function handleSave() {
    const s = activeScript.value;
    if (!s) return;
    dirtyMap[s.id] = false;
    message.success('已保存（mock）');
  }

  function handleSubmit() {
    const s = activeScript.value;
    if (!s) {
      message.warning('未选择脚本（mock）');
      return;
    }
    // 这里只做前端占位：后续接“发布/提交到调度”再细化状态机
    message.success(`已提交：${s.name}（mock）`);
  }

  // ============= run simulation =============
  // 默认收起底部面板，把空间让给编辑区（需要时再展开）
  const bottomPanelCollapsed = ref(true);
  const activeBottomTab = ref<BottomTabKey>('history');
  const runs = ref<RunRecord[]>([]);
  const selectedRunId = ref<string>('');
  const instanceDrawerOpen = ref(false);

  const selectedRun = computed(() =>
    runs.value.find((r) => r.id === selectedRunId.value),
  );

  const resultColumns = computed<TableColumnsType>(() => {
    const sample = selectedRun.value?.resultPreview?.[0];
    if (!sample) return [];
    return Object.keys(sample).map((k) => ({
      title: k,
      dataIndex: k,
      ellipsis: true,
    }));
  });

  const historyColumns: TableColumnsType<RunRecord> = [
    { title: '实例ID', dataIndex: 'id', width: 120 },
    { title: '脚本', dataIndex: 'scriptName', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 110 },
    { title: '开始时间', dataIndex: 'startAt', width: 170 },
    { title: '耗时(ms)', dataIndex: 'durationMs', width: 110 },
    { title: '行数', dataIndex: 'rows', width: 90 },
  ];

  function statusTagColor(status: RunStatus) {
    switch (status) {
      case 'FAILED': {
        return 'red';
      }
      case 'QUEUED': {
        return 'gold';
      }
      case 'RUNNING': {
        return 'blue';
      }
      case 'SUCCESS': {
        return 'green';
      }
      default: {
        return 'default';
      }
    }
  }

  function handleRun() {
    const s = activeScript.value;
    if (!s) return;

    bottomPanelCollapsed.value = false;
    activeBottomTab.value = 'history';

    const id = `r${Math.random().toString(16).slice(2, 8)}`;
    const startAt = nowStr();
    const record: RunRecord = {
      id,
      scriptId: s.id,
      scriptName: s.name,
      status: 'RUNNING',
      startAt,
      log: `[${startAt}] submit: engine=${engine.value}, schema=${schema.value}, limit=${limit.value}\n[${startAt}] running...\n`,
    };
    runs.value = [record, ...runs.value];
    selectedRunId.value = id;

    const started = Date.now();
    setTimeout(() => {
      const endAt = nowStr();
      const durationMs = Date.now() - started;
      const result = mockResultFor(s.name);

      const idx = runs.value.findIndex((r) => r.id === id);
      if (idx === -1) return;
      const prev = runs.value[idx];
      if (!prev) return;
      const next: RunRecord = {
        ...prev,
        status: 'SUCCESS',
        endAt,
        durationMs,
        rows: result.length,
        resultPreview: result,
        log: `${prev.log}[${endAt}] success\n`,
      };
      runs.value.splice(idx, 1, next);
      selectedRunId.value = id;
      activeBottomTab.value = 'result';
    }, 900);
  }

  // 运行单条语句（从 Monaco gutter 点击）
  function handleRunStatement(statement: string, lineNumber: number) {
    const s = activeScript.value;
    if (!s) return;

    bottomPanelCollapsed.value = false;
    activeBottomTab.value = 'history';

    const id = `r${Math.random().toString(16).slice(2, 8)}`;
    const startAt = nowStr();
    const record: RunRecord = {
      id,
      scriptId: s.id,
      scriptName: `${s.name}:L${lineNumber}`,
      status: 'RUNNING',
      startAt,
      log: `[${startAt}] 运行第 ${lineNumber} 行语句\n[${startAt}] SQL: ${statement.slice(0, 100)}${statement.length > 100 ? '...' : ''}\n`,
    };
    runs.value = [record, ...runs.value];
    selectedRunId.value = id;

    const started = Date.now();
    setTimeout(() => {
      const endAt = nowStr();
      const durationMs = Date.now() - started;
      const result = mockResultFor(s.name);

      const idx = runs.value.findIndex((r) => r.id === id);
      if (idx === -1) return;
      const prev = runs.value[idx];
      if (!prev) return;
      const next: RunRecord = {
        ...prev,
        status: 'SUCCESS',
        endAt,
        durationMs,
        rows: result.length,
        resultPreview: result,
        log: `${prev.log}[${endAt}] success\n`,
      };
      runs.value.splice(idx, 1, next);
      selectedRunId.value = id;
      activeBottomTab.value = 'result';
      message.success(`第 ${lineNumber} 行语句运行成功（mock）`);
    }, 600);
  }

  function handleStop() {
    const r = selectedRun.value;
    if (!r) {
      message.warning('暂无可停止的实例（mock）');
      return;
    }
    if (r.status !== 'RUNNING' && r.status !== 'QUEUED') {
      message.info('实例已结束（mock）');
      return;
    }
    const idx = runs.value.findIndex((x) => x.id === r.id);
    if (idx === -1) return;
    const endAt = nowStr();
    runs.value.splice(idx, 1, {
      ...r,
      status: 'CANCELED',
      endAt,
      durationMs: 0,
      log: `${r.log}[${endAt}] canceled\n`,
    });
    message.success('已停止（mock）');
    activeBottomTab.value = 'log';
  }

  function openInstance(record: RunRecord) {
    selectedRunId.value = record.id;
    instanceDrawerOpen.value = true;
  }

  // ============= workspace dropdown =============
  const workspaceMenuItems = computed(() => [
    { key: 'quick_start', label: 'quick_start' },
    { key: 'prod', label: 'prod' },
  ]);

  function handleWorkspaceMenuClick(info: any) {
    workspace.value = String(info?.key ?? workspace.value);
    message.success(`已切换空间：${workspace.value}（mock）`);
  }

  return {
    // header
    workspace,
    workspaceMenuItems,
    handleWorkspaceMenuClick,

    // left
    activeMainTab,
    leftSearch,
    treeData,

    // editor tabs & content
    openedScripts,
    activeScriptId,
    activeScript,
    dirtyMap,
    handleEditorTabEdit,
    handleTreeSelect,
    setActiveScriptContent,
    handleSave,

    // toolbar controls
    profile,
    engine,
    schema,
    limit,
    handleSubmit,

    // bottom panel & run
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

    // drawer
    instanceDrawerOpen,
  };
}
