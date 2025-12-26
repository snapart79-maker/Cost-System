/**
 * HistoryTable Component
 * 변경 이력 테이블
 */

import { Table, Tag, Button, Space, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PriceChange } from '@/domain/entities/price-change';
import styles from './HistoryTable.module.css';

const { Text } = Typography;

export interface HistoryTableProps {
  data: PriceChange[];
  loading?: boolean;
  onViewDetail?: (record: PriceChange) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  MATERIAL: 'blue',
  PROCESS: 'green',
  COMBINED: 'purple',
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  MATERIAL: '자재',
  PROCESS: '공정',
  COMBINED: '복합',
};

export function HistoryTable({
  data,
  loading = false,
  onViewDetail,
  pagination,
}: HistoryTableProps) {
  const columns: ColumnsType<PriceChange> = [
    {
      title: 'ECO 번호',
      dataIndex: 'eco_number',
      key: 'eco_number',
      width: 120,
      render: (value: string) => value || '-',
    },
    {
      title: '품목',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.product?.name || '-'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.product?.product_id}
          </Text>
        </div>
      ),
    },
    {
      title: '변경 유형',
      dataIndex: 'change_type',
      key: 'change_type',
      width: 100,
      render: (type: string) => (
        <Tag color={CHANGE_TYPE_COLORS[type] || 'default'}>
          {CHANGE_TYPE_LABELS[type] || type}
        </Tag>
      ),
    },
    {
      title: '변경 사유',
      dataIndex: 'change_reason',
      key: 'change_reason',
      ellipsis: true,
    },
    {
      title: '적용일',
      dataIndex: 'effective_date',
      key: 'effective_date',
      width: 110,
    },
    {
      title: '원가 변동',
      key: 'cost_diff',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const diff = record.cost_diff || 0;
        return (
          <Text type={diff >= 0 ? 'danger' : 'success'}>
            {diff >= 0 ? '+' : ''}
            {diff.toLocaleString()}원
          </Text>
        );
      },
    },
    {
      title: '등록일',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (value: string) => new Date(value).toLocaleString('ko-KR'),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail?.(record)}
          >
            상세
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={
        pagination
          ? {
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: pagination.onChange,
              showSizeChanger: true,
              showTotal: (total) => `총 ${total}건`,
            }
          : false
      }
      scroll={{ x: 1000 }}
      className={styles.table}
    />
  );
}

export default HistoryTable;
