/**
 * SettlementResultTable Component
 * 정산 결과 테이블
 */

import { useMemo } from 'react';
import { Card, Table, Typography, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SettlementResult } from '@/domain/entities/settlement';
import styles from './SettlementResultTable.module.css';

const { Text } = Typography;

export interface SettlementResultTableProps {
  results: SettlementResult[];
  totalAmount: number;
  loading?: boolean;
}

interface TableRow extends SettlementResult {
  key: string;
  productName?: string;
}

export function SettlementResultTable({
  results,
  totalAmount,
  loading = false,
}: SettlementResultTableProps) {
  // Convert to table data
  const tableData: TableRow[] = useMemo(() => {
    return results.map((item, index) => ({
      ...item,
      key: `${item.product_id}-${index}`,
      productName: item.product?.name || item.product_id,
    }));
  }, [results]);

  // Table columns
  const columns: ColumnsType<TableRow> = [
    {
      title: '품목',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
    },
    {
      title: '품번',
      dataIndex: ['product', 'product_id'],
      key: 'product_id',
      width: 120,
    },
    {
      title: '총 수량',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 120,
      align: 'right',
      render: (value: number) => value?.toLocaleString() || '0',
    },
    {
      title: '단가 변동',
      dataIndex: 'unit_price_diff',
      key: 'unit_price_diff',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <span className={value >= 0 ? styles.increase : styles.decrease}>
          {value >= 0 ? '+' : ''}
          {value?.toLocaleString() || '0'}원
        </span>
      ),
    },
    {
      title: '정산 금액',
      dataIndex: 'settlement_amount',
      key: 'settlement_amount',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <Text strong className={value >= 0 ? styles.increase : styles.decrease}>
          {value >= 0 ? '+' : ''}
          {value?.toLocaleString() || '0'}원
        </Text>
      ),
    },
  ];

  // Expandable period details
  const expandedRowRender = (record: TableRow) => {
    if (!record.period_details || record.period_details.length === 0) {
      return null;
    }

    const detailColumns: ColumnsType<{ period: string; quantity: number; amount: number }> = [
      {
        title: '기간',
        dataIndex: 'period',
        key: 'period',
        width: 120,
      },
      {
        title: '수량',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
        align: 'right',
        render: (value: number) => value?.toLocaleString() || '0',
      },
      {
        title: '금액',
        dataIndex: 'amount',
        key: 'amount',
        width: 120,
        align: 'right',
        render: (value: number) => (
          <span className={value >= 0 ? styles.increase : styles.decrease}>
            {value >= 0 ? '+' : ''}
            {value?.toLocaleString() || '0'}원
          </span>
        ),
      },
    ];

    return (
      <Table
        columns={detailColumns}
        dataSource={record.period_details.map((d, i) => ({ ...d, key: `${record.key}-${i}` }))}
        pagination={false}
        size="small"
      />
    );
  };

  if (results.length === 0 && !loading) {
    return (
      <Card title="정산 결과" className={styles.container}>
        <Empty
          description="정산 조건을 설정하고 계산하기 버튼을 클릭하세요"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card title="정산 결과" className={styles.container}>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        loading={loading}
        scroll={{ x: 700 }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) =>
            record.period_details && record.period_details.length > 0,
        }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row className={styles.summaryRow}>
              <Table.Summary.Cell index={0} colSpan={4}>
                <Text strong>총 정산 금액</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong className={totalAmount >= 0 ? styles.increase : styles.decrease}>
                  {totalAmount >= 0 ? '+' : ''}
                  {totalAmount.toLocaleString()}원
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </Card>
  );
}

export default SettlementResultTable;
