/**
 * SettlementHistoryPage
 * 정산 이력 페이지
 */

import { useState, useCallback } from 'react';
import { Card, Table, Button, Space, Form, DatePicker, Select, Modal, Descriptions, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import { PageHeader } from '@/presentation/components/common/PageHeader';
import { useSettlement } from '@/application/hooks/use-settlement';
import { useProducts } from '@/application/hooks/use-products';
import { apiClient } from '@/infrastructure/api/client';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import { PeriodTypeLabels } from '@/domain/entities/settlement';
import type { Settlement } from '@/domain/entities/settlement';
import styles from './SettlementHistoryPage.module.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface SearchValues {
  product_id?: string;
  date_range?: [Dayjs, Dayjs];
}

export function SettlementHistoryPage() {
  const [form] = Form.useForm<SearchValues>();
  const [detailModal, setDetailModal] = useState<Settlement | null>(null);

  const { useSettlementHistory } = useSettlement();
  const { data: historyData, isLoading } = useSettlementHistory();
  const { products, isLoading: productsLoading } = useProducts();

  const handleSearch = useCallback((values: SearchValues) => {
    // In real implementation, this would trigger a new query with filters
    console.log('Search values:', values);
  }, []);

  const handleReset = () => {
    form.resetFields();
  };

  const handleViewDetail = useCallback((record: Settlement) => {
    setDetailModal(record);
  }, []);

  const handleExportPdf = async (id: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PDF_SETTLEMENT(id), {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `settlement-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const handleExportExcel = async (id: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXCEL_EXPORT_SETTLEMENT(id), {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `settlement-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Excel export error:', error);
    }
  };

  const columns: ColumnsType<Settlement> = [
    {
      title: '정산 ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'ECO 번호',
      key: 'eco_number',
      width: 120,
      render: (_, record) => record.price_change?.eco_number || '-',
    },
    {
      title: '정산 기간',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <span>
          {record.condition.start_date} ~ {record.condition.end_date}
        </span>
      ),
    },
    {
      title: '조회 단위',
      key: 'period_type',
      width: 100,
      render: (_, record) => PeriodTypeLabels[record.condition.period_type],
    },
    {
      title: '품목 수',
      key: 'product_count',
      width: 80,
      align: 'center',
      render: (_, record) => record.results?.length || 0,
    },
    {
      title: '총 정산 금액',
      dataIndex: 'total_settlement_amount',
      key: 'total_settlement_amount',
      width: 150,
      align: 'right',
      render: (value: number) => (
        <Text type={value >= 0 ? 'danger' : 'success'} strong>
          {value >= 0 ? '+' : ''}
          {value?.toLocaleString()}원
        </Text>
      ),
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            상세
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FilePdfOutlined />}
            onClick={() => handleExportPdf(record.id)}
          >
            PDF
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileExcelOutlined />}
            onClick={() => handleExportExcel(record.id)}
          >
            Excel
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="정산 이력" />

      <Card className={styles.searchCard}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="product_id" label="품목">
            <Select
              placeholder="전체"
              allowClear
              style={{ width: 200 }}
              loading={productsLoading}
              options={products?.map((p) => ({
                value: p.id,
                label: `${p.product_id} - ${p.name}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="date_range" label="기간">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                검색
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                초기화
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={historyData?.items || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: historyData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="정산 상세"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={800}
      >
        {detailModal && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="정산 ID">{detailModal.id}</Descriptions.Item>
              <Descriptions.Item label="ECO 번호">
                {detailModal.price_change?.eco_number || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="정산 기간">
                {detailModal.condition.start_date} ~ {detailModal.condition.end_date}
              </Descriptions.Item>
              <Descriptions.Item label="조회 단위">
                {PeriodTypeLabels[detailModal.condition.period_type]}
              </Descriptions.Item>
              <Descriptions.Item label="총 정산 금액" span={2}>
                <Text type={detailModal.total_settlement_amount >= 0 ? 'danger' : 'success'} strong>
                  {detailModal.total_settlement_amount >= 0 ? '+' : ''}
                  {detailModal.total_settlement_amount?.toLocaleString()}원
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="등록일">
                {new Date(detailModal.created_at).toLocaleString('ko-KR')}
              </Descriptions.Item>
              <Descriptions.Item label="등록자">{detailModal.created_by}</Descriptions.Item>
            </Descriptions>

            <Card title="품목별 정산 내역" size="small">
              <Table
                dataSource={detailModal.results}
                rowKey="product_id"
                size="small"
                pagination={false}
                columns={[
                  {
                    title: '품목',
                    key: 'product',
                    render: (_, record) => record.product?.name || record.product_id,
                  },
                  {
                    title: '총 수량',
                    dataIndex: 'total_quantity',
                    align: 'right',
                    render: (v) => v?.toLocaleString(),
                  },
                  {
                    title: '단가 변동',
                    dataIndex: 'unit_price_diff',
                    align: 'right',
                    render: (v) => `${v >= 0 ? '+' : ''}${v?.toLocaleString()}원`,
                  },
                  {
                    title: '정산 금액',
                    dataIndex: 'settlement_amount',
                    align: 'right',
                    render: (v) => (
                      <Text type={v >= 0 ? 'danger' : 'success'}>
                        {v >= 0 ? '+' : ''}
                        {v?.toLocaleString()}원
                      </Text>
                    ),
                  },
                ]}
              />
            </Card>
          </>
        )}
      </Modal>
    </div>
  );
}

export default SettlementHistoryPage;
