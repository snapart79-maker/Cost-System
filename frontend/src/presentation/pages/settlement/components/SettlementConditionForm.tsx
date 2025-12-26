/**
 * SettlementConditionForm Component
 * 정산 조건 설정 폼
 */

import { useState, useEffect } from 'react';
import { Card, Form, Select, DatePicker, Radio, Checkbox, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { usePriceChange } from '@/application/hooks/use-price-change';
import type { PriceChange } from '@/domain/entities/price-change';
import type { PeriodType, SettlementCondition } from '@/domain/entities/settlement';
import { PeriodTypeLabels } from '@/domain/entities/settlement';
import styles from './SettlementConditionForm.module.css';

const { RangePicker } = DatePicker;

export interface SettlementConditionFormProps {
  onChange: (condition: Partial<SettlementCondition>) => void;
  disabled?: boolean;
}

export function SettlementConditionForm({
  onChange,
  disabled = false,
}: SettlementConditionFormProps) {
  const [form] = Form.useForm();
  const [selectedPriceChange, setSelectedPriceChange] = useState<PriceChange | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [periodType, setPeriodType] = useState<PeriodType>('MONTHLY');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // Fetch price changes
  const { priceChanges, isLoading: priceChangesLoading } = usePriceChange();

  // Update parent when conditions change
  useEffect(() => {
    if (selectedPriceChange && selectedProductIds.length > 0 && dateRange) {
      onChange({
        price_change_id: selectedPriceChange.id,
        product_ids: selectedProductIds,
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
        period_type: periodType,
      });
    }
  }, [selectedPriceChange, selectedProductIds, dateRange, periodType, onChange]);

  // Handle price change selection
  const handlePriceChangeSelect = (priceChangeId: string) => {
    const priceChange = priceChanges?.find((pc) => pc.id === priceChangeId);
    if (priceChange) {
      setSelectedPriceChange(priceChange);
      // Auto-select the product from the price change
      if (priceChange.product_id) {
        setSelectedProductIds([priceChange.product_id]);
      }
      // Set default date range based on effective date
      const effectiveDate = dayjs(priceChange.effective_date);
      setDateRange([effectiveDate.startOf('month'), dayjs().endOf('month')]);
    }
  };

  // Handle product selection
  const handleProductChange = (checkedValues: string[]) => {
    setSelectedProductIds(checkedValues);
  };

  // Handle period type change
  const handlePeriodTypeChange = (value: PeriodType) => {
    setPeriodType(value);
  };

  // Handle date range change
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  // Get available products from selected price change
  const availableProducts = selectedPriceChange?.product ? [selectedPriceChange.product] : [];

  return (
    <Card title="정산 조건" className={styles.container}>
      <Form form={form} layout="vertical" disabled={disabled}>
        <Form.Item
          label="단가 변경 건"
          required
          tooltip="정산할 단가 변경 건을 선택합니다"
        >
          <Select
            placeholder="단가 변경 건 선택"
            loading={priceChangesLoading}
            onChange={handlePriceChangeSelect}
            value={selectedPriceChange?.id}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {priceChanges?.map((pc) => (
              <Select.Option key={pc.id} value={pc.id}>
                {pc.eco_number || `변경-${pc.id}`} - {pc.product?.name || pc.product_id} ({pc.effective_date})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedPriceChange && (
          <Form.Item
            label="적용 품목"
            required
            tooltip="정산에 포함할 품목을 선택합니다"
          >
            <Checkbox.Group
              value={selectedProductIds}
              onChange={handleProductChange as (checkedValue: (string | number | boolean)[]) => void}
            >
              <Space direction="vertical">
                {availableProducts.map((product) => (
                  <Checkbox key={product.id} value={product.id}>
                    {product.product_id} - {product.name}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        )}

        <Form.Item
          label="조회 단위"
          required
          tooltip="정산 계산의 시간 단위를 선택합니다"
        >
          <Radio.Group
            value={periodType}
            onChange={(e) => handlePeriodTypeChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            {Object.entries(PeriodTypeLabels).map(([value, label]) => (
              <Radio.Button key={value} value={value}>
                {label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="정산 기간"
          required
          tooltip="정산할 기간을 선택합니다"
        >
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            picker={periodType === 'YEARLY' ? 'year' : periodType === 'MONTHLY' ? 'month' : 'date'}
            style={{ width: '100%' }}
            placeholder={['시작일', '종료일']}
          />
        </Form.Item>

        {selectedPriceChange && (
          <div className={styles.changeInfo}>
            <div className={styles.infoItem}>
              <span className={styles.label}>변경 유형:</span>
              <span>{selectedPriceChange.change_type}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>변경 사유:</span>
              <span>{selectedPriceChange.change_reason}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>단가 변동:</span>
              <span className={selectedPriceChange.cost_diff >= 0 ? styles.increase : styles.decrease}>
                {selectedPriceChange.cost_diff >= 0 ? '+' : ''}
                {selectedPriceChange.cost_diff?.toLocaleString()}원
              </span>
            </div>
          </div>
        )}
      </Form>
    </Card>
  );
}

export default SettlementConditionForm;
