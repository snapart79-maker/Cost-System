/**
 * FormNumberInput Component
 * React Hook Form + Ant Design InputNumber 통합 컴포넌트
 */

import { useFormContext, Controller } from 'react-hook-form';
import { InputNumber, Form } from 'antd';
import type { InputNumberProps } from 'antd';
import styles from './FormComponents.module.css';

export interface FormNumberInputProps extends Omit<InputNumberProps, 'name'> {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  precision?: number;
  suffix?: string;
  prefix?: string;
}

export function FormNumberInput({
  name,
  label,
  required = false,
  helpText,
  precision,
  suffix,
  prefix,
  min,
  max,
  ...inputProps
}: FormNumberInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <Form.Item
      label={
        <span>
          {label}
          {required && <span className={styles.required}>*</span>}
        </span>
      }
      validateStatus={error ? 'error' : undefined}
      help={errorMessage || helpText}
      className={styles.formItem}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className={styles.numberInputWrapper}>
            {prefix && <span className={styles.prefix}>{prefix}</span>}
            <InputNumber
              {...field}
              {...inputProps}
              precision={precision}
              min={min}
              max={max}
              formatter={(value) =>
                value !== undefined && value !== null
                  ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : ''
              }
              parser={(value) =>
                value ? Number(value.replace(/,/g, '')) : 0
              }
              className={styles.numberInput}
              status={error ? 'error' : undefined}
              aria-label={label}
            />
            {suffix && <span className={styles.suffix}>{suffix}</span>}
          </div>
        )}
      />
    </Form.Item>
  );
}

export default FormNumberInput;
