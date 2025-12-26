/**
 * CostSummaryCard Component
 * 원가 요약 카드 컴포넌트
 */

import { Card, Statistic, Row, Col, Typography, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styles from './CostComponents.module.css';

const { Text } = Typography;

export interface CostItem {
  label: string;
  value: number;
  previousValue?: number;
  tooltip?: string;
  unit?: string;
  highlight?: boolean;
}

export interface CostSummaryCardProps {
  title: string;
  items: CostItem[];
  totalLabel?: string;
  totalValue?: number;
  previousTotalValue?: number;
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

export function CostSummaryCard({
  title,
  items,
  totalLabel = '합계',
  totalValue,
  previousTotalValue,
  columns = 3,
  loading = false,
  className,
}: CostSummaryCardProps) {
  const calculateChange = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const renderChangeIndicator = (current: number, previous?: number) => {
    const change = calculateChange(current, previous);
    if (change === null) return null;

    const isIncrease = change > 0;
    const absChange = Math.abs(change);

    return (
      <span
        className={`${styles.changeIndicator} ${isIncrease ? styles.increase : styles.decrease}`}
      >
        {isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        {absChange.toFixed(1)}%
      </span>
    );
  };

  const colSpan = 24 / columns;

  return (
    <Card
      title={title}
      loading={loading}
      className={`${styles.summaryCard} ${className || ''}`}
    >
      <Row gutter={[16, 16]}>
        {items.map((item, index) => (
          <Col span={colSpan} key={index}>
            <div
              className={`${styles.costItem} ${item.highlight ? styles.highlight : ''}`}
            >
              <div className={styles.costLabel}>
                <Text type="secondary">{item.label}</Text>
                {item.tooltip && (
                  <Tooltip title={item.tooltip}>
                    <InfoCircleOutlined className={styles.infoIcon} />
                  </Tooltip>
                )}
              </div>
              <div className={styles.costValue}>
                <Statistic
                  value={item.value}
                  precision={2}
                  suffix={item.unit || '원'}
                  valueStyle={{
                    fontSize: item.highlight ? 20 : 16,
                    fontWeight: item.highlight ? 600 : 400,
                  }}
                />
                {renderChangeIndicator(item.value, item.previousValue)}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {totalValue !== undefined && (
        <div className={styles.totalSection}>
          <div className={styles.totalLabel}>
            <Text strong>{totalLabel}</Text>
          </div>
          <div className={styles.totalValue}>
            <Statistic
              value={totalValue}
              precision={2}
              suffix="원"
              valueStyle={{ fontSize: 24, fontWeight: 700, color: '#1890ff' }}
            />
            {renderChangeIndicator(totalValue, previousTotalValue)}
          </div>
        </div>
      )}
    </Card>
  );
}

export default CostSummaryCard;
