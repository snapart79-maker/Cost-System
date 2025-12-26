/**
 * EditableCell Component
 * 인라인 편집 가능한 셀 컴포넌트
 */

import { useState, useEffect, useCallback } from 'react';
import { Input, InputNumber, Select, DatePicker } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './EditableCell.module.css';

export type EditableCellType = 'text' | 'number' | 'select' | 'date';

export type CellStatus = 'UNCHANGED' | 'MODIFIED' | 'NEW' | 'DELETED';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface EditableCellProps<T = string | number> {
  value: T;
  type?: EditableCellType;
  onChange: (value: T) => void;
  options?: SelectOption[];
  readOnly?: boolean;
  placeholder?: string;
  precision?: number;
  min?: number;
  max?: number;
  format?: string;
  validate?: (value: T) => string | null;
  status?: CellStatus;
  className?: string;
}

export function EditableCell<T extends string | number>({
  value,
  type = 'text',
  onChange,
  options = [],
  readOnly = false,
  placeholder,
  precision,
  min,
  max,
  format = 'YYYY-MM-DD',
  validate,
  status = 'UNCHANGED',
  className,
}: EditableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<T>(value);
  const [error, setError] = useState<string | null>(null);

  // Sync with external value
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleDoubleClick = useCallback(() => {
    if (readOnly) return;
    setIsEditing(true);
    setError(null);
  }, [readOnly]);

  const handleSave = useCallback(() => {
    // Validate if validator provided
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Apply constraints for numbers
    let finalValue = editValue;
    if (type === 'number' && typeof editValue === 'number') {
      if (min !== undefined && editValue < min) {
        finalValue = min as T;
      }
      if (max !== undefined && editValue > max) {
        finalValue = max as T;
      }
    }

    setIsEditing(false);
    setError(null);

    if (finalValue !== value) {
      onChange(finalValue);
    }
  }, [editValue, validate, type, min, max, value, onChange]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  const formatDisplayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className={styles.placeholder}>{placeholder || '-'}</span>;
    }

    switch (type) {
      case 'number':
        if (typeof value === 'number') {
          return value.toLocaleString(undefined, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          });
        }
        return value;
      case 'select': {
        const option = options.find((opt) => opt.value === value);
        return option?.label || value;
      }
      case 'date':
        return value;
      default:
        return value;
    }
  };

  const renderStatusIndicator = () => {
    switch (status) {
      case 'MODIFIED':
        return (
          <span
            className={styles.modifiedIndicator}
            data-testid="cell-modified-indicator"
            title="수정됨"
          >
            <EditOutlined />
          </span>
        );
      case 'NEW':
        return (
          <span
            className={styles.newIndicator}
            data-testid="cell-new-indicator"
            title="신규"
          >
            ✚
          </span>
        );
      case 'DELETED':
        return (
          <span className={styles.deletedIndicator} title="삭제예정">
            ×
          </span>
        );
      default:
        return null;
    }
  };

  const renderEditor = () => {
    switch (type) {
      case 'number':
        return (
          <InputNumber
            autoFocus
            value={editValue as number}
            onChange={(val) => setEditValue((val ?? 0) as T)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            precision={precision}
            min={min}
            max={max}
            className={styles.editor}
            status={error ? 'error' : undefined}
          />
        );

      case 'select':
        return (
          <Select
            value={editValue}
            onChange={(val) => {
              setEditValue(val as T);
              // Auto-save for select
              setIsEditing(false);
              onChange(val as T);
            }}
            options={options}
            className={styles.editor}
            autoFocus
            defaultOpen
            onBlur={() => setIsEditing(false)}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={editValue ? dayjs(editValue as string) : null}
            onChange={(date) => {
              const formattedDate = date ? date.format(format) : '';
              setEditValue(formattedDate as T);
              setIsEditing(false);
              onChange(formattedDate as T);
            }}
            format={format}
            className={styles.editor}
            autoFocus
            open
            onBlur={() => setIsEditing(false)}
          />
        );

      default:
        return (
          <Input
            autoFocus
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value as T)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={styles.editor}
            status={error ? 'error' : undefined}
          />
        );
    }
  };

  return (
    <div
      className={`${styles.container} ${className || ''} ${
        status === 'MODIFIED' ? styles.modified : ''
      } ${status === 'NEW' ? styles.new : ''} ${
        status === 'DELETED' ? styles.deleted : ''
      }`}
    >
      {isEditing ? (
        <div className={styles.editContainer}>
          {renderEditor()}
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      ) : (
        <div
          className={`${styles.displayValue} ${!readOnly ? styles.editable : ''}`}
          onDoubleClick={handleDoubleClick}
          role="button"
          tabIndex={readOnly ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !readOnly) {
              handleDoubleClick();
            }
          }}
        >
          {renderStatusIndicator()}
          <span className={styles.valueText}>{formatDisplayValue()}</span>
        </div>
      )}
    </div>
  );
}

export default EditableCell;
