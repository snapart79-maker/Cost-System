/**
 * PriceChangeRegisterPage
 * 단가 변경 등록 페이지
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Space, Modal, message, Card, Tabs } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/presentation/components/common/PageHeader';
import { usePriceChange, useBom } from '@/application/hooks';
import {
  ChangeType,
  ChangeItemStatus,
  type PriceChangeCreateInput,
} from '@/domain/entities/price-change';
import type { Product } from '@/domain/entities/product';
import type { CostComparisonInput, CostPreviewResult } from '@/domain/entities/cost-calculation';
import { MaterialType, MaterialUnit } from '@/domain/entities/material';
import { WorkType } from '@/domain/entities/process';
import {
  ProductSelector,
  ChangeInfoForm,
  MaterialChangeTable,
  ProcessChangeTable,
  BulkEditModal,
  CostPreview,
  type MaterialChangeRow,
  type ProcessChangeRow,
  type ChangeInfoFormData,
  type BulkEditData,
} from './components';
import styles from './PriceChangeRegisterPage.module.css';

// Form validation schema
const formSchema = z.object({
  effective_date: z.string().min(1, '적용일을 선택해주세요'),
  change_type: z.nativeEnum(ChangeType),
  eco_number: z.string().optional(),
  change_reason: z.string().min(1, '변경 사유를 입력해주세요'),
});

export function PriceChangeRegisterPage() {
  const navigate = useNavigate();

  // Form setup
  const methods = useForm<ChangeInfoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      effective_date: '',
      change_type: ChangeType.COMBINED,
      eco_number: '',
      change_reason: '',
    },
  });

  // State
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [materialChanges, setMaterialChanges] = useState<MaterialChangeRow[]>([]);
  const [processChanges, setProcessChanges] = useState<ProcessChangeRow[]>([]);
  const [bulkEditModal, setBulkEditModal] = useState<{
    open: boolean;
    type: 'material' | 'process';
  }>({ open: false, type: 'material' });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<CostPreviewResult | null>(null);

  // Hooks
  const { createPriceChange } = usePriceChange();
  const { bomData } = useBom({
    productId: selectedProductId,
    enabled: !!selectedProductId,
  });

  // Load BOM data when product is selected
  useEffect(() => {
    if (bomData && selectedProductId) {
      // Transform BOM material items to MaterialChangeRow
      const materials: MaterialChangeRow[] = (bomData.items || []).map((item, idx) => ({
        key: `material-${item.id || idx}`,
        material_id: item.item_code, // Use item_code as material_id
        material: {
          id: item.id,
          material_id: item.item_code,
          name: item.item_name,
          spec: item.specification || '',
          material_type: MaterialType.ACCESSORY, // Default to ACCESSORY for BOM items
          unit: (item.unit === 'MTR' || item.unit === 'M') ? MaterialUnit.MTR
              : item.unit === 'SET' ? MaterialUnit.SET
              : MaterialUnit.EA, // Default to EA
          unit_price: item.unit_price || 0,
          scrap_rate: 0,
          effective_date: item.created_at,
          created_at: item.created_at,
          updated_at: item.updated_at,
        },
        status: ChangeItemStatus.UNCHANGED,
        before_quantity: item.quantity,
        after_quantity: item.quantity,
        before_unit_price: item.unit_price || 0,
        after_unit_price: item.unit_price || 0,
        before_cost: item.quantity * (item.unit_price || 0),
        after_cost: item.quantity * (item.unit_price || 0),
        cost_diff: 0,
      }));
      setMaterialChanges(materials);

      // Transform BOM process items to ProcessChangeRow
      const processes: ProcessChangeRow[] = (bomData.processes || []).map((proc, idx) => ({
        key: `process-${proc.id || idx}`,
        process_id: proc.item_code, // Use item_code as process_id
        process: {
          id: proc.id,
          process_id: proc.item_code,
          name: proc.item_name,
          equipment_name: '',
          work_type: proc.work_type === 'OUTSOURCE' ? WorkType.OUTSOURCE : WorkType.IN_HOUSE,
          cycle_time: proc.quantity, // quantity is C/T for process
          worker_count: proc.workers || 1,
          hourly_rate: 15000,
          efficiency: 100,
          created_at: proc.created_at,
          updated_at: proc.updated_at,
        },
        status: ChangeItemStatus.UNCHANGED,
        before_cycle_time: proc.quantity, // quantity is C/T for process
        after_cycle_time: proc.quantity,
        before_workers: proc.workers || 1,
        after_workers: proc.workers || 1,
        before_cost: 0, // Will be calculated
        after_cost: 0,
        cost_diff: 0,
      }));
      setProcessChanges(processes);
    }
  }, [bomData, selectedProductId]);

  // Prepare preview data
  const previewData = useMemo<CostComparisonInput | undefined>(() => {
    if (!selectedProductId) return undefined;

    const hasChanges = materialChanges.some(m => m.status !== ChangeItemStatus.UNCHANGED) ||
                       processChanges.some(p => p.status !== ChangeItemStatus.UNCHANGED);

    if (!hasChanges) return undefined;

    return {
      product_id: selectedProductId,
      material_changes: materialChanges
        .filter(m => m.status !== ChangeItemStatus.UNCHANGED)
        .map(m => ({
          material_id: m.material_id,
          status: m.status,
          quantity: m.after_quantity,
          unit_price: m.after_unit_price,
        })),
      process_changes: processChanges
        .filter(p => p.status !== ChangeItemStatus.UNCHANGED)
        .map(p => ({
          process_id: p.process_id,
          status: p.status,
          cycle_time: p.after_cycle_time,
          workers: p.after_workers,
        })),
    };
  }, [selectedProductId, materialChanges, processChanges]);

  // Handle product selection
  const handleProductSelect = useCallback((productId: string, _product: Product) => {
    setSelectedProductId(productId);
    // Reset changes when product changes
    setMaterialChanges([]);
    setProcessChanges([]);
  }, []);

  // Handle bulk edit
  const handleBulkEdit = useCallback((data: BulkEditData) => {
    if (data.type === 'material') {
      setMaterialChanges((prev) =>
        prev.map((row) => {
          const update = data.items.find((item) => item.id === row.material_id);
          if (update) {
            return {
              ...row,
              after_quantity: update.quantity ?? row.after_quantity,
              after_unit_price: update.unit_price ?? row.after_unit_price,
              after_cost:
                (update.quantity ?? row.after_quantity ?? 0) *
                (update.unit_price ?? row.after_unit_price ?? 0),
              status:
                row.status === ChangeItemStatus.NEW
                  ? ChangeItemStatus.NEW
                  : ChangeItemStatus.MODIFIED,
            };
          }
          return row;
        })
      );
    } else {
      setProcessChanges((prev) =>
        prev.map((row) => {
          const update = data.items.find((item) => item.id === row.process_id);
          if (update) {
            return {
              ...row,
              after_cycle_time: update.cycle_time ?? row.after_cycle_time,
              after_workers: update.workers ?? row.after_workers,
              status:
                row.status === ChangeItemStatus.NEW
                  ? ChangeItemStatus.NEW
                  : ChangeItemStatus.MODIFIED,
            };
          }
          return row;
        })
      );
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Validate form
    const isValid = await methods.trigger();
    if (!isValid) {
      message.error('필수 항목을 입력해주세요');
      return;
    }

    if (!selectedProductId) {
      message.error('완제품을 선택해주세요');
      return;
    }

    // Check if there are any changes
    const hasChanges =
      materialChanges.some((m) => m.status !== ChangeItemStatus.UNCHANGED) ||
      processChanges.some((p) => p.status !== ChangeItemStatus.UNCHANGED);

    if (!hasChanges) {
      message.warning('변경된 항목이 없습니다');
      return;
    }

    // Show confirmation
    setConfirmModalOpen(true);
  }, [methods, selectedProductId, materialChanges, processChanges]);

  // Confirm and save
  const handleConfirmSave = useCallback(async () => {
    const formData = methods.getValues();

    const payload: PriceChangeCreateInput = {
      product_id: selectedProductId!,
      change_type: formData.change_type,
      change_reason: formData.change_reason,
      eco_number: formData.eco_number || undefined,
      effective_date: formData.effective_date,
      material_changes: materialChanges
        .filter((m) => m.status !== ChangeItemStatus.UNCHANGED)
        .map((m) => ({
          material_id: m.material_id,
          status: m.status,
          quantity: m.after_quantity,
          unit_price: m.after_unit_price,
        })),
      process_changes: processChanges
        .filter((p) => p.status !== ChangeItemStatus.UNCHANGED)
        .map((p) => ({
          process_id: p.process_id,
          status: p.status,
          cycle_time: p.after_cycle_time,
          workers: p.after_workers,
        })),
    };

    try {
      await createPriceChange.mutateAsync(payload);
      message.success('저장되었습니다');
      setConfirmModalOpen(false);
      // Navigate to cost sheet page
      navigate(`/cost-sheet?product=${selectedProductId}`);
    } catch (error) {
      message.error('저장에 실패했습니다');
    }
  }, [
    methods,
    selectedProductId,
    materialChanges,
    processChanges,
    createPriceChange,
    navigate,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    Modal.confirm({
      title: '취소하시겠습니까?',
      content: '입력한 내용이 모두 삭제됩니다.',
      okText: '취소하기',
      cancelText: '계속 작성',
      onOk: () => {
        navigate(-1);
      },
    });
  }, [navigate]);

  const tabItems = [
    {
      key: 'material',
      label: `자재 (${materialChanges.length})`,
      children: (
        <MaterialChangeTable
          data={materialChanges}
          onChange={setMaterialChanges}
          disabled={!selectedProductId}
        />
      ),
    },
    {
      key: 'process',
      label: `공정 (${processChanges.length})`,
      children: (
        <ProcessChangeTable
          data={processChanges}
          onChange={setProcessChanges}
          disabled={!selectedProductId}
        />
      ),
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className={styles.container}>
        <PageHeader
          title="단가 변경 등록"
          subtitle="완제품의 자재/공정 단가를 변경하고 원가를 미리 확인할 수 있습니다"
        />

        <Row gutter={24}>
          {/* Left Column - Form */}
          <Col span={16}>
            {/* 1. Product Selection */}
            <ProductSelector
              value={selectedProductId}
              onChange={handleProductSelect}
            />

            {/* 2. Change Info Form */}
            <ChangeInfoForm disabled={!selectedProductId} />

            {/* 3. Change Items */}
            <Card
              title="변경 항목"
              extra={
                <Button
                  icon={<EditOutlined />}
                  onClick={() =>
                    setBulkEditModal({ open: true, type: 'material' })
                  }
                  disabled={!selectedProductId}
                  aria-label="일괄 수정"
                >
                  일괄 수정
                </Button>
              }
              className={styles.changeItemsCard}
            >
              <Tabs items={tabItems} />
            </Card>
          </Col>

          {/* Right Column - Preview & Actions */}
          <Col span={8}>
            {/* 4. Cost Preview */}
            <CostPreview
              productId={selectedProductId}
              previewData={previewData}
              onPreviewUpdate={setPreviewResult}
            />

            {/* Action Buttons */}
            <Card className={styles.actionsCard}>
              <Space direction="vertical" size="middle" className={styles.actions}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={createPriceChange.isPending}
                  block
                  aria-label="저장"
                >
                  저장
                </Button>
                <Button
                  size="large"
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  block
                  aria-label="취소"
                >
                  취소
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Bulk Edit Modal */}
        <BulkEditModal
          open={bulkEditModal.open}
          onClose={() => setBulkEditModal({ ...bulkEditModal, open: false })}
          onApply={handleBulkEdit}
          type={bulkEditModal.type}
        />

        {/* Confirmation Modal */}
        <Modal
          title="단가 변경 등록"
          open={confirmModalOpen}
          onOk={handleConfirmSave}
          onCancel={() => setConfirmModalOpen(false)}
          okText="확인"
          cancelText="취소"
          confirmLoading={createPriceChange.isPending}
        >
          <p>단가 변경을 등록하시겠습니까?</p>
          {previewResult && (
            <div className={styles.confirmPreview}>
              <p>
                <strong>변경 전 구매원가:</strong>{' '}
                {previewResult.before.purchase_cost.toLocaleString()}원
              </p>
              <p>
                <strong>변경 후 구매원가:</strong>{' '}
                {previewResult.after.purchase_cost.toLocaleString()}원
              </p>
              <p>
                <strong>차이:</strong>{' '}
                <span
                  style={{
                    color:
                      previewResult.diff.purchase_cost > 0
                        ? '#cf1322'
                        : previewResult.diff.purchase_cost < 0
                          ? '#3f8600'
                          : 'inherit',
                  }}
                >
                  {previewResult.diff.purchase_cost > 0 ? '+' : ''}
                  {previewResult.diff.purchase_cost.toLocaleString()}원
                </span>
              </p>
            </div>
          )}
        </Modal>
      </div>
    </FormProvider>
  );
}

export default PriceChangeRegisterPage;
