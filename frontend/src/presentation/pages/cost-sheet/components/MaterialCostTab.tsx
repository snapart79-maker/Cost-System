/**
 * MaterialCostTab Component
 * 재료비 상세 테이블 (읽기 전용)
 */

import { useMemo } from 'react';
import { Table, Tag, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MaterialCostDetail } from '@/domain/entities/cost-calculation';
import { WorkType } from '@/domain/entities/process';
import type { WorkTypeFilterValue } from './WorkTypeFilter';
import styles from './MaterialCostTab.module.css';

export interface MaterialCostTabProps {
  materialDetails: MaterialCostDetail[];
  workTypeFilter: WorkTypeFilterValue;
  loading?: boolean;
}

export function MaterialCostTab({
  materialDetails,
  workTypeFilter,
  loading = false,
}: MaterialCostTabProps) {
  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toLocaleString('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const filteredData = useMemo(() => {
    if (workTypeFilter === 'ALL') {
      return materialDetails;
    }
    return materialDetails.filter((item) => item.work_type === workTypeFilter);
  }, [materialDetails, workTypeFilter]);

  const columns: ColumnsType<MaterialCostDetail> = [
    {
      title: '자재코드',
      dataIndex: ['material', 'material_id'],
      key: 'material_id',
      width: 120,
    },
    {
      title: '자재명',
      dataIndex: ['material', 'name'],
      key: 'name',
      width: 180,
    },
    {
      title: '규격',
      dataIndex: ['material', 'spec'],
      key: 'spec',
      width: 120,
    },
    {
      title: '작업유형',
      dataIndex: 'work_type',
      key: 'work_type',
      width: 80,
      render: (value: WorkType) => (
        <Tag color={value === WorkType.IN_HOUSE ? 'blue' : 'orange'}>
          {value === WorkType.IN_HOUSE ? '내작' : '외작'}
        </Tag>
      ),
    },
    {
      title: '소요량',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      width: 100,
      render: (value: number) => formatNumber(value, 4),
    },
    {
      title: '단위',
      dataIndex: ['material', 'unit'],
      key: 'unit',
      width: 60,
    },
    {
      title: '단가',
      dataIndex: 'unit_price',
      key: 'unit_price',
      align: 'right' as const,
      width: 100,
      render: (value: number) => formatNumber(value),
    },
    {
      title: '재료비',
      dataIndex: 'material_cost',
      key: 'material_cost',
      align: 'right' as const,
      width: 120,
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'LOSS비',
      dataIndex: 'scrap_cost',
      key: 'scrap_cost',
      align: 'right' as const,
      width: 100,
      render: (value: number) => formatNumber(value),
    },
    {
      title: '순재료비',
      dataIndex: 'net_material_cost',
      key: 'net_material_cost',
      align: 'right' as const,
      width: 120,
      render: (value: number) => (
        <strong>{formatNumber(value)}</strong>
      ),
    },
  ];

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => ({
        material_cost: acc.material_cost + item.material_cost,
        scrap_cost: acc.scrap_cost + item.scrap_cost,
        net_material_cost: acc.net_material_cost + item.net_material_cost,
      }),
      { material_cost: 0, scrap_cost: 0, net_material_cost: 0 }
    );
  }, [filteredData]);

  if (!materialDetails.length && !loading) {
    return <Empty description="재료비 데이터가 없습니다" />;
  }

  return (
    <div className={styles.container}>
      <Table<MaterialCostDetail>
        columns={columns}
        dataSource={filteredData}
        rowKey="material_id"
        pagination={false}
        loading={loading}
        size="small"
        scroll={{ x: 1200 }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row className={styles.summaryRow}>
              <Table.Summary.Cell index={0} colSpan={7}>
                <strong>합계</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong>{formatNumber(totals.material_cost)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="right">
                <strong>{formatNumber(totals.scrap_cost)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9} align="right">
                <strong className={styles.totalValue}>
                  {formatNumber(totals.net_material_cost)}
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}

export default MaterialCostTab;
