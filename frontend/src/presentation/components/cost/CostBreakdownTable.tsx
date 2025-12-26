/**
 * CostBreakdownTable Component
 * 원가 내역 테이블 컴포넌트
 */

import { Table, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styles from './CostComponents.module.css';

const { Text } = Typography;

export interface CostBreakdownItem {
  id: string;
  category: string;
  name: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  workType?: 'IN_HOUSE' | 'OUTSOURCED';
  remarks?: string;
}

export interface CostBreakdownTableProps {
  title: string;
  data: CostBreakdownItem[];
  loading?: boolean;
  showWorkType?: boolean;
  showTotal?: boolean;
  totalLabel?: string;
  className?: string;
}

export function CostBreakdownTable({
  title,
  data,
  loading = false,
  showWorkType = true,
  showTotal = true,
  totalLabel = '소계',
  className,
}: CostBreakdownTableProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const columns: ColumnsType<CostBreakdownItem> = [
    {
      title: '분류',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '품명',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '규격',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '단위',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (value) => (value ? formatCurrency(value) : '-'),
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (value) => (
        <Text strong>{formatCurrency(value)}</Text>
      ),
    },
  ];

  if (showWorkType) {
    columns.splice(1, 0, {
      title: '작업유형',
      dataIndex: 'workType',
      key: 'workType',
      width: 80,
      align: 'center',
      render: (value) =>
        value === 'IN_HOUSE' ? (
          <Tag color="blue">내작</Tag>
        ) : value === 'OUTSOURCED' ? (
          <Tag color="orange">외작</Tag>
        ) : null,
    });
  }

  // Calculate total
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className={`${styles.breakdownTable} ${className || ''}`}>
      <div className={styles.tableHeader}>
        <Typography.Title level={5}>{title}</Typography.Title>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        summary={() =>
          showTotal ? (
            <Table.Summary fixed>
              <Table.Summary.Row className={styles.summaryRow}>
                <Table.Summary.Cell
                  index={0}
                  colSpan={columns.length - 1}
                  align="right"
                >
                  <Text strong>{totalLabel}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(totalAmount)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          ) : null
        }
      />
    </div>
  );
}

export default CostBreakdownTable;
