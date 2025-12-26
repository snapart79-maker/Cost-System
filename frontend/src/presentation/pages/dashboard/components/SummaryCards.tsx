/**
 * SummaryCards Component
 * 대시보드 요약 카드
 */

import { Row, Col, Card, Statistic, Skeleton } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import styles from './SummaryCards.module.css';

export interface SummaryData {
  change_count: number;
  pending_settlements: number;
  total_settlement_amount: number;
}

export interface SummaryCardsProps {
  data?: SummaryData;
  loading?: boolean;
}

export function SummaryCards({ data, loading = false }: SummaryCardsProps) {
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((i) => (
          <Col xs={24} sm={8} key={i}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} className={styles.container}>
      <Col xs={24} sm={8}>
        <Card hoverable className={styles.card}>
          <Statistic
            title="이번 달 변경 건수"
            value={data?.change_count || 0}
            prefix={<FileTextOutlined className={styles.iconBlue} />}
            suffix="건"
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card hoverable className={styles.card}>
          <Statistic
            title="정산 대기 건"
            value={data?.pending_settlements || 0}
            prefix={<ClockCircleOutlined className={styles.iconOrange} />}
            suffix="건"
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card hoverable className={styles.card}>
          <Statistic
            title="총 정산 금액"
            value={data?.total_settlement_amount || 0}
            prefix={<DollarOutlined className={styles.iconGreen} />}
            precision={0}
            suffix="원"
            valueStyle={{
              color: (data?.total_settlement_amount || 0) >= 0 ? '#cf1322' : '#3f8600',
            }}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default SummaryCards;
