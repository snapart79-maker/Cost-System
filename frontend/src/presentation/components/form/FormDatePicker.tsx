/**
 * FormDatePicker Component
 * React Hook Form + Ant Design DatePicker 통합 컴포넌트
 */

import { useFormContext, Controller } from 'react-hook-form';
import { DatePicker, Form } from 'antd';
import type { DatePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import styles from './FormComponents.module.css';

export interface FormDatePickerProps
  extends Omit<DatePickerProps, 'name' | 'value' | 'onChange' | 'minDate' | 'maxDate'> {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  format?: string;
  minDate?: string;
  maxDate?: string;
}

export function FormDatePicker({
  name,
  label,
  required = false,
  helpText,
  format = 'YYYY-MM-DD',
  minDate,
  maxDate,
  ...datePickerProps
}: FormDatePickerProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  const disabledDate = (current: Dayjs) => {
    if (!current) return false;

    if (minDate && current.isBefore(dayjs(minDate), 'day')) {
      return true;
    }
    if (maxDate && current.isAfter(dayjs(maxDate), 'day')) {
      return true;
    }
    return false;
  };

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
        render={({ field: { value, onChange, ...fieldProps } }) => (
          <DatePicker
            {...fieldProps}
            {...datePickerProps}
            value={value ? dayjs(value) : null}
            onChange={(date) => {
              onChange(date ? date.format(format) : null);
            }}
            format={format}
            disabledDate={minDate || maxDate ? disabledDate : undefined}
            className={styles.datePicker}
            status={error ? 'error' : undefined}
            aria-label={label}
          />
        )}
      />
    </Form.Item>
  );
}

export default FormDatePicker;
