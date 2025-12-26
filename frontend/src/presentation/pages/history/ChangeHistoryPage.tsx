/**
 * ChangeHistoryPage
 * 변경 이력 페이지
 */

import { useState, useCallback } from 'react';
import { Card, Modal, Descriptions, Tag, Typography } from 'antd';
import { PageHeader } from '@/presentation/components/common/PageHeader';
import { usePriceChange } from '@/application/hooks/use-price-change';
import { HistorySearchForm, HistoryTable } from './components';
import type { HistorySearchValues } from './components';
import type { PriceChange } from '@/domain/entities/price-change';
import styles from './ChangeHistoryPage.module.css';

const { Text } = Typography;

const CHANGE_TYPE_LABELS: Record<string, string> = {
  MATERIAL: '자재 변경',
  PROCESS: '공정 변경',
  COMBINED: '복합 변경',
};

export function ChangeHistoryPage() {
  const [searchValues, setSearchValues] = useState<HistorySearchValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailModal, setDetailModal] = useState<PriceChange | null>(null);

  // Fetch price changes with filters
  const { priceChanges, isLoading, pagination } = usePriceChange({
    product_id: searchValues.product_id,
    start_date: searchValues.date_range?.[0]?.format('YYYY-MM-DD'),
    end_date: searchValues.date_range?.[1]?.format('YYYY-MM-DD'),
    eco_number: searchValues.eco_number,
    page,
    pageSize,
  });

  // Handle search
  const handleSearch = useCallback((values: HistorySearchValues) => {
    setSearchValues(values);
    setPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  // Handle view detail
  const handleViewDetail = useCallback((record: PriceChange) => {
    setDetailModal(record);
  }, []);

  // Filter by change type on client side
  const filteredData = priceChanges?.filter((item) => {
    if (searchValues.change_type && item.change_type !== searchValues.change_type) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className={styles.container}>
      <PageHeader title="변경 이력" />

      <Card className={styles.searchCard}>
        <HistorySearchForm onSearch={handleSearch} loading={isLoading} />
      </Card>

      <Card className={styles.tableCard}>
        <HistoryTable
          data={filteredData}
          loading={isLoading}
          onViewDetail={handleViewDetail}
          pagination={{
            current: page,
            pageSize,
            total: pagination?.total || 0,
            onChange: handlePageChange,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="변경 이력 상세"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={700}
      >
        {detailModal && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="ECO 번호">
              {detailModal.eco_number || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="변경 유형">
              <Tag>{CHANGE_TYPE_LABELS[detailModal.change_type] || detailModal.change_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="품목명">
              {detailModal.product?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="품번">
              {detailModal.product?.product_id || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="변경 사유" span={2}>
              {detailModal.change_reason}
            </Descriptions.Item>
            <Descriptions.Item label="적용일">
              {detailModal.effective_date}
            </Descriptions.Item>
            <Descriptions.Item label="등록일">
              {new Date(detailModal.created_at).toLocaleString('ko-KR')}
            </Descriptions.Item>
            <Descriptions.Item label="변경 전 원가">
              {detailModal.before_cost?.toLocaleString()}원
            </Descriptions.Item>
            <Descriptions.Item label="변경 후 원가">
              {detailModal.after_cost?.toLocaleString()}원
            </Descriptions.Item>
            <Descriptions.Item label="원가 변동" span={2}>
              <Text type={detailModal.cost_diff >= 0 ? 'danger' : 'success'} strong>
                {detailModal.cost_diff >= 0 ? '+' : ''}
                {detailModal.cost_diff?.toLocaleString()}원
              </Text>
            </Descriptions.Item>
            {detailModal.material_changes && detailModal.material_changes.length > 0 && (
              <Descriptions.Item label="자재 변경 내역" span={2}>
                {detailModal.material_changes.length}개 항목 변경
              </Descriptions.Item>
            )}
            {detailModal.process_changes && detailModal.process_changes.length > 0 && (
              <Descriptions.Item label="공정 변경 내역" span={2}>
                {detailModal.process_changes.length}개 항목 변경
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default ChangeHistoryPage;
