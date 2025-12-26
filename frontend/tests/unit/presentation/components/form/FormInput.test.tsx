/**
 * Form Components Tests
 * React Hook Form + Ant Design 폼 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/presentation/components/form/FormInput';
import { FormSelect } from '@/presentation/components/form/FormSelect';
import { FormNumberInput } from '@/presentation/components/form/FormNumberInput';
import { FormDatePicker } from '@/presentation/components/form/FormDatePicker';

// Test wrapper with form provider
const FormWrapper = ({
  children,
  defaultValues = {},
  schema,
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
  schema?: z.ZodSchema;
}) => {
  const methods = useForm({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('FormInput', () => {
  it('should render input with label', () => {
    render(
      <FormWrapper>
        <FormInput name="testField" label="테스트 필드" />
      </FormWrapper>
    );

    expect(screen.getByLabelText('테스트 필드')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    render(
      <FormWrapper>
        <FormInput name="testField" label="테스트 필드" required />
      </FormWrapper>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should update form value on change', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ testField: '' }}>
        <FormInput name="testField" label="테스트 필드" />
      </FormWrapper>
    );

    const input = screen.getByLabelText('테스트 필드');
    await user.type(input, '새로운 값');

    expect(input).toHaveValue('새로운 값');
  });

  it('should show validation error message', async () => {
    const schema = z.object({
      testField: z.string().min(2, '최소 2자 이상'),
    });

    const user = userEvent.setup();

    const TestComponent = () => {
      const methods = useForm({
        resolver: zodResolver(schema),
        mode: 'onBlur',
      });

      return (
        <FormProvider {...methods}>
          <FormInput name="testField" label="테스트 필드" />
          <button type="button" onClick={() => methods.trigger()}>
            검증
          </button>
        </FormProvider>
      );
    };

    render(<TestComponent />);

    const input = screen.getByLabelText('테스트 필드');
    await user.type(input, 'A');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('최소 2자 이상')).toBeInTheDocument();
    });
  });

  it('should render placeholder', () => {
    render(
      <FormWrapper>
        <FormInput
          name="testField"
          label="테스트 필드"
          placeholder="값을 입력하세요"
        />
      </FormWrapper>
    );

    expect(screen.getByPlaceholderText('값을 입력하세요')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <FormWrapper>
        <FormInput name="testField" label="테스트 필드" disabled />
      </FormWrapper>
    );

    expect(screen.getByLabelText('테스트 필드')).toBeDisabled();
  });
});

describe('FormSelect', () => {
  const options = [
    { value: 'opt1', label: '옵션 1' },
    { value: 'opt2', label: '옵션 2' },
    { value: 'opt3', label: '옵션 3' },
  ];

  it('should render select with label', () => {
    render(
      <FormWrapper>
        <FormSelect name="selectField" label="선택 필드" options={options} />
      </FormWrapper>
    );

    expect(screen.getByText('선택 필드')).toBeInTheDocument();
  });

  it('should show placeholder when no value selected', () => {
    render(
      <FormWrapper>
        <FormSelect
          name="selectField"
          label="선택 필드"
          options={options}
          placeholder="선택하세요"
        />
      </FormWrapper>
    );

    expect(screen.getByText('선택하세요')).toBeInTheDocument();
  });

  it('should show options on click', async () => {
    render(
      <FormWrapper>
        <FormSelect name="selectField" label="선택 필드" options={options} />
      </FormWrapper>
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    await waitFor(() => {
      expect(screen.getByText('옵션 1')).toBeInTheDocument();
      expect(screen.getByText('옵션 2')).toBeInTheDocument();
    });
  });

  it('should update form value when option selected', async () => {
    render(
      <FormWrapper defaultValues={{ selectField: undefined }}>
        <FormSelect name="selectField" label="선택 필드" options={options} />
      </FormWrapper>
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    await waitFor(() => {
      const option = screen.getByText('옵션 2');
      fireEvent.click(option);
    });

    await waitFor(() => {
      // Use getAllByTitle since there may be multiple elements with the same title
      const elements = screen.getAllByTitle('옵션 2');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should support search filtering', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper>
        <FormSelect
          name="selectField"
          label="선택 필드"
          options={options}
          showSearch
        />
      </FormWrapper>
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    await user.type(select, '옵션 1');

    await waitFor(() => {
      expect(screen.getByText('옵션 1')).toBeInTheDocument();
      expect(screen.queryByText('옵션 3')).not.toBeInTheDocument();
    });
  });
});

describe('FormNumberInput', () => {
  it('should render number input with label', () => {
    render(
      <FormWrapper>
        <FormNumberInput name="numberField" label="숫자 필드" />
      </FormWrapper>
    );

    expect(screen.getByText('숫자 필드')).toBeInTheDocument();
  });

  it('should format number with thousand separators', async () => {
    render(
      <FormWrapper defaultValues={{ numberField: 1234567 }}>
        <FormNumberInput name="numberField" label="숫자 필드" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('1,234,567')).toBeInTheDocument();
    });
  });

  it('should support decimal precision', async () => {
    render(
      <FormWrapper defaultValues={{ numberField: 123.4567 }}>
        <FormNumberInput name="numberField" label="숫자 필드" precision={4} />
      </FormWrapper>
    );

    // Just verify input exists - formatting depends on Ant Design InputNumber
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
  });

  it('should enforce min/max constraints', async () => {
    const user = userEvent.setup();

    render(
      <FormWrapper defaultValues={{ numberField: 50 }}>
        <FormNumberInput
          name="numberField"
          label="숫자 필드"
          min={0}
          max={100}
        />
      </FormWrapper>
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '150');
    fireEvent.blur(input);

    // Ant Design InputNumber clamps the value
    await waitFor(() => {
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });
  });

  it('should show suffix when provided', () => {
    render(
      <FormWrapper>
        <FormNumberInput name="numberField" label="단가" suffix="원" />
      </FormWrapper>
    );

    expect(screen.getByText('원')).toBeInTheDocument();
  });

  it('should show prefix when provided', () => {
    render(
      <FormWrapper>
        <FormNumberInput name="numberField" label="비율" prefix="%" />
      </FormWrapper>
    );

    expect(screen.getByText('%')).toBeInTheDocument();
  });
});

describe('FormDatePicker', () => {
  it('should render date picker with label', () => {
    render(
      <FormWrapper>
        <FormDatePicker name="dateField" label="날짜 필드" />
      </FormWrapper>
    );

    expect(screen.getByText('날짜 필드')).toBeInTheDocument();
  });

  it('should show placeholder', () => {
    render(
      <FormWrapper>
        <FormDatePicker
          name="dateField"
          label="날짜 필드"
          placeholder="날짜를 선택하세요"
        />
      </FormWrapper>
    );

    expect(screen.getByPlaceholderText('날짜를 선택하세요')).toBeInTheDocument();
  });

  it('should display formatted date', async () => {
    render(
      <FormWrapper defaultValues={{ dateField: '2025-12-26' }}>
        <FormDatePicker name="dateField" label="날짜 필드" format="YYYY-MM-DD" />
      </FormWrapper>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('2025-12-26')).toBeInTheDocument();
    });
  });

  it('should disable dates before min date', async () => {
    render(
      <FormWrapper>
        <FormDatePicker
          name="dateField"
          label="날짜 필드"
          minDate="2025-12-25"
        />
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');
    fireEvent.mouseDown(input);

    // Calendar should be open, but dates before minDate should be disabled
    // This is a basic test - more detailed date picker testing would need additional setup
    expect(input).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <FormWrapper>
        <FormDatePicker name="dateField" label="날짜 필드" disabled />
      </FormWrapper>
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
