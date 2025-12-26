/**
 * ProductSelector Component
 * 완제품 선택 컴포넌트
 */

import { useMemo } from 'react';
import { Select, Card, Descriptions, Spin } from 'antd';
import { useProducts } from '@/application/hooks';
import type { Product } from '@/domain/entities/product';
import styles from './ProductSelector.module.css';

export interface ProductSelectorProps {
  value?: string;
  onChange?: (productId: string, product: Product) => void;
  disabled?: boolean;
}

export function ProductSelector({
  value,
  onChange,
  disabled = false,
}: ProductSelectorProps) {
  const { products, isLoading } = useProducts();

  const selectedProduct = useMemo(() => {
    if (!value || !products) return null;
    return products.find((p) => p.id === value) || null;
  }, [value, products]);

  const options = useMemo(() => {
    if (!products) return [];
    return products.map((product) => ({
      label: `${product.product_id} - ${product.name}`,
      value: product.id,
      product,
    }));
  }, [products]);

  const handleChange = (productId: string) => {
    const selected = products?.find((p) => p.id === productId);
    if (selected && onChange) {
      onChange(productId, selected);
    }
  };

  return (
    <Card title="완제품 선택" className={styles.container}>
      <div className={styles.selectorRow}>
        <Select
          showSearch
          placeholder="완제품을 선택하세요"
          value={value}
          onChange={handleChange}
          loading={isLoading}
          disabled={disabled}
          optionFilterProp="label"
          options={options}
          className={styles.selector}
          aria-label="완제품"
          size="large"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <Spin tip="로딩 중..." />
        </div>
      )}

      {selectedProduct && (
        <Descriptions
          column={2}
          bordered
          size="small"
          className={styles.productInfo}
        >
          <Descriptions.Item label="품번">
            {selectedProduct.product_id}
          </Descriptions.Item>
          <Descriptions.Item label="품명">
            {selectedProduct.name}
          </Descriptions.Item>
          <Descriptions.Item label="고객사">
            {selectedProduct.customer_name}
          </Descriptions.Item>
          <Descriptions.Item label="고객 품번">
            {selectedProduct.customer_pn || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="차종">
            {selectedProduct.vehicle_model || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            {selectedProduct.status}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
}

export default ProductSelector;
