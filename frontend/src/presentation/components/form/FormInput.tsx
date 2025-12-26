/**
 * FormInput Component
 * React Hook Form + Ant Design Input 통합 컴포넌트
 */

import { useFormContext, Controller } from 'react-hook-form';
import { Input, Form } from 'antd';
import type { InputProps } from 'antd';
import styles from './FormComponents.module.css';

export interface FormInputProps extends Omit<InputProps, 'name'> {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
}

export function FormInput({
  name,
  label,
  required = false,
  helpText,
  ...inputProps
}: FormInputProps) {
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
          <Input
            {...field}
            {...inputProps}
            id={name}
            aria-label={label}
            status={error ? 'error' : undefined}
          />
        )}
      />
    </Form.Item>
  );
}

export default FormInput;
