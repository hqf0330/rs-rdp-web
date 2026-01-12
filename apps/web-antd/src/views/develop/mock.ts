import type { ScriptItem } from './types';

export const MOCK_SCRIPTS: ScriptItem[] = [
  {
    id: 's1',
    name: 'Sample_Query01_TPCH100g_Data',
    folder: 'Tpch_100g',
    type: 'SQL',
    schema: 'public',
    updatedAt: '2026/01/10 00:49:39',
    content: `-- LAKEHOUSE SQL
-- 业务说明：TPCH 示例查询
select
  l_returnflag,
  l_linestatus,
  sum(l_quantity) as sum_qty,
  sum(l_extendedprice) as sum_base_price,
  sum(l_extendedprice * (1 - l_discount)) as sum_disc_price,
  sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)) as sum_charge,
  avg(l_quantity) as avg_qty,
  avg(l_extendedprice) as avg_price,
  avg(l_discount) as avg_disc,
  count(*) as count_order
from
  clickzetta_sample_data.tpch_100g.lineitem
where
  l_shipdate <= date '1998-12-01' - interval '85' day
group by
  l_returnflag,
  l_linestatus
order by
  l_returnflag,
  l_linestatus
limit 1;
`,
  },
  {
    id: 's2',
    name: 'Sample_Query02_TPCH100g_Data',
    folder: 'Tpch_100g',
    type: 'SQL',
    schema: 'public',
    updatedAt: '2026/01/10 00:49:39',
    content: `select
  o_orderpriority,
  count(*) as order_count
from clickzetta_sample_data.tpch_100g.orders
where o_orderdate >= date '1993-07-01'
  and o_orderdate < date '1993-10-01'
group by o_orderpriority
order by o_orderpriority;`,
  },
  {
    id: 's3',
    name: 'Sample_Querys_TPCH100g_Data',
    folder: 'Tpch_100g',
    type: 'SQL',
    schema: 'public',
    updatedAt: '2026/01/10 00:49:39',
    content: `-- 这里可以放多条查询模板
select current_date;`,
  },
];

export function nowStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function mockResultFor(scriptName: string) {
  if (scriptName.includes('Query01')) {
    return [
      {
        l_returnflag: 'N',
        l_linestatus: 'O',
        sum_qty: 37_734_107,
        sum_base_price: 56_586_554_400.73,
        sum_disc_price: 53_758_257_134.87,
        sum_charge: 55_909_065_222.83,
        avg_qty: 25.52,
        avg_price: 38_273.13,
        avg_disc: 0.05,
        count_order: 1_478_493,
      },
    ];
  }
  return [
    { o_orderpriority: '1-URGENT', order_count: 10_594 },
    { o_orderpriority: '2-HIGH', order_count: 10_476 },
    { o_orderpriority: '3-MEDIUM', order_count: 10_410 },
    { o_orderpriority: '4-NOT SPECIFIED', order_count: 10_512 },
    { o_orderpriority: '5-LOW', order_count: 10_487 },
  ];
}
