import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

/** 数据源类型选项 */
export const DATASOURCE_TYPE_OPTIONS = [
  { label: 'MySQL', value: 'MySQL' },
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'Oracle', value: 'Oracle' },
  { label: 'SQLServer', value: 'SQLServer' },
  { label: 'ClickHouse', value: 'ClickHouse' },
  { label: 'Doris', value: 'Doris' },
  { label: 'StarRocks', value: 'StarRocks' },
  { label: 'Hive', value: 'Hive' },
  { label: 'Presto', value: 'Presto' },
  { label: 'Trino', value: 'Trino' },
];

/** 状态选项 */
export const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

/** 搜索表单 */
export function useSearchSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'name',
      label: '数据源名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入数据源名称',
        allowClear: true,
      },
    },
    {
      fieldName: 'type',
      label: '数据源类型',
      component: 'Select',
      componentProps: {
        placeholder: '全部',
        allowClear: true,
        options: DATASOURCE_TYPE_OPTIONS,
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        placeholder: '全部',
        allowClear: true,
        options: STATUS_OPTIONS,
      },
    },
  ];
}

/** 新增/修改表单 */
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'name',
      label: '数据源名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入数据源名称',
      },
      rules: 'required',
    },
    {
      fieldName: 'type',
      label: '数据源类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择数据源类型',
        options: DATASOURCE_TYPE_OPTIONS,
      },
      rules: 'required',
    },
    {
      fieldName: 'jdbcUrl',
      label: 'JDBC URL',
      component: 'Input',
      componentProps: {
        placeholder: '例如：jdbc:mysql://localhost:3306/db_name',
      },
      rules: 'required',
    },
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
    {
      fieldName: 'password',
      label: '密码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入密码',
        type: 'password',
      },
    },
    {
      fieldName: 'driverClass',
      label: '驱动类名',
      component: 'Input',
      componentProps: {
        placeholder: '可选，不填则自动识别',
      },
    },
    {
      fieldName: 'poolSize',
      label: '连接池大小',
      component: 'InputNumber',
      componentProps: {
        placeholder: '默认 10',
        min: 1,
        max: 100,
      },
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
    },
  ];
}

/** 列表字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    { type: 'checkbox', width: 40 },
    {
      field: 'name',
      title: '数据源名称',
      minWidth: 150,
    },
    {
      field: 'type',
      title: '类型',
      width: 120,
    },
    {
      field: 'jdbcUrl',
      title: 'JDBC URL',
      minWidth: 300,
      showOverflow: 'tooltip',
    },
    {
      field: 'username',
      title: '用户名',
      width: 120,
    },
    {
      field: 'status',
      title: '状态',
      width: 80,
      slots: { default: 'status' },
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
      formatter: 'formatDateTime',
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
