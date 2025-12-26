/**
 * FormSelect Component
 * React Hook Form + Ant Design Select 통합 컴포넌트
 */

import { useFormContext, Controller } from 'react-hook-form';
import { Select, Form } from 'antd';
import type { SelectProps } from 'antd';
import styles from './FormComponents.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends Omit<SelectProps, 'name' | 'options'> {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  helpText?: string;
}

export function FormSelect({
  name,
  label,
  options,
  required = false,
  helpText,
  showSearch = false,
  ...selectProps
}: FormSelectProps) {
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
          <Select
            {...field}
            {...selectProps}
            options={options}
            showSearch={showSearch}
            filterOption={
              showSearch
                ? (input, option) =>
                    (option?.label?.toString() ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                : undefined
            }
            status={error ? 'error' : undefined}
            aria-label={label}
          />
        )}
      />
    </Form.Item>
  );
}

export default FormSelect;
