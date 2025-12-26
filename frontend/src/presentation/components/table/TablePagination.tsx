/**
 * TablePagination Component
 * Ant Design Pagination 래퍼 컴포넌트
 */

import { Pagination } from 'antd';
import styles from './TablePagination.module.css';

export interface TablePaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  disabled?: boolean;
  className?: string;
}

export function TablePagination({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
  className,
}: TablePaginationProps) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        showTotal={
          showTotal
            ? (total, range) =>
                `${range[0]}-${range[1]} / 총 ${total}개`
            : undefined
        }
        pageSizeOptions={pageSizeOptions.map(String)}
        disabled={disabled}
        size="default"
      />
    </div>
  );
}

export default TablePagination;
