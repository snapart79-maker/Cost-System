/**
 * MasterDataForm Component
 * 기초 데이터 신규/수정 폼 모달
 */

import { useEffect, useMemo } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  MaterialType,
  MaterialUnit,
  MaterialTypeLabels,
  MaterialUnitLabels,
} from '@/domain/entities/material';
import { WorkType, WorkTypeLabels } from '@/domain/entities/process';
import {
  ProductStatus,
  ProductStatusLabels,
} from '@/domain/entities/product';
import { BomItemType, BOM_ITEM_TYPE_LABELS } from '@/domain/entities/bom';

export type EntityType = 'material' | 'process' | 'product' | 'bom';

export interface MasterDataFormProps {
  open: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  entityType: EntityType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  title: string;
  loading?: boolean;
}

// Zod schemas for each entity type
const materialSchema = z.object({
  material_id: z.string().min(1, '자재코드를 입력하세요'),
  name: z.string().min(1, '자재명을 입력하세요'),
  type: z.nativeEnum(MaterialType, { errorMap: () => ({ message: '유형을 선택하세요' }) }),
  specification: z.string().optional(),
  unit: z.nativeEnum(MaterialUnit, { errorMap: () => ({ message: '단위를 선택하세요' }) }),
  unit_price: z.number().min(0, '단가는 0 이상이어야 합니다'),
});

const processSchema = z.object({
  process_id: z.string().min(1, '공정코드를 입력하세요'),
  name: z.string().min(1, '공정명을 입력하세요'),
  work_type: z.nativeEnum(WorkType, { errorMap: () => ({ message: '작업유형을 선택하세요' }) }),
  cycle_time: z.number().min(0, 'C/T는 0 이상이어야 합니다').optional(),
  worker_count: z.number().int().min(0, '인원은 0 이상이어야 합니다').optional(),
  hourly_rate: z.number().min(0, '시간당 임률은 0 이상이어야 합니다').optional(),
});

const productSchema = z.object({
  product_id: z.string().min(1, '품번을 입력하세요'),
  name: z.string().min(1, '품명을 입력하세요'),
  customer_name: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  model_year: z.string().optional(),
  current_purchase_cost: z.number().min(0).optional(),
});

const bomSchema = z.object({
  item_type: z.nativeEnum(BomItemType, { errorMap: () => ({ message: '구분을 선택하세요' }) }),
  item_code: z.string().min(1, '코드를 입력하세요'),
  item_name: z.string().min(1, '품명을 입력하세요'),
  specification: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().min(0, '소요량은 0 이상이어야 합니다'),
  unit_price: z.number().min(0, '단가는 0 이상이어야 합니다').optional(),
});

const schemas: Record<EntityType, z.ZodSchema> = {
  material: materialSchema,
  process: processSchema,
  product: productSchema,
  bom: bomSchema,
};

const getDefaultValues = (entityType: EntityType): Record<string, unknown> => {
  switch (entityType) {
    case 'material':
      return {
        material_id: '',
        name: '',
        type: MaterialType.WIRE,
        specification: '',
        unit: MaterialUnit.EA,
        unit_price: 0,
      };
    case 'process':
      return {
        process_id: '',
        name: '',
        work_type: WorkType.IN_HOUSE,
        cycle_time: 0,
        worker_count: 1,
        hourly_rate: 0,
      };
    case 'product':
      return {
        product_id: '',
        name: '',
        customer_name: '',
        status: ProductStatus.DEVELOPMENT,
        model_year: new Date().getFullYear().toString(),
        current_purchase_cost: 0,
      };
    case 'bom':
      return {
        item_type: BomItemType.MATERIAL,
        item_code: '',
        item_name: '',
        specification: '',
        unit: 'EA',
        quantity: 0,
        unit_price: 0,
      };
    default:
      return {};
  }
};

