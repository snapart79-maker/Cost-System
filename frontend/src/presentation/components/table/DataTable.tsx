/**
 * DataTable Component
 * TanStack Table 기반 데이터 테이블 컴포넌트
 */

import { useState, useMemo, useCallback, memo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  RowSelectionState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Input, Empty, Spin, Checkbox, Button, Space } from 'antd';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import styles from './DataTable.module.css';

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  danger?: boolean;
  disabled?: boolean | ((row: T) => boolean);
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  actions?: RowAction<T>[];
  emptyText?: string;
  className?: string;
  rowKey?: keyof T | ((row: T) => string);
}

function DataTableInner<T extends object>({
  columns,
  data,
  loading = false,
  sortable = false,
  filterable = false,
  pagination = false,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  actions,
  emptyText = '데이터가 없습니다.',
  className,
  rowKey = 'id' as keyof T,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const getRowId = useCallback(
    (row: T) => {
      if (typeof rowKey === 'function') {
        return rowKey(row);
      }
      return String(row[rowKey] ?? '');
    },
    [rowKey]
  );

  // Build columns with selection and actions
  const tableColumns = useMemo(() => {
    const cols: ColumnDef<T>[] = [];

    // Add selection column
    if (selectable) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 40,
      });
    }

    // Add data columns
    cols.push(...columns);

    // Add actions column
    if (actions && actions.length > 0) {
      cols.push({
        id: 'actions',
        header: '작업',
        cell: ({ row }) => (
          <Space size="small">
            {actions.map((action, index) => {
              const isDisabled =
                typeof action.disabled === 'function'
                  ? action.disabled(row.original)
                  : action.disabled;

              return (
                <Button
                  key={index}
                  size="small"
                  type="link"
                  danger={action.danger}
                  disabled={isDisabled}
                  onClick={() => action.onClick(row.original)}
                >
                  {action.label}
                </Button>
              );
            })}
          </Space>
        ),
        size: 100,
      });
    }

    return cols;
  }, [columns, selectable, actions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
    },
    enableSorting: sortable,
    enableFilters: filterable,
    enableRowSelection: selectable,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      if (onSelectionChange) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => {
            const rowIndex = parseInt(key, 10);
            return data[rowIndex];
          })
          .filter(Boolean);
        onSelectionChange(selectedRows);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getRowId,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const renderSortIcon = (column: { getIsSorted: () => false | 'asc' | 'desc' }) => {
    const sorted = column.getIsSorted();
    if (!sorted) return null;
    return sorted === 'asc' ? (
      <SortAscendingOutlined className={styles.sortIcon} />
    ) : (
      <SortDescendingOutlined className={styles.sortIcon} />
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer} data-testid="table-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* Global Filter */}
      {filterable && (
        <div className={styles.filterContainer}>
          <Input.Search
            placeholder="검색..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className={styles.searchInput}
            allowClear
          />
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} role="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} role="row">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    role="columnheader"
                    style={{ width: header.getSize() }}
                    className={`${styles.headerCell} ${
                      header.column.getCanSort() ? styles.sortable : ''
                    }`}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className={styles.headerContent}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {sortable && renderSortIcon(header.column)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr role="row">
                <td
                  colSpan={tableColumns.length}
                  className={styles.emptyCell}
                  role="cell"
                >
                  <Empty description={emptyText} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  role="row"
                  className={row.getIsSelected() ? styles.selectedRow : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} role="cell" className={styles.cell}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className={styles.paginationContainer}>
          <span className={styles.pageInfo}>
            {table.getState().pagination.pageIndex + 1} /{' '}
            {table.getPageCount()} 페이지
          </span>
          <Space size="small">
            <Button
              size="small"
              icon={<LeftOutlined />}
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              aria-label="이전"
            />
            <Button
              size="small"
              icon={<RightOutlined />}
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              aria-label="다음"
            />
          </Space>
        </div>
      )}
    </div>
  );
}

// Memoized DataTable component to prevent unnecessary re-renders
export const DataTable = memo(DataTableInner) as typeof DataTableInner;

export default DataTable;
