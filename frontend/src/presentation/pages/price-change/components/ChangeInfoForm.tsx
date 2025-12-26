/**
 * ChangeInfoForm Component
 * 변경 정보 입력 폼 컴포넌트
 */

import { Card, Form, Input, DatePicker, Select, Row, Col } from 'antd';
import { Controller, useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  ChangeType,
  ChangeTypeLabels,
} from '@/domain/entities/price-change';
import styles from './ChangeInfoForm.module.css';

const { TextArea } = Input;

export interface ChangeInfoFormData {
  effective_date: string;
  change_type: ChangeType;
  eco_number?: string;
  change_reason: string;
}

export interface ChangeInfoFormProps {
  disabled?: boolean;
}

export function ChangeInfoForm({ disabled = false }: ChangeInfoFormProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ChangeInfoFormData>();

  const changeTypeOptions = Object.entries(ChangeTypeLabels).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  return (
    <Card title="변경 정보" className={styles.container}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="적용일"
            required
            validateStatus={errors.effective_date ? 'error' : undefined}
            help={errors.effective_date?.message}
          >
            <Controller
              name="effective_date"
              control={control}
              rules={{ required: '필수 항목입니다' }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    field.onChange(date ? date.format('YYYY-MM-DD') : '')
                  }
                  disabled={disabled}
                  className={styles.fullWidth}
                  placeholder="적용일 선택"
                  format="YYYY-MM-DD"
                  aria-label="적용일"
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="변경 유형"
            required
            validateStatus={errors.change_type ? 'error' : undefined}
            help={errors.change_type?.message}
          >
            <Controller
              name="change_type"
              control={control}
              rules={{ required: '필수 항목입니다' }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={changeTypeOptions}
                  placeholder="변경 유형 선택"
                  disabled={disabled}
                  className={styles.fullWidth}
                  aria-label="변경 유형"
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="ECO 번호"
            validateStatus={errors.eco_number ? 'error' : undefined}
            help={errors.eco_number?.message}
          >
            <Controller
              name="eco_number"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="ECO-YYYY-XXX"
                  disabled={disabled}
                  aria-label="ECO 번호"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Form.Item
            label="변경 사유"
            required
            validateStatus={errors.change_reason ? 'error' : undefined}
            help={errors.change_reason?.message}
          >
            <Controller
              name="change_reason"
              control={control}
              rules={{ required: '필수 항목입니다' }}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={3}
                  placeholder="단가 변경 사유를 입력하세요"
                  disabled={disabled}
                  maxLength={500}
                  showCount
                  aria-label="변경 사유"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}

export default ChangeInfoForm;
