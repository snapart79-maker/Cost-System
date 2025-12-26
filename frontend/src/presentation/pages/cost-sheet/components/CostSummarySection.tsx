/**
 * CostSummarySection Component
 * 원가 요약 섹션 - 내작/외작/합계 컬럼
 */

import { Card, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CostBreakdown } from '@/domain/entities/cost-calculation';
import type { WorkTypeFilterValue } from './WorkTypeFilter';
import styles from './CostSummarySection.module.css';

const { Text } = Typography;

export interface CostSummarySectionProps {
  costBreakdown?: CostBreakdown;
  workTypeFilter: WorkTypeFilterValue;
  loading?: boolean;
}

interface CostRow {
  key: string;
  label: string;
  inhouse: number;
  outsource: number;
  total: number;
  isHighlight?: boolean;
  isSubtotal?: boolean;
}

export function CostSummarySection({
  costBreakdown,
  workTypeFilter,
  loading = false,
}: CostSummarySectionProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getColumns = (): ColumnsType<CostRow> => {
    const baseColumns: ColumnsType<CostRow> = [
      {
        title: '항목',
        dataIndex: 'label',
        key: 'label',
        width: 150,
        render: (text, record) => (
          <Text strong={record.isHighlight || record.isSubtotal}>{text}</Text>
        ),
      },
    ];

    if (workTypeFilter === 'ALL' || workTypeFilter === 'IN_HOUSE') {
      baseColumns.push({
        title: '내작',
        dataIndex: 'inhouse',
        key: 'inhouse',
        align: 'right' as const,
        width: 150,
        render: (value, record) => (
          <Text
            strong={record.isHighlight || record.isSubtotal}
            className={record.isHighlight ? styles.highlightValue : ''}
          >
            {formatCurrency(value)}
          </Text>
        ),
      });
    }

    if (workTypeFilter === 'ALL' || workTypeFilter === 'OUTSOURCE') {
      baseColumns.push({
        title: '외작',
        dataIndex: 'outsource',
        key: 'outsource',
        align: 'right' as const,
        width: 150,
        render: (value, record) => (
          <Text
            strong={record.isHighlight || record.isSubtotal}
            className={record.isHighlight ? styles.highlightValue : ''}
          >
            {formatCurrency(value)}
          </Text>
        ),
      });
    }

    baseColumns.push({
      title: '합계',
      dataIndex: 'total',
      key: 'total',
      align: 'right' as const,
      width: 150,
      render: (value, record) => (
        <Text
          strong={record.isHighlight || record.isSubtotal}
          className={record.isHighlight ? styles.highlightValue : ''}
        >
          {formatCurrency(value)}
        </Text>
      ),
    });

    return baseColumns;
  };

  const getDataSource = (): CostRow[] => {
    if (!costBreakdown) {
      return [
        { key: 'material', label: '재료비', inhouse: 0, outsource: 0, total: 0 },
        { key: 'labor', label: '노무비', inhouse: 0, outsource: 0, total: 0 },
        { key: 'expense', label: '경비', inhouse: 0, outsource: 0, total: 0 },
        { key: 'manufacturing', label: '제조원가', inhouse: 0, outsource: 0, total: 0, isSubtotal: true },
        { key: 'materialMgmt', label: '재료관리비', inhouse: 0, outsource: 0, total: 0 },
        { key: 'generalMgmt', label: '일반관리비', inhouse: 0, outsource: 0, total: 0 },
        { key: 'defect', label: '불량비', inhouse: 0, outsource: 0, total: 0 },
        { key: 'profit', label: '이윤', inhouse: 0, outsource: 0, total: 0 },
        { key: 'purchase', label: '구매원가', inhouse: 0, outsource: 0, total: 0, isHighlight: true },
      ];
    }

    return [
      {
        key: 'material',
        label: '재료비',
        inhouse: costBreakdown.inhouse_material_cost,
        outsource: costBreakdown.outsource_material_cost,
        total: costBreakdown.total_material_cost,
      },
      {
        key: 'labor',
        label: '노무비',
        inhouse: costBreakdown.inhouse_labor_cost,
        outsource: costBreakdown.outsource_labor_cost,
        total: costBreakdown.total_labor_cost,
      },
      {
        key: 'expense',
        label: '경비',
        inhouse: costBreakdown.inhouse_expense,
        outsource: costBreakdown.outsource_expense,
        total: costBreakdown.total_expense,
      },
      {
        key: 'manufacturing',
        label: '제조원가',
        inhouse: costBreakdown.inhouse_manufacturing_cost,
        outsource: costBreakdown.outsource_manufacturing_cost,
        total: costBreakdown.total_manufacturing_cost,
        isSubtotal: true,
      },
      {
        key: 'materialMgmt',
        label: '재료관리비',
        inhouse: costBreakdown.material_management_cost,
        outsource: 0,
        total: costBreakdown.material_management_cost,
      },
      {
        key: 'generalMgmt',
        label: '일반관리비',
        inhouse: costBreakdown.general_management_cost,
        outsource: 0,
        total: costBreakdown.general_management_cost,
      },
      {
        key: 'defect',
        label: '불량비',
        inhouse: costBreakdown.defect_cost,
        outsource: 0,
        total: costBreakdown.defect_cost,
      },
      {
        key: 'profit',
        label: '이윤',
        inhouse: costBreakdown.profit,
        outsource: 0,
        total: costBreakdown.profit,
      },
      {
        key: 'purchase',
        label: '구매원가',
        inhouse: costBreakdown.inhouse_purchase_cost,
        outsource: costBreakdown.outsource_purchase_cost,
        total: costBreakdown.total_purchase_cost,
        isHighlight: true,
      },
    ];
  };

  return (
    <Card title="원가 요약" className={styles.container}>
      <Table<CostRow>
        columns={getColumns()}
        dataSource={getDataSource()}
        pagination={false}
        loading={loading}
        size="middle"
        bordered
        rowClassName={(record) =>
          record.isHighlight
            ? styles.highlightRow
            : record.isSubtotal
              ? styles.subtotalRow
              : ''
        }
      />
    </Card>
  );
}

export default CostSummarySection;
