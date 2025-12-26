/**
 * CostSheetPage
 * 원가 계산서 조회 페이지
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Tabs, Select, Space, Descriptions, Empty, Spin } from 'antd';
import { PageHeader } from '@/presentation/components/common/PageHeader';
import { useCostCalculation } from '@/application/hooks/use-cost-calculation';
import { useProducts } from '@/application/hooks';
import {
  WorkTypeFilter,
  ExportOptions,
  CostSummarySection,
  MaterialCostTab,
  ProcessCostTab,
  type WorkTypeFilterValue,
} from './components';
import styles from './CostSheetPage.module.css';

export function CostSheetPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productIdFromUrl = searchParams.get('product');

  // State
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    productIdFromUrl || undefined
  );
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkTypeFilterValue>('ALL');

  // Hooks
  const { products, isLoading: productsLoading } = useProducts();
  const { costBreakdown, isLoading: costLoading } = useCostCalculation({
    productId: selectedProductId,
    enabled: !!selectedProductId,
  });

  // Selected product info
  const selectedProduct = useMemo(() => {
    if (!selectedProductId || !products) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  }, [selectedProductId, products]);

  // Product options for Select
  const productOptions = useMemo(() => {
    if (!products) return [];
    return products.map((product) => ({
      label: `${product.product_id} - ${product.name}`,
      value: product.id,
      product,
    }));
  }, [products]);

  // Handle product selection
  const handleProductChange = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setSearchParams({ product: productId });
  }, [setSearchParams]);

  // Sync URL param with state on mount
  useEffect(() => {
    if (productIdFromUrl && productIdFromUrl !== selectedProductId) {
      setSelectedProductId(productIdFromUrl);
    }
  }, [productIdFromUrl, selectedProductId]);

  // Tab items
  const tabItems = [
    {
      key: 'material',
      label: '재료비 상세',
      children: (
        <MaterialCostTab
          materialDetails={costBreakdown?.material_details || []}
          workTypeFilter={workTypeFilter}
          loading={costLoading}
        />
      ),
    },
    {
      key: 'process',
      label: '가공비 상세',
      children: (
        <ProcessCostTab
          processDetails={costBreakdown?.process_details || []}
          workTypeFilter={workTypeFilter}
          loading={costLoading}
        />
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="원가 계산서"
        subtitle="완제품별 원가 구성을 조회하고 PDF/Excel로 내보낼 수 있습니다"
      />

      {/* Product Selection & Filters */}
      <Card className={styles.filterCard}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <Space size="large">
              <span className={styles.label}>완제품 선택</span>
              <Select
                showSearch
                placeholder="완제품을 선택하세요"
                value={selectedProductId}
                onChange={handleProductChange}
                loading={productsLoading}
                optionFilterProp="label"
                options={productOptions}
                className={styles.productSelect}
                aria-label="완제품"
                size="large"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Space>
          </Col>
          <Col span={12}>
            <Space size="large" className={styles.rightControls}>
              <WorkTypeFilter
                value={workTypeFilter}
                onChange={setWorkTypeFilter}
              />
              <ExportOptions
                productId={selectedProductId}
                workType={workTypeFilter}
                disabled={!selectedProductId}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Product Info */}
      {selectedProduct && (
        <Card size="small" className={styles.productInfoCard}>
          <Descriptions column={4} size="small">
            <Descriptions.Item label="품번">
              {selectedProduct.product_id}
            </Descriptions.Item>
            <Descriptions.Item label="품명">
              {selectedProduct.name}
            </Descriptions.Item>
            <Descriptions.Item label="고객사">
              {selectedProduct.customer_name}
            </Descriptions.Item>
            <Descriptions.Item label="차종">
              {selectedProduct.vehicle_model || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Content Area */}
      {!selectedProductId ? (
        <Card className={styles.emptyCard}>
          <Empty
            description="완제품을 선택하면 원가 계산서를 조회할 수 있습니다"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : costLoading ? (
        <Card className={styles.loadingCard}>
          <div className={styles.loadingWrapper}>
            <Spin size="large" tip="원가 데이터를 불러오는 중..." />
          </div>
        </Card>
      ) : (
        <>
          {/* Cost Summary */}
          <CostSummarySection
            costBreakdown={costBreakdown}
            workTypeFilter={workTypeFilter}
            loading={costLoading}
          />

          {/* Cost Details Tabs */}
          <Card className={styles.detailsCard}>
            <Tabs items={tabItems} />
          </Card>
        </>
      )}
    </div>
  );
}

export default CostSheetPage;
