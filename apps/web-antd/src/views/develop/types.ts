export type MainTabKey = 'data' | 'task' | 'taskGroup';
export type BottomTabKey = 'history' | 'log' | 'result';

export type ScriptType = 'SQL';
export type RunStatus =
  | 'CANCELED'
  | 'FAILED'
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS';

export interface ScriptItem {
  id: string;
  name: string;
  folder: string;
  type: ScriptType;
  schema: string;
  content: string;
  updatedAt: string;
}

export interface RunRecord {
  id: string;
  scriptId: string;
  scriptName: string;
  status: RunStatus;
  startAt: string;
  endAt?: string;
  durationMs?: number;
  rows?: number;
  log: string;
  resultPreview?: Array<Record<string, any>>;
}
