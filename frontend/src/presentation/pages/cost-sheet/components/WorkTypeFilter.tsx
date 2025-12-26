/**
 * WorkTypeFilter Component
 * 내작/외작 필터 라디오 버튼
 */

import { Radio, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';
import styles from './WorkTypeFilter.module.css';

export type WorkTypeFilterValue = 'ALL' | 'IN_HOUSE' | 'OUTSOURCE';

export interface WorkTypeFilterProps {
  value: WorkTypeFilterValue;
  onChange: (value: WorkTypeFilterValue) => void;
  disabled?: boolean;
}

export function WorkTypeFilter({
  value,
  onChange,
  disabled = false,
}: WorkTypeFilterProps) {
  const handleChange = (e: RadioChangeEvent) => {
    onChange(e.target.value as WorkTypeFilterValue);
  };

  return (
    <div className={styles.container}>
      <Radio.Group
        value={value}
        onChange={handleChange}
        disabled={disabled}
        optionType="button"
        buttonStyle="solid"
      >
        <Space>
          <Radio.Button value="ALL" aria-label="전체">
            전체
          </Radio.Button>
          <Radio.Button value="IN_HOUSE" aria-label="내작">
            내작
          </Radio.Button>
          <Radio.Button value="OUTSOURCE" aria-label="외작">
            외작
          </Radio.Button>
        </Space>
      </Radio.Group>
    </div>
  );
}

export default WorkTypeFilter;
