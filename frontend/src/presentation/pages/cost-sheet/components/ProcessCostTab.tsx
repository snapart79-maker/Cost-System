/**
 * ProcessCostTab Component
 * 가공비 상세 테이블 (읽기 전용)
 */

import { useMemo } from 'react';
import { Table, Tag, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ProcessCostDetail } from '@/domain/entities/cost-calculation';
import { WorkType } from '@/domain/entities/process';
import type { WorkTypeFilterValue } from './WorkTypeFilter';
import styles from './ProcessCostTab.module.css';

export interface ProcessCostTabProps {
  processDetails: ProcessCostDetail[];
  workTypeFilter: WorkTypeFilterValue;
  loading?: boolean;
}

export function ProcessCostTab({
  processDetails,
  workTypeFilter,
  loading = false,
}: ProcessCostTabProps) {
  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toLocaleString('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const filteredData = useMemo(() => {
    if (workTypeFilter === 'ALL') {
      return processDetails;
    }
    return processDetails.filter((item) => item.work_type === workTypeFilter);
  }, [processDetails, workTypeFilter]);

  const columns: ColumnsType<ProcessCostDetail> = [
    {
      title: '공정코드',
      dataIndex: ['process', 'process_id'],
      key: 'process_id',
      width: 120,
    },
    {
      title: '공정명',
      dataIndex: ['process', 'name'],
      key: 'name',
      width: 180,
    },
    {
      title: '설비명',
      dataIndex: ['process', 'equipment_name'],
      key: 'equipment_name',
      width: 150,
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
      title: 'C/T (초)',
      dataIndex: 'cycle_time',
      key: 'cycle_time',
      align: 'right' as const,
      width: 80,
      render: (value: number) => formatNumber(value, 1),
    },
    {
      title: '인원',
      dataIndex: 'workers',
      key: 'workers',
      align: 'right' as const,
      width: 60,
    },
    {
      title: '생산량/시간',
      dataIndex: 'production_volume',
      key: 'production_volume',
      align: 'right' as const,
      width: 100,
      render: (value: number) => formatNumber(value, 0),
    },
    {
      title: '노무비',
      dataIndex: 'labor_cost',
      key: 'labor_cost',
      align: 'right' as const,
      width: 100,
      render: (value: number) => formatNumber(value),
    },
    {
      title: '경비',
      dataIndex: 'expense',
      key: 'expense',
      align: 'right' as const,
      width: 100,
      render: (value: number) => formatNumber(value),
    },
    {
      title: '가공비',
      dataIndex: 'total_process_cost',
      key: 'total_process_cost',
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
        labor_cost: acc.labor_cost + item.labor_cost,
        expense: acc.expense + item.expense,
        total_process_cost: acc.total_process_cost + item.total_process_cost,
      }),
      { labor_cost: 0, expense: 0, total_process_cost: 0 }
    );
  }, [filteredData]);

  if (!processDetails.length && !loading) {
    return <Empty description="가공비 데이터가 없습니다" />;
  }

  return (
    <div className={styles.container}>
      <Table<ProcessCostDetail>
        columns={columns}
        dataSource={filteredData}
        rowKey="process_id"
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
                <strong>{formatNumber(totals.labor_cost)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="right">
                <strong>{formatNumber(totals.expense)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9} align="right">
                <strong className={styles.totalValue}>
                  {formatNumber(totals.total_process_cost)}
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}

export default ProcessCostTab;
