/**
 * TableFilter Component
 * 컬럼별 필터 UI 컴포넌트
 */

import { useState, useCallback } from 'react';
import { Button, Popover, Input, Select, DatePicker, Space } from 'antd';
import { FilterOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './TableFilter.module.css';

const { RangePicker } = DatePicker;

export type FilterType = 'text' | 'number' | 'select' | 'date' | 'dateRange';

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface ColumnFilter {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterValue {
  id: string;
  value: unknown;
  operator?: 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
}

export interface TableFilterProps {
  filters: ColumnFilter[];
  values: FilterValue[];
  onChange: (values: FilterValue[]) => void;
  onReset?: () => void;
  className?: string;
}

export function TableFilter({
  filters,
  values,
  onChange,
  onReset,
  className,
}: TableFilterProps) {
  const [open, setOpen] = useState(false);

  const getFilterValue = useCallback(
    (filterId: string) => {
      const filter = values.find((v) => v.id === filterId);
      return filter?.value;
    },
    [values]
  );

  const setFilterValue = useCallback(
    (filterId: string, value: unknown, operator?: FilterValue['operator']) => {
      const newValues = values.filter((v) => v.id !== filterId);
      if (value !== undefined && value !== null && value !== '') {
        newValues.push({ id: filterId, value, operator });
      }
      onChange(newValues);
    },
    [values, onChange]
  );

  const handleReset = useCallback(() => {
    onChange([]);
    onReset?.();
  }, [onChange, onReset]);

  const activeFilterCount = values.length;

  const renderFilterInput = (filter: ColumnFilter) => {
    const value = getFilterValue(filter.id);

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `${filter.label} 검색...`}
            value={value as string}
            onChange={(e) => setFilterValue(filter.id, e.target.value, 'contains')}
            allowClear
          />
        );

      case 'number':
        return (
          <Space direction="vertical" className={styles.numberFilter}>
            <Input
              type="number"
              placeholder="최소값"
              value={(value as { min?: number })?.min}
              onChange={(e) =>
                setFilterValue(
                  filter.id,
                  { ...(value as object), min: e.target.valueAsNumber },
                  'between'
                )
              }
            />
            <Input
              type="number"
              placeholder="최대값"
              value={(value as { max?: number })?.max}
              onChange={(e) =>
                setFilterValue(
                  filter.id,
                  { ...(value as object), max: e.target.valueAsNumber },
                  'between'
                )
              }
            />
          </Space>
        );

      case 'select':
        return (
          <Select
            mode="multiple"
            placeholder={filter.placeholder || '선택...'}
            value={value as string[]}
            onChange={(val) => setFilterValue(filter.id, val, 'eq')}
            options={filter.options}
            className={styles.selectFilter}
            allowClear
          />
        );

      case 'date':
        return (
          <DatePicker
            value={value ? dayjs(value as string) : null}
            onChange={(date) =>
              setFilterValue(filter.id, date?.format('YYYY-MM-DD'), 'eq')
            }
            className={styles.dateFilter}
          />
        );

      case 'dateRange':
        return (
          <RangePicker
            value={
              value
                ? [
                    dayjs((value as [string, string])[0]),
                    dayjs((value as [string, string])[1]),
                  ]
                : null
            }
            onChange={(dates) =>
              setFilterValue(
                filter.id,
                dates
                  ? [
                      dates[0]?.format('YYYY-MM-DD'),
                      dates[1]?.format('YYYY-MM-DD'),
                    ]
                  : null,
                'between'
              )
            }
            className={styles.dateFilter}
          />
        );

      default:
        return null;
    }
  };

  const filterContent = (
    <div className={styles.filterContent}>
      <div className={styles.filterHeader}>
        <span className={styles.filterTitle}>필터</span>
        {activeFilterCount > 0 && (
          <Button size="small" type="link" onClick={handleReset}>
            초기화
          </Button>
        )}
      </div>
      <div className={styles.filterBody}>
        {filters.map((filter) => (
          <div key={filter.id} className={styles.filterItem}>
            <label className={styles.filterLabel}>{filter.label}</label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>
      <div className={styles.filterFooter}>
        <Button type="primary" onClick={() => setOpen(false)}>
          적용
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Popover
        content={filterContent}
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="bottomRight"
      >
        <Button
          icon={<FilterOutlined />}
          className={activeFilterCount > 0 ? styles.activeButton : ''}
        >
          필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </Popover>

      {/* Active filter tags */}
      {activeFilterCount > 0 && (
        <div className={styles.activeTags}>
          {values.map((filterValue) => {
            const filter = filters.find((f) => f.id === filterValue.id);
            if (!filter) return null;

            return (
              <span key={filterValue.id} className={styles.filterTag}>
                {filter.label}: {String(filterValue.value)}
                <CloseOutlined
                  className={styles.removeTag}
                  onClick={() => setFilterValue(filterValue.id, null)}
                />
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TableFilter;
