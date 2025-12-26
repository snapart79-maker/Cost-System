/**
 * DashboardPage
 * 대시보드 페이지
 */

import { Row, Col } from 'antd';
import { PageHeader } from '@/presentation/components/common/PageHeader';
import { usePriceChange } from '@/application/hooks/use-price-change';
import { useSettlement } from '@/application/hooks/use-settlement';
import { SummaryCards, RecentChanges, QuickActions } from './components';
import type { SummaryData } from './components';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  // Fetch price changes for recent changes
  const { priceChanges, isLoading: priceChangesLoading } = usePriceChange({
    pageSize: 5,
  });

  // Fetch settlement summary
  const { useSettlementSummary } = useSettlement();
  const { data: settlementSummary, isLoading: summaryLoading } = useSettlementSummary();

  // Build summary data
  const summaryData: SummaryData = {
    change_count: priceChanges?.length || 0,
    pending_settlements: settlementSummary?.pending_count || 0,
    total_settlement_amount: settlementSummary?.total_amount || 0,
  };

  return (
    <div className={styles.container}>
      <PageHeader title="대시보드" />

      <SummaryCards data={summaryData} loading={summaryLoading || priceChangesLoading} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <RecentChanges data={priceChanges} loading={priceChangesLoading} />
        </Col>
        <Col xs={24} lg={8}>
          <QuickActions />
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
