import { requestClient } from '#/api/request';

export namespace DevelopDatasourceApi {
  /** 数据源信息 */
  export interface Datasource {
    id?: number;
    name: string;
    type: string;
    jdbcUrl: string;
    username?: string;
    password?: string;
    driverClass?: string;
    poolSize?: number;
    config?: string;
    status?: number;
    remark?: string;
    createTime?: string;
    updateTime?: string;
  }

  /** 数据源分页请求 */
  export interface PageReq {
    pageNo: number;
    pageSize: number;
    name?: string;
    type?: string;
    status?: number;
  }

  /** 分页结果 */
  export interface PageResult<T> {
    list: T[];
    total: number;
  }

  /** 简单数据源（下拉用） */
  export interface DatasourceSimple {
    id: number;
    name: string;
    type: string;
  }
}

// ==================== Mock 数据 ====================
const ENABLE_MOCK = false; // 🔧 开关：true=使用mock数据，false=调用真实API（后端就绪后改为 false）

const mockDatasources: DevelopDatasourceApi.Datasource[] = [
  {
    id: 1,
    name: 'MySQL_prod',
    type: 'MySQL',
    jdbcUrl: 'jdbc:mysql://192.168.1.100:3306/prod_db?useSSL=false',
    username: 'prod_user',
    driverClass: 'com.mysql.cj.jdbc.Driver',
    poolSize: 20,
    status: 1,
    remark: '生产环境 MySQL 数据库',
    createTime: '2025-01-10 10:00:00',
    updateTime: '2025-01-10 10:00:00',
  },
  {
    id: 2,
    name: 'PostgreSQL_dev',
    type: 'PostgreSQL',
    jdbcUrl: 'jdbc:postgresql://192.168.1.101:5432/dev_db',
    username: 'dev_user',
    driverClass: 'org.postgresql.Driver',
    poolSize: 10,
    status: 1,
    remark: '开发环境 PostgreSQL 数据库',
    createTime: '2025-01-09 14:30:00',
    updateTime: '2025-01-11 09:00:00',
  },
  {
    id: 3,
    name: 'ClickHouse_analytics',
    type: 'ClickHouse',
    jdbcUrl: 'jdbc:clickhouse://192.168.1.102:8123/analytics',
    username: 'analytics_user',
    driverClass: 'com.clickhouse.jdbc.ClickHouseDriver',
    poolSize: 5,
    status: 1,
    remark: '数据分析 ClickHouse 集群',
    createTime: '2025-01-08 16:00:00',
    updateTime: '2025-01-08 16:00:00',
  },
  {
    id: 4,
    name: 'MySQL_test',
    type: 'MySQL',
    jdbcUrl: 'jdbc:mysql://192.168.1.103:3306/test_db',
    username: 'test_user',
    driverClass: 'com.mysql.cj.jdbc.Driver',
    poolSize: 5,
    status: 0,
    remark: '测试环境（已禁用）',
    createTime: '2025-01-05 11:00:00',
    updateTime: '2025-01-12 08:00:00',
  },
  {
    id: 5,
    name: 'Doris_warehouse',
    type: 'Doris',
    jdbcUrl: 'jdbc:mysql://192.168.1.104:9030/warehouse',
    username: 'warehouse_user',
    driverClass: 'com.mysql.cj.jdbc.Driver',
    poolSize: 15,
    status: 1,
    remark: 'Doris 数仓',
    createTime: '2025-01-06 09:00:00',
    updateTime: '2025-01-06 09:00:00',
  },
];

let mockIdCounter = 100;

