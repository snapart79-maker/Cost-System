/**
 * ReceiptQuantityTable Component
 * 입고 수량 입력 테이블
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, Button, Space, Upload, InputNumber, message } from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { apiClient } from '@/infrastructure/api/client';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ReceiptQuantity, SettlementCondition } from '@/domain/entities/settlement';
import type { Product } from '@/domain/entities/product';
import styles from './ReceiptQuantityTable.module.css';

export interface ReceiptQuantityTableProps {
  condition: Partial<SettlementCondition> | null;
  products: Product[];
  value: ReceiptQuantity[];
  onChange: (quantities: ReceiptQuantity[]) => void;
  disabled?: boolean;
}

interface TableRow extends ReceiptQuantity {
  key: string;
  productName?: string;
}

export function ReceiptQuantityTable({
  condition,
  products,
  value,
  onChange,
  disabled = false,
}: ReceiptQuantityTableProps) {
  const [loading, setLoading] = useState(false);

  // Generate periods based on condition
  const periods = useMemo(() => {
    if (!condition?.start_date || !condition?.end_date || !condition?.period_type) {
      return [];
    }

    const result: string[] = [];
    const start = dayjs(condition.start_date);
    const end = dayjs(condition.end_date);
    const periodType = condition.period_type;

    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      if (periodType === 'DAILY') {
        result.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      } else if (periodType === 'MONTHLY') {
        result.push(current.format('YYYY-MM'));
        current = current.add(1, 'month');
      } else if (periodType === 'YEARLY') {
        result.push(current.format('YYYY'));
        current = current.add(1, 'year');
      }
    }

    return result;
  }, [condition]);

  // Initialize quantities when condition changes
  useEffect(() => {
    if (condition?.product_ids && periods.length > 0 && value.length === 0) {
      const initialQuantities: ReceiptQuantity[] = [];
      condition.product_ids.forEach((productId) => {
        periods.forEach((period) => {
          initialQuantities.push({
            product_id: productId,
            period,
            quantity: 0,
          });
        });
      });
      onChange(initialQuantities);
    }
  }, [condition?.product_ids, periods, value.length, onChange]);

  // Convert to table data
  const tableData: TableRow[] = useMemo(() => {
    return value.map((item, index) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        ...item,
        key: `${item.product_id}-${item.period}-${index}`,
        productName: product?.name || item.product_id,
      };
    });
  }, [value, products]);

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (productId: string, period: string, quantity: number) => {
      const updated = value.map((item) =>
        item.product_id === productId && item.period === period
          ? { ...item, quantity }
          : item
      );
      onChange(updated);
    },
    [value, onChange]
  );

  // Handle Excel template download
  const handleTemplateDownload = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.EXCEL_TEMPLATE('receipt'), {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'receipt-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('양식 다운로드 완료');
    } catch (error) {
      message.error('양식 다운로드에 실패했습니다');
      console.error('Template download error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel upload
  const handleExcelUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(API_ENDPOINTS.EXCEL_IMPORT_RECEIPT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.items) {
        // Merge imported data with existing
        const imported = response.data.items as ReceiptQuantity[];
        const updatedQuantities = [...value];

        imported.forEach((importedItem) => {
          const existingIndex = updatedQuantities.findIndex(
            (q) => q.product_id === importedItem.product_id && q.period === importedItem.period
          );
          if (existingIndex >= 0) {
            updatedQuantities[existingIndex] = importedItem;
          } else {
            updatedQuantities.push(importedItem);
          }
        });

        onChange(updatedQuantities);
        message.success(`${imported.length}개 항목을 가져왔습니다`);
      }
    } catch (error) {
      message.error('Excel 업로드에 실패했습니다');
      console.error('Excel upload error:', error);
    } finally {
      setLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  // Generate columns dynamically based on period type
  const columns: ColumnsType<TableRow> = useMemo(() => {
    const baseColumns: ColumnsType<TableRow> = [
      {
        title: '품목',
        dataIndex: 'productName',
        key: 'productName',
        fixed: 'left',
        width: 200,
      },
      {
        title: '기간',
        dataIndex: 'period',
        key: 'period',
        width: 120,
      },
      {
        title: '입고 수량',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 150,
        render: (quantity: number, record: TableRow) => (
          <InputNumber
            value={quantity}
            min={0}
            onChange={(value) =>
              handleQuantityChange(record.product_id, record.period, value || 0)
            }
            disabled={disabled}
            style={{ width: '100%' }}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
          />
        ),
      },
    ];

    return baseColumns;
  }, [handleQuantityChange, disabled]);

  // Calculate totals
  const totalQuantity = useMemo(() => {
    return value.reduce((sum, item) => sum + item.quantity, 0);
  }, [value]);

  const hasData = condition?.product_ids && condition.product_ids.length > 0;

  return (
    <Card
      title="입고 수량"
      className={styles.container}
      extra={
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleTemplateDownload}
            loading={loading}
            disabled={disabled}
          >
            양식 다운로드
          </Button>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={handleExcelUpload}
            disabled={disabled || loading}
          >
            <Button icon={<UploadOutlined />} disabled={disabled}>
              Excel 업로드
            </Button>
          </Upload>
        </Space>
      }
    >
      {hasData ? (
        <>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: 500 }}
            size="small"
            loading={loading}
          />
          <div className={styles.summary}>
            <span className={styles.label}>총 입고 수량:</span>
            <span className={styles.value}>{totalQuantity.toLocaleString()}</span>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          정산 조건을 먼저 설정해주세요.
        </div>
      )}
    </Card>
  );
}

export default ReceiptQuantityTable;
