/**
 * ProcessChangeTable Component
 * 공정 변경 테이블 - 편집 가능
 */

import { useMemo, useState, useCallback } from 'react';
import { Card, Button, InputNumber, Select, Tag, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { useProcesses } from '@/application/hooks';
import {
  ChangeItemStatus,
  ChangeItemStatusLabels,
  type ProcessChangeItem,
} from '@/domain/entities/price-change';
// Process type is used through ProcessChangeItem
import styles from './ProcessChangeTable.module.css';

export interface ProcessChangeRow extends ProcessChangeItem {
  key: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

export interface ProcessChangeTableProps {
  data: ProcessChangeRow[];
  onChange: (data: ProcessChangeRow[]) => void;
  disabled?: boolean;
}

const statusColors: Record<ChangeItemStatus, string> = {
  [ChangeItemStatus.NEW]: 'green',
  [ChangeItemStatus.MODIFIED]: 'orange',
  [ChangeItemStatus.DELETED]: 'red',
  [ChangeItemStatus.UNCHANGED]: 'default',
};

export function ProcessChangeTable({
  data,
  onChange,
  disabled = false,
}: ProcessChangeTableProps) {
  const { processes } = useProcesses();
  const [editingCell, setEditingCell] = useState<{
    key: string;
    field: string;
  } | null>(null);

  const handleCellChange = useCallback(
    (key: string, field: string, value: number) => {
      const newData = data.map((row) => {
        if (row.key === key) {
          const updated = { ...row, [field]: value };
          // Mark as modified if not new
          if (!row.isNew && row.status !== ChangeItemStatus.DELETED) {
            updated.status = ChangeItemStatus.MODIFIED;
          }
          // Calculate cost based on cycle time and workers (simplified)
          if (field === 'after_cycle_time' || field === 'after_workers') {
            const ct = field === 'after_cycle_time' ? value : row.after_cycle_time || 0;
            const workers = field === 'after_workers' ? value : row.after_workers || 1;
            const hourlyRate = row.process?.hourly_rate || 15000;
            // Cost = (workers * hourlyRate) / (3600 / cycle_time)
            updated.after_cost = ct > 0 ? (workers * hourlyRate) / (3600 / ct) : 0;
            updated.cost_diff = updated.after_cost - (row.before_cost || 0);
          }
          return updated;
        }
        return row;
      });
      onChange(newData);
      setEditingCell(null);
    },
    [data, onChange]
  );

  const handleAddRow = useCallback(() => {
    const newRow: ProcessChangeRow = {
      key: `new-${Date.now()}`,
      process_id: '',
      status: ChangeItemStatus.NEW,
      before_cycle_time: 0,
      after_cycle_time: 0,
      before_workers: 1,
      after_workers: 1,
      before_cost: 0,
      after_cost: 0,
      cost_diff: 0,
      isNew: true,
    };
    onChange([...data, newRow]);
    message.success('공정이 추가되었습니다');
  }, [data, onChange]);

  const handleDeleteRow = useCallback(
    (key: string) => {
      const newData = data.map((row) => {
        if (row.key === key) {
          if (row.isNew) {
            return null;
          }
          return {
            ...row,
            status: ChangeItemStatus.DELETED,
            isDeleted: true,
          };
        }
        return row;
      }).filter(Boolean) as ProcessChangeRow[];
      onChange(newData);
      message.success('삭제 예정으로 표시되었습니다');
    },
    [data, onChange]
  );

  const handleProcessSelect = useCallback(
    (key: string, processId: string) => {
      const process = processes?.find((p) => p.id === processId);
      if (!process) return;

      const newData = data.map((row) => {
        if (row.key === key) {
          return {
            ...row,
            process_id: processId,
            process,
            after_cycle_time: process.cycle_time,
            before_cycle_time: process.cycle_time,
            after_workers: process.worker_count,
            before_workers: process.worker_count,
          };
        }
        return row;
      });
      onChange(newData);
    },
    [data, processes, onChange]
  );

  const columns: ColumnDef<ProcessChangeRow>[] = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: '상태',
        size: 80,
        cell: ({ row }) => (
          <Tag color={statusColors[row.original.status]}>
            {row.original.isDeleted
              ? '삭제예정'
              : row.original.isNew
                ? '신규'
                : row.original.status === ChangeItemStatus.MODIFIED
                  ? '수정됨'
                  : ChangeItemStatusLabels[row.original.status]}
          </Tag>
        ),
      },
      {
        accessorKey: 'process_id',
        header: '공정',
        size: 200,
        cell: ({ row }) => {
          if (row.original.isNew && !row.original.process) {
            return (
              <Select
                showSearch
                placeholder="공정 선택"
                value={row.original.process_id || undefined}
                onChange={(value) => handleProcessSelect(row.original.key, value)}
                options={processes?.map((p) => ({
                  label: `${p.process_id} - ${p.name}`,
                  value: p.id,
                }))}
                style={{ width: '100%' }}
                optionFilterProp="label"
                disabled={disabled}
              />
            );
          }
          return (
            <span>
              {row.original.process?.process_id} - {row.original.process?.name}
            </span>
          );
        },
      },
      {
        accessorKey: 'before_cycle_time',
        header: '변경 전 C/T',
        size: 100,
        cell: ({ row }) => (
          <span>{row.original.before_cycle_time?.toFixed(1) || '-'}</span>
        ),
      },
      {
        accessorKey: 'after_cycle_time',
        header: '변경 후 C/T',
        size: 120,
        cell: ({ row }) => {
          const isEditing =
            editingCell?.key === row.original.key &&
            editingCell?.field === 'after_cycle_time';
          const value = row.original.after_cycle_time;

          if (isEditing) {
            return (
              <InputNumber
                autoFocus
                defaultValue={value}
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                onBlur={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  handleCellChange(row.original.key, 'after_cycle_time', newValue);
                }}
                onPressEnter={(e) => {
                  const newValue = parseFloat((e.target as HTMLInputElement).value) || 0;
                  handleCellChange(row.original.key, 'after_cycle_time', newValue);
                }}
              />
            );
          }

          return (
            <div
              className={styles.editableCell}
              onClick={() =>
                !disabled &&
                !row.original.isDeleted &&
                setEditingCell({ key: row.original.key, field: 'after_cycle_time' })
              }
              data-testid="editable-cycle-time"
            >
              {value?.toFixed(1) || '0.0'}
            </div>
          );
        },
      },
      {
        accessorKey: 'before_workers',
        header: '변경 전 인원',
        size: 100,
        cell: ({ row }) => <span>{row.original.before_workers || '-'}</span>,
      },
      {
        accessorKey: 'after_workers',
        header: '변경 후 인원',
        size: 120,
        cell: ({ row }) => {
          const isEditing =
            editingCell?.key === row.original.key &&
            editingCell?.field === 'after_workers';
          const value = row.original.after_workers;

          if (isEditing) {
            return (
              <InputNumber
                autoFocus
                defaultValue={value}
                min={1}
                step={1}
                style={{ width: '100%' }}
                onBlur={(e) => {
                  const newValue = parseInt(e.target.value, 10) || 1;
                  handleCellChange(row.original.key, 'after_workers', newValue);
                }}
                onPressEnter={(e) => {
                  const newValue = parseInt((e.target as HTMLInputElement).value, 10) || 1;
                  handleCellChange(row.original.key, 'after_workers', newValue);
                }}
              />
            );
          }

          return (
            <div
              className={styles.editableCell}
              onClick={() =>
                !disabled &&
                !row.original.isDeleted &&
                setEditingCell({ key: row.original.key, field: 'after_workers' })
              }
              data-testid="editable-workers"
            >
              {value || 1}
            </div>
          );
        },
      },
      {
        accessorKey: 'cost_diff',
        header: '비용 차이',
        size: 100,
        cell: ({ row }) => {
          const diff = row.original.cost_diff || 0;
          const color = diff > 0 ? 'red' : diff < 0 ? 'green' : 'inherit';
          return <span style={{ color }}>{diff.toFixed(2)}</span>;
        },
      },
      {
        id: 'actions',
        header: '작업',
        size: 80,
        cell: ({ row }) => (
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={() => handleDeleteRow(row.original.key)}
            okText="삭제"
            cancelText="취소"
            disabled={disabled || row.original.isDeleted}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={disabled || row.original.isDeleted}
              aria-label="삭제"
            />
          </Popconfirm>
        ),
      },
    ],
    [
      editingCell,
      processes,
      disabled,
      handleCellChange,
      handleProcessSelect,
      handleDeleteRow,
    ]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card
      title={
        <Space>
          <span>공정 항목</span>
          <Tag>{data.length}개</Tag>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRow}
          disabled={disabled}
          aria-label="공정 추가"
        >
          공정 추가
        </Button>
      }
      className={styles.container}
    >
      <div className={styles.tableWrapper} data-testid="process-change-table">
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={row.original.isDeleted ? styles.deletedRow : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className={styles.empty}>공정 항목이 없습니다</div>
        )}
      </div>
    </Card>
  );
}

export default ProcessChangeTable;
