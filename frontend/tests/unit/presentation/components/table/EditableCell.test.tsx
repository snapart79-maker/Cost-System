/**
 * EditableCell Component Tests
 * 인라인 편집 셀 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableCell } from '@/presentation/components/table/EditableCell';

describe('EditableCell', () => {
  describe('Text Type', () => {
    it('should render value in view mode', () => {
      render(
        <EditableCell
          value="테스트 값"
          type="text"
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('테스트 값')).toBeInTheDocument();
    });

    it('should enter edit mode on double click', async () => {
      render(
        <EditableCell
          value="테스트 값"
          type="text"
          onChange={vi.fn()}
        />
      );

      const cell = screen.getByText('테스트 값');
      fireEvent.doubleClick(cell);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveValue('테스트 값');
    });

    it('should call onChange on blur with new value', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <EditableCell
          value="테스트 값"
          type="text"
          onChange={onChange}
        />
      );

      // Enter edit mode
      const cell = screen.getByText('테스트 값');
      fireEvent.doubleClick(cell);

      // Change value
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '새로운 값');

      // Blur to save
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith('새로운 값');
    });

    it('should cancel edit on Escape key', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <EditableCell
          value="원래 값"
          type="text"
          onChange={onChange}
        />
      );

      // Enter edit mode
      fireEvent.doubleClick(screen.getByText('원래 값'));

      // Change value
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '변경된 값');

      // Press Escape to cancel
      fireEvent.keyDown(input, { key: 'Escape' });

      // Should show original value and not call onChange
      expect(screen.getByText('원래 값')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should save on Enter key', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(
        <EditableCell
          value="원래 값"
          type="text"
          onChange={onChange}
        />
      );

      // Enter edit mode
      fireEvent.doubleClick(screen.getByText('원래 값'));

      // Change value
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '새 값');

      // Press Enter to save
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('새 값');
    });
  });

  describe('Number Type', () => {
    it('should render formatted number value', () => {
      render(
        <EditableCell
          value={1234.56}
          type="number"
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('1,234.56')).toBeInTheDocument();
    });

    it('should render input in edit mode', () => {
      render(
        <EditableCell
          value={1234}
          type="number"
          onChange={vi.fn()}
        />
      );

      fireEvent.doubleClick(screen.getByText('1,234'));

      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
    });

    it('should handle decimal precision display', () => {
      render(
        <EditableCell
          value={100}
          type="number"
          precision={4}
          onChange={vi.fn()}
        />
      );

      // With precision=4, should display with 4 decimal places
      expect(screen.getByText('100.0000')).toBeInTheDocument();
    });
  });

  describe('Select Type', () => {
    const options = [
      { value: 'opt1', label: '옵션 1' },
      { value: 'opt2', label: '옵션 2' },
      { value: 'opt3', label: '옵션 3' },
    ];

    it('should render selected option label', () => {
      render(
        <EditableCell
          value="opt2"
          type="select"
          options={options}
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('옵션 2')).toBeInTheDocument();
    });

    it('should show dropdown on click in edit mode', async () => {
      render(
        <EditableCell
          value="opt1"
          type="select"
          options={options}
          onChange={vi.fn()}
        />
      );

      fireEvent.doubleClick(screen.getByText('옵션 1'));

      // Should show all options
      await waitFor(() => {
        expect(screen.getByText('옵션 2')).toBeInTheDocument();
        expect(screen.getByText('옵션 3')).toBeInTheDocument();
      });
    });

    it('should call onChange when selecting option', async () => {
      const onChange = vi.fn();

      render(
        <EditableCell
          value="opt1"
          type="select"
          options={options}
          onChange={onChange}
        />
      );

      fireEvent.doubleClick(screen.getByText('옵션 1'));

      await waitFor(() => {
        const option2 = screen.getByText('옵션 2');
        fireEvent.click(option2);
      });

      expect(onChange).toHaveBeenCalledWith('opt2');
    });
  });

  describe('Date Type', () => {
    it('should render formatted date value', () => {
      render(
        <EditableCell
          value="2025-12-26"
          type="date"
          onChange={vi.fn()}
        />
      );

      expect(screen.getByText('2025-12-26')).toBeInTheDocument();
    });

    it('should show date picker in edit mode', () => {
      render(
        <EditableCell
          value="2025-12-26"
          type="date"
          onChange={vi.fn()}
        />
      );

      fireEvent.doubleClick(screen.getByText('2025-12-26'));

      // Date picker should be visible
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Read-only Mode', () => {
    it('should not enter edit mode when readOnly', () => {
      render(
        <EditableCell
          value="읽기 전용 값"
          type="text"
          onChange={vi.fn()}
          readOnly
        />
      );

      const cell = screen.getByText('읽기 전용 값');
      fireEvent.doubleClick(cell);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show error state for invalid value', async () => {
      const onChange = vi.fn();
      const validate = (value: string) => {
        if (value.length < 2) return '최소 2자 이상 입력하세요';
        return null;
      };

      render(
        <EditableCell
          value="테스트"
          type="text"
          onChange={onChange}
          validate={validate}
        />
      );

      fireEvent.doubleClick(screen.getByText('테스트'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'A' } });
      fireEvent.blur(input);

      expect(screen.getByText('최소 2자 이상 입력하세요')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Status Indicators', () => {
    it('should show modified indicator when status is MODIFIED', () => {
      render(
        <EditableCell
          value="수정된 값"
          type="text"
          onChange={vi.fn()}
          status="MODIFIED"
        />
      );

      expect(screen.getByTestId('cell-modified-indicator')).toBeInTheDocument();
    });

    it('should show new indicator when status is NEW', () => {
      render(
        <EditableCell
          value="새로운 값"
          type="text"
          onChange={vi.fn()}
          status="NEW"
        />
      );

      expect(screen.getByTestId('cell-new-indicator')).toBeInTheDocument();
    });
  });
});
