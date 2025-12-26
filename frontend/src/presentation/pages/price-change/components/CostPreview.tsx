/**
 * CostPreview Component
 * 원가 미리보기 컴포넌트 - 실시간 업데이트
 */

import { useEffect } from 'react';
import { Card, Table, Spin, Typography, Statistic, Row, Col, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { useCostCalculation } from '@/application/hooks';
import type { CostPreviewResult, CostComparisonInput } from '@/domain/entities/cost-calculation';
import styles from './CostPreview.module.css';

const { Text } = Typography;

export interface CostPreviewProps {
  productId?: string;
  previewData?: CostComparisonInput;
  onPreviewUpdate?: (result: CostPreviewResult | null) => void;
}

export function CostPreview({
  productId,
  previewData,
  onPreviewUpdate,
}: CostPreviewProps) {
  const { costBreakdown, isLoading, preview } = useCostCalculation({
    productId,
    enabled: !!productId,
  });

  // Trigger preview when data changes
  useEffect(() => {
    if (previewData && previewData.product_id) {
      preview.mutate(previewData);
    }
  }, [previewData, preview]);

  // Notify parent of preview result
  useEffect(() => {
    if (onPreviewUpdate) {
      onPreviewUpdate(preview.data || null);
    }
  }, [preview.data, onPreviewUpdate]);

  const previewResult = preview.data;

  const columns = [
    {
      title: '항목',
      dataIndex: 'label',
      key: 'label',
      width: 150,
    },
    {
      title: '변경 전',
      dataIndex: 'before',
      key: 'before',
      width: 120,
      align: 'right' as const,
      render: (value: number) => (
        <Text>{value?.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}</Text>
      ),
    },
    {
      title: '변경 후',
      dataIndex: 'after',
      key: 'after',
      width: 120,
      align: 'right' as const,
      render: (value: number) => (
        <Text strong>{value?.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}</Text>
      ),
    },
    {
      title: '차이',
      dataIndex: 'diff',
      key: 'diff',
      width: 120,
      align: 'right' as const,
      render: (value: number) => {
        if (value === 0) {
          return (
            <Text type="secondary">
              <MinusOutlined /> 0
            </Text>
          );
        }
        if (value > 0) {
          return (
            <Text type="danger">
              <ArrowUpOutlined /> +{value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
            </Text>
          );
        }
        return (
          <Text type="success">
            <ArrowDownOutlined /> {value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}
          </Text>
        );
      },
    },
  ];

  const getDataSource = () => {
    if (!previewResult) {
      // Show initial data from costBreakdown
      if (costBreakdown) {
        return [
          {
            key: 'material',
            label: '재료비',
            before: costBreakdown.total_material_cost,
            after: costBreakdown.total_material_cost,
            diff: 0,
          },
          {
            key: 'labor',
            label: '노무비',
            before: costBreakdown.total_labor_cost,
            after: costBreakdown.total_labor_cost,
            diff: 0,
          },
          {
            key: 'expense',
            label: '경비',
            before: costBreakdown.total_expense,
            after: costBreakdown.total_expense,
            diff: 0,
          },
          {
            key: 'manufacturing',
            label: '제조원가',
            before: costBreakdown.total_manufacturing_cost,
            after: costBreakdown.total_manufacturing_cost,
            diff: 0,
          },
          {
            key: 'purchase',
            label: '구매원가',
            before: costBreakdown.total_purchase_cost,
            after: costBreakdown.total_purchase_cost,
            diff: 0,
            highlight: true,
          },
        ];
      }
      return [];
    }

    return [
      {
        key: 'material',
        label: '재료비',
        before: previewResult.before.material_cost,
        after: previewResult.after.material_cost,
        diff: previewResult.diff.material_cost,
      },
      {
        key: 'labor',
        label: '노무비',
        before: previewResult.before.labor_cost,
        after: previewResult.after.labor_cost,
        diff: previewResult.diff.labor_cost,
      },
      {
        key: 'expense',
        label: '경비',
        before: previewResult.before.expense,
        after: previewResult.after.expense,
        diff: previewResult.diff.expense,
      },
      {
        key: 'manufacturing',
        label: '제조원가',
        before: previewResult.before.manufacturing_cost,
        after: previewResult.after.manufacturing_cost,
        diff: previewResult.diff.manufacturing_cost,
      },
      {
        key: 'purchase',
        label: '구매원가',
        before: previewResult.before.purchase_cost,
        after: previewResult.after.purchase_cost,
        diff: previewResult.diff.purchase_cost,
        highlight: true,
      },
    ];
  };

  const purchaseCostDiff = previewResult?.diff.purchase_cost || 0;

  return (
    <Card
      title="원가 미리보기"
      className={styles.container}
      data-testid="cost-preview"
    >
      {isLoading || preview.isPending ? (
        <div className={styles.loading}>
          <Spin tip="계산 중..." />
        </div>
      ) : !productId ? (
        <div className={styles.empty}>완제품을 선택하면 원가 미리보기가 표시됩니다</div>
      ) : (
        <>
          {previewResult && (
            <Row gutter={16} className={styles.summaryRow}>
              <Col span={8}>
                <Card size="small" className={styles.summaryCard}>
                  <Statistic
                    title="변경 전 구매원가"
                    value={previewResult.before.purchase_cost}
                    precision={2}
                    suffix="원"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className={styles.summaryCard}>
                  <Statistic
                    title="변경 후 구매원가"
                    value={previewResult.after.purchase_cost}
                    precision={2}
                    suffix="원"
                    valueStyle={{ color: purchaseCostDiff > 0 ? '#cf1322' : purchaseCostDiff < 0 ? '#3f8600' : 'inherit' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className={styles.summaryCard}>
                  <Statistic
                    title="차이"
                    value={purchaseCostDiff}
                    precision={2}
                    prefix={purchaseCostDiff > 0 ? <ArrowUpOutlined /> : purchaseCostDiff < 0 ? <ArrowDownOutlined /> : null}
                    suffix="원"
                    valueStyle={{ color: purchaseCostDiff > 0 ? '#cf1322' : purchaseCostDiff < 0 ? '#3f8600' : 'inherit' }}
                  />
                  {purchaseCostDiff !== 0 && (
                    <Tag color={purchaseCostDiff > 0 ? 'red' : 'green'} className={styles.percentTag}>
                      {((purchaseCostDiff / previewResult.before.purchase_cost) * 100).toFixed(2)}%
                    </Tag>
                  )}
                </Card>
              </Col>
            </Row>
          )}

          <Table
            columns={columns}
            dataSource={getDataSource()}
            pagination={false}
            size="small"
            className={styles.table}
            rowClassName={(record) => (record.highlight ? styles.highlightRow : '')}
          />
        </>
      )}
    </Card>
  );
}

export default CostPreview;
