/**
 * CostComparisonView Component
 * 원가 비교 뷰 컴포넌트 (변경 전/후/차이)
 */

import { Card, Row, Col, Typography, Divider, Statistic } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import styles from './CostComponents.module.css';

const { Text, Title } = Typography;

export interface CostComparisonItem {
  label: string;
  before: number;
  after: number;
  unit?: string;
}

export interface CostComparisonViewProps {
  title?: string;
  items: CostComparisonItem[];
  totalLabel?: string;
  showPercentage?: boolean;
  loading?: boolean;
  className?: string;
}

export function CostComparisonView({
  title = '원가 비교',
  items,
  totalLabel = '구매원가',
  showPercentage = true,
  loading = false,
  className,
}: CostComparisonViewProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateDiff = (before: number, after: number) => {
    return after - before;
  };

  const calculatePercentage = (before: number, after: number) => {
    if (before === 0) return 0;
    return ((after - before) / before) * 100;
  };

  const getDiffIcon = (diff: number) => {
    if (diff > 0) return <ArrowUpOutlined />;
    if (diff < 0) return <ArrowDownOutlined />;
    return <MinusOutlined />;
  };

  const getDiffColor = (diff: number) => {
    if (diff > 0) return '#ff4d4f';
    if (diff < 0) return '#52c41a';
    return '#8c8c8c';
  };

  // Calculate totals
  const totalBefore = items.reduce((sum, item) => sum + item.before, 0);
  const totalAfter = items.reduce((sum, item) => sum + item.after, 0);
  const totalDiff = calculateDiff(totalBefore, totalAfter);
  const totalPercentage = calculatePercentage(totalBefore, totalAfter);

  return (
    <Card
      title={title}
      loading={loading}
      className={`${styles.comparisonCard} ${className || ''}`}
    >
      {/* Header Row */}
      <Row className={styles.comparisonHeader}>
        <Col span={6}>
          <Text strong>항목</Text>
        </Col>
        <Col span={6} className={styles.textRight}>
          <Text strong>변경 전</Text>
        </Col>
        <Col span={6} className={styles.textRight}>
          <Text strong>변경 후</Text>
        </Col>
        <Col span={6} className={styles.textRight}>
          <Text strong>차이</Text>
        </Col>
      </Row>

      <Divider className={styles.divider} />

      {/* Item Rows */}
      {items.map((item, index) => {
        const diff = calculateDiff(item.before, item.after);
        const percentage = calculatePercentage(item.before, item.after);

        return (
          <Row key={index} className={styles.comparisonRow}>
            <Col span={6}>
              <Text>{item.label}</Text>
            </Col>
            <Col span={6} className={styles.textRight}>
              <Text>{formatCurrency(item.before)}</Text>
            </Col>
            <Col span={6} className={styles.textRight}>
              <Text>{formatCurrency(item.after)}</Text>
            </Col>
            <Col span={6} className={styles.textRight}>
              <span style={{ color: getDiffColor(diff) }}>
                {getDiffIcon(diff)} {formatCurrency(Math.abs(diff))}
                {showPercentage && diff !== 0 && (
                  <Text type="secondary" className={styles.percentage}>
                    ({percentage > 0 ? '+' : ''}
                    {percentage.toFixed(1)}%)
                  </Text>
                )}
              </span>
            </Col>
          </Row>
        );
      })}

      <Divider className={styles.divider} />

      {/* Total Row */}
      <Row className={styles.totalRow}>
        <Col span={6}>
          <Title level={5} style={{ margin: 0 }}>
            {totalLabel}
          </Title>
        </Col>
        <Col span={6} className={styles.textRight}>
          <Statistic
            value={totalBefore}
            precision={2}
            suffix="원"
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
        <Col span={6} className={styles.textRight}>
          <Statistic
            value={totalAfter}
            precision={2}
            suffix="원"
            valueStyle={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}
          />
        </Col>
        <Col span={6} className={styles.textRight}>
          <Statistic
            value={Math.abs(totalDiff)}
            precision={2}
            prefix={getDiffIcon(totalDiff)}
            suffix={
              showPercentage
                ? ` (${totalPercentage > 0 ? '+' : ''}${totalPercentage.toFixed(1)}%)`
                : ''
            }
            valueStyle={{
              fontSize: 16,
              fontWeight: 600,
              color: getDiffColor(totalDiff),
            }}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default CostComparisonView;