// Mock 工具函数
function delay(ms: number = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== API 接口 ====================

/** 获取数据源分页列表 */
export async function getDatasourcePage(params: DevelopDatasourceApi.PageReq) {
  if (ENABLE_MOCK) {
    await delay();
    let filtered = [...mockDatasources];
    if (params.name) {
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(params.name!.toLowerCase()),
      );
    }
    if (params.type) {
      filtered = filtered.filter((d) => d.type === params.type);
    }
    if (params.status !== undefined && params.status !== null) {
      filtered = filtered.filter((d) => d.status === params.status);
    }
    const start = (params.pageNo - 1) * params.pageSize;
    const end = start + params.pageSize;
    return {
      list: filtered.slice(start, end),
      total: filtered.length,
    };
  }
  return requestClient.get<
    DevelopDatasourceApi.PageResult<DevelopDatasourceApi.Datasource>
  >('/develop/datasource/page', { params });
}

/** 获取数据源详情 */
export async function getDatasource(id: number) {
  if (ENABLE_MOCK) {
    await delay();
    const ds = mockDatasources.find((d) => d.id === id);
    if (!ds) throw new Error('数据源不存在');
    return { ...ds };
  }
  return requestClient.get<DevelopDatasourceApi.Datasource>(
    `/develop/datasource/get?id=${id}`,
  );
}

/** 获取启用的数据源列表（下拉选择用） */
export async function getEnabledDatasourceList() {
  if (ENABLE_MOCK) {
    await delay();
    return mockDatasources
      .filter((d) => d.status === 1)
      .map((d) => ({ id: d.id!, name: d.name, type: d.type }));
  }
  return requestClient.get<DevelopDatasourceApi.DatasourceSimple[]>(
    '/develop/datasource/list-enabled',
  );
}

/** 创建数据源 */
export async function createDatasource(data: DevelopDatasourceApi.Datasource) {
  if (ENABLE_MOCK) {
    await delay();
    const newDs: DevelopDatasourceApi.Datasource = {
      ...data,
      id: ++mockIdCounter,
      status: 1,
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
    };
    mockDatasources.unshift(newDs);
    return newDs.id;
  }
  return requestClient.post<number>('/develop/datasource/create', data);
}

/** 更新数据源 */
export async function updateDatasource(data: DevelopDatasourceApi.Datasource) {
  if (ENABLE_MOCK) {
    await delay();
    const index = mockDatasources.findIndex((d) => d.id === data.id);
    if (index === -1) throw new Error('数据源不存在');
    mockDatasources[index] = {
      ...mockDatasources[index],
      ...data,
      updateTime: new Date().toLocaleString(),
    };
    return true;
  }
  return requestClient.put<boolean>('/develop/datasource/update', data);
}

/** 删除数据源 */
export async function deleteDatasource(id: number) {
  if (ENABLE_MOCK) {
    await delay();
    const index = mockDatasources.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('数据源不存在');
    mockDatasources.splice(index, 1);
    return true;
  }
  return requestClient.delete<boolean>(`/develop/datasource/delete?id=${id}`);
}

/** 更新数据源状态 */
export async function updateDatasourceStatus(id: number, status: number) {
  if (ENABLE_MOCK) {
    await delay();
    const ds = mockDatasources.find((d) => d.id === id);
    if (!ds) throw new Error('数据源不存在');
    ds.status = status;
    ds.updateTime = new Date().toLocaleString();
    return true;
  }
  return requestClient.put<boolean>(
    `/develop/datasource/update-status?id=${id}&status=${status}`,
  );
}

/** 测试数据源连接（新建时，传完整数据） */
export async function testDatasourceConnection(
  data: DevelopDatasourceApi.Datasource,
) {
  if (ENABLE_MOCK) {
    await delay(1000); // 模拟连接测试耗时
    // 模拟：URL 包含 "error" 则失败
    if (data.jdbcUrl?.includes('error')) {
      return false;
    }
    return true;
  }
  return requestClient.post<boolean>(
    '/develop/datasource/test-connection',
    data,
  );
}

/** 测试数据源连接（已保存的，根据ID） */
export async function testDatasourceConnectionById(id: number) {
  if (ENABLE_MOCK) {
    await delay(1000);
    return true;
  }
  return requestClient.get<boolean>('/develop/datasource/test-connection', {
    params: { id },
  });
}
