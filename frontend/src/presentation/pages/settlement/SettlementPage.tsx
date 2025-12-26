/**
 * SettlementPage
 * 정산 관리 페이지
 */

import { useState, useCallback } from 'react';
import { Row, Col, Button, Space, message } from 'antd';
import {
  CalculatorOutlined,
  SaveOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@/presentation/components/common/PageHeader';
import { useSettlement } from '@/application/hooks/use-settlement';
import { useProducts } from '@/application/hooks/use-products';
import { apiClient } from '@/infrastructure/api/client';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import {
  SettlementConditionForm,
  ReceiptQuantityTable,
  SettlementResultTable,
} from './components';
import type {
  SettlementCondition,
  ReceiptQuantity,
  SettlementResult,
} from '@/domain/entities/settlement';
import styles from './SettlementPage.module.css';

export function SettlementPage() {
  // State
  const [condition, setCondition] = useState<Partial<SettlementCondition> | null>(null);
  const [receiptQuantities, setReceiptQuantities] = useState<ReceiptQuantity[]>([]);
  const [results, setResults] = useState<SettlementResult[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [savedSettlementId, setSavedSettlementId] = useState<string | null>(null);

  // Hooks
  const { useCalculateSettlement, useSaveSettlement } = useSettlement();
  const calculateMutation = useCalculateSettlement();
  const saveMutation = useSaveSettlement();
  const { products } = useProducts();

  // Selected products from condition
  const selectedProducts = products?.filter(
    (p) => condition?.product_ids?.includes(p.id)
  ) || [];

  // Handle condition change
  const handleConditionChange = useCallback((newCondition: Partial<SettlementCondition>) => {
    setCondition(newCondition);
    // Reset results when condition changes
    setResults([]);
    setTotalAmount(0);
    setSavedSettlementId(null);
  }, []);

  // Handle receipt quantity change
  const handleQuantityChange = useCallback((quantities: ReceiptQuantity[]) => {
    setReceiptQuantities(quantities);
    // Reset results when quantities change
    setResults([]);
    setTotalAmount(0);
    setSavedSettlementId(null);
  }, []);

  // Check if calculation is ready
  const canCalculate = Boolean(
    condition?.price_change_id &&
    condition?.product_ids?.length &&
    condition?.start_date &&
    condition?.end_date &&
    receiptQuantities.some((q) => q.quantity > 0)
  );

  // Check if save is ready
  const canSave = results.length > 0 && !savedSettlementId;

  // Check if export is ready
  const canExport = savedSettlementId !== null;

  // Handle calculate
  const handleCalculate = async () => {
    if (!condition?.price_change_id || !condition.product_ids) {
      message.warning('정산 조건을 모두 입력해주세요');
      return;
    }

    if (!receiptQuantities.some((q) => q.quantity > 0)) {
      message.warning('입고 수량을 입력해주세요');
      return;
    }

    try {
      const calculationResults = await calculateMutation.mutateAsync({
        price_change_id: condition.price_change_id,
        product_ids: condition.product_ids,
        start_date: condition.start_date || '',
        end_date: condition.end_date || '',
        period_type: condition.period_type || 'MONTHLY',
        receipt_quantities: receiptQuantities,
      });

      setResults(calculationResults);
      const total = calculationResults.reduce((sum, r) => sum + r.settlement_amount, 0);
      setTotalAmount(total);
      message.success('정산 계산이 완료되었습니다');
    } catch (error) {
      message.error('정산 계산에 실패했습니다');
      console.error('Calculate error:', error);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!condition?.price_change_id || !condition.product_ids) {
      message.warning('정산 조건이 올바르지 않습니다');
      return;
    }

    if (results.length === 0) {
      message.warning('계산 결과가 없습니다');
      return;
    }

    try {
      const savedSettlement = await saveMutation.mutateAsync({
        price_change_id: condition.price_change_id,
        product_ids: condition.product_ids,
        start_date: condition.start_date || '',
        end_date: condition.end_date || '',
        period_type: condition.period_type || 'MONTHLY',
        receipt_quantities: receiptQuantities,
        results,
        total_settlement_amount: totalAmount,
      });

      setSavedSettlementId(savedSettlement.id);
      message.success('정산 결과가 저장되었습니다');
    } catch (error) {
      message.error('정산 저장에 실패했습니다');
      console.error('Save error:', error);
    }
  };

  // Handle PDF export
  const handlePdfExport = async () => {
    if (!savedSettlementId) {
      message.warning('먼저 정산을 저장해주세요');
      return;
    }

    try {
      const response = await apiClient.get(
        API_ENDPOINTS.PDF_SETTLEMENT(savedSettlementId),
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `settlement-${savedSettlementId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('PDF 다운로드 완료');
    } catch (error) {
      message.error('PDF 다운로드에 실패했습니다');
      console.error('PDF export error:', error);
    }
  };

  // Handle Excel export
  const handleExcelExport = async () => {
    if (!savedSettlementId) {
      message.warning('먼저 정산을 저장해주세요');
      return;
    }

    try {
      const response = await apiClient.get(
        API_ENDPOINTS.EXCEL_EXPORT_SETTLEMENT(savedSettlementId),
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `settlement-${savedSettlementId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Excel 다운로드 완료');
    } catch (error) {
      message.error('Excel 다운로드에 실패했습니다');
      console.error('Excel export error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="정산 관리"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<CalculatorOutlined />}
              onClick={handleCalculate}
              loading={calculateMutation.isPending}
              disabled={!canCalculate}
            >
              계산하기
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saveMutation.isPending}
              disabled={!canSave}
            >
              저장하기
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={handlePdfExport}
              disabled={!canExport}
            >
              PDF
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExcelExport}
              disabled={!canExport}
            >
              Excel
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <SettlementConditionForm
            onChange={handleConditionChange}
            disabled={calculateMutation.isPending || saveMutation.isPending}
          />
        </Col>
        <Col xs={24} lg={12}>
          <ReceiptQuantityTable
            condition={condition}
            products={selectedProducts}
            value={receiptQuantities}
            onChange={handleQuantityChange}
            disabled={calculateMutation.isPending || saveMutation.isPending}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <SettlementResultTable
            results={results}
            totalAmount={totalAmount}
            loading={calculateMutation.isPending}
          />
        </Col>
      </Row>
    </div>
  );
}

export default SettlementPage;