export function MasterDataForm({
  open,
  onSubmit,
  onCancel,
  entityType,
  initialData,
  title,
  loading = false,
}: MasterDataFormProps) {
  const schema = schemas[entityType];
  const defaultValues = useMemo(
    () => getDefaultValues(entityType),
    [entityType]
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || defaultValues,
  });

  const { control, handleSubmit, reset, formState: { errors } } = methods;

  useEffect(() => {
    if (open) {
      reset(initialData || defaultValues);
    }
  }, [open, initialData, defaultValues, reset]);

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  const renderFields = () => {
    switch (entityType) {
      case 'material':
        return (
          <>
            <Form.Item
              label="자재코드"
              required
              validateStatus={errors.material_id ? 'error' : undefined}
              help={errors.material_id?.message as string}
            >
              <Controller
                name="material_id"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="예: MAT-001" disabled={!!initialData} />
                )}
              />
            </Form.Item>

            <Form.Item
              label="자재명"
              required
              validateStatus={errors.name ? 'error' : undefined}
              help={errors.name?.message as string}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="자재명을 입력하세요" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="유형"
              required
              validateStatus={errors.type ? 'error' : undefined}
              help={errors.type?.message as string}
            >
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={Object.entries(MaterialTypeLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="규격">
              <Controller
                name="specification"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="규격을 입력하세요" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="단위"
              required
              validateStatus={errors.unit ? 'error' : undefined}
              help={errors.unit?.message as string}
            >
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={Object.entries(MaterialUnitLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="단가"
              required
              validateStatus={errors.unit_price ? 'error' : undefined}
              help={errors.unit_price?.message as string}
            >
              <Controller
                name="unit_price"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                    addonAfter="원"
                  />
                )}
              />
            </Form.Item>
          </>
        );

      case 'process':
        return (
          <>
            <Form.Item
              label="공정코드"
              required
              validateStatus={errors.process_id ? 'error' : undefined}
              help={errors.process_id?.message as string}
            >
              <Controller
                name="process_id"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="예: PROC-001" disabled={!!initialData} />
                )}
              />
            </Form.Item>

            <Form.Item
              label="공정명"
              required
              validateStatus={errors.name ? 'error' : undefined}
              help={errors.name?.message as string}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="공정명을 입력하세요" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="작업유형"
              required
              validateStatus={errors.work_type ? 'error' : undefined}
              help={errors.work_type?.message as string}
            >
              <Controller
                name="work_type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={Object.entries(WorkTypeLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="C/T (초)">
              <Controller
                name="cycle_time"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    precision={2}
                    style={{ width: '100%' }}
                    addonAfter="초"
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="인원">
              <Controller
                name="worker_count"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    precision={0}
                    style={{ width: '100%' }}
                    addonAfter="명"
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="시간당 임률">
              <Controller
                name="hourly_rate"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                    addonAfter="원"
                  />
                )}
              />
            </Form.Item>
          </>
        );

      case 'product':
        return (
          <>
            <Form.Item
              label="품번"
              required
              validateStatus={errors.product_id ? 'error' : undefined}
              help={errors.product_id?.message as string}
            >
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="예: PROD-001" disabled={!!initialData} />
                )}
              />
            </Form.Item>

            <Form.Item
              label="품명"
              required
              validateStatus={errors.name ? 'error' : undefined}
              help={errors.name?.message as string}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="품명을 입력하세요" />
                )}
              />
            </Form.Item>

            <Form.Item label="고객사">
              <Controller
                name="customer_name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="고객사명을 입력하세요" />
                )}
              />
            </Form.Item>

            <Form.Item label="상태">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={Object.entries(ProductStatusLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="연식">
              <Controller
                name="model_year"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="예: 2024" />
                )}
              />
            </Form.Item>

            <Form.Item label="현재 구매원가">
              <Controller
                name="current_purchase_cost"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                    addonAfter="원"
                  />
                )}
              />
            </Form.Item>
          </>
        );

      case 'bom':
        return (
          <>
            <Form.Item
              label="구분"
              required
              validateStatus={errors.item_type ? 'error' : undefined}
              help={errors.item_type?.message as string}
            >
              <Controller
                name="item_type"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    disabled={!!initialData}
                    options={Object.entries(BOM_ITEM_TYPE_LABELS).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="코드"
              required
              validateStatus={errors.item_code ? 'error' : undefined}
              help={errors.item_code?.message as string}
            >
              <Controller
                name="item_code"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value as string} placeholder="자재/공정 코드" disabled={!!initialData} />
                )}
              />
            </Form.Item>

            <Form.Item
              label="품명"
              required
              validateStatus={errors.item_name ? 'error' : undefined}
              help={errors.item_name?.message as string}
            >
              <Controller
                name="item_name"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value as string} placeholder="품명을 입력하세요" />
                )}
              />
            </Form.Item>

            <Form.Item label="규격">
              <Controller
                name="specification"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value as string} placeholder="규격을 입력하세요" />
                )}
              />
            </Form.Item>

            <Form.Item label="단위">
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value as string} placeholder="예: EA, MTR, SET" />
                )}
              />
            </Form.Item>

            <Form.Item
              label="소요량"
              required
              validateStatus={errors.quantity ? 'error' : undefined}
              help={errors.quantity?.message as string}
            >
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Form.Item>

            <Form.Item label="단가">
              <Controller
                name="unit_price"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                    addonAfter="원"
                  />
                )}
              />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleFormSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="저장"
      cancelText="취소"
      width={500}
      destroyOnClose
    >
      <FormProvider {...methods}>
        <Form layout="vertical" style={{ marginTop: 16 }}>
          {renderFields()}
        </Form>
      </FormProvider>
    </Modal>
  );
}

export default MasterDataForm;
