/**
 * MaterialChangeTable Component
 * 자재 변경 테이블 - 편집 가능
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
import { useMaterials } from '@/application/hooks';
import {
  ChangeItemStatus,
  ChangeItemStatusLabels,
  type MaterialChangeItem,
} from '@/domain/entities/price-change';
// Material type is used through MaterialChangeItem
import styles from './MaterialChangeTable.module.css';

export interface MaterialChangeRow extends MaterialChangeItem {
  key: string;
  isNew?: boolean;
  isDeleted?: boolean;
}

export interface MaterialChangeTableProps {
  data: MaterialChangeRow[];
  onChange: (data: MaterialChangeRow[]) => void;
  disabled?: boolean;
}

const statusColors: Record<ChangeItemStatus, string> = {
  [ChangeItemStatus.NEW]: 'green',
  [ChangeItemStatus.MODIFIED]: 'orange',
  [ChangeItemStatus.DELETED]: 'red',
  [ChangeItemStatus.UNCHANGED]: 'default',
};

export function MaterialChangeTable({
  data,
  onChange,
  disabled = false,
}: MaterialChangeTableProps) {
  const { materials } = useMaterials();
  const [editingCell, setEditingCell] = useState<{
    key: string;
    field: string;
  } | null>(null);

  const handleCellChange = useCallback(
    (key: string, field: string, value: number | string) => {
      const newData = data.map((row) => {
        if (row.key === key) {
          const updated = { ...row, [field]: value };
          // Mark as modified if not new
          if (!row.isNew && row.status !== ChangeItemStatus.DELETED) {
            updated.status = ChangeItemStatus.MODIFIED;
          }
          // Calculate cost difference
          if (field === 'after_quantity' || field === 'after_unit_price') {
            const qty = field === 'after_quantity' ? (value as number) : row.after_quantity;
            const price = field === 'after_unit_price' ? (value as number) : row.after_unit_price;
            updated.after_cost = (qty || 0) * (price || 0);
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
    const newRow: MaterialChangeRow = {
      key: `new-${Date.now()}`,
      material_id: '',
      status: ChangeItemStatus.NEW,
      before_quantity: 0,
      after_quantity: 0,
      before_unit_price: 0,
      after_unit_price: 0,
      before_cost: 0,
      after_cost: 0,
      cost_diff: 0,
      isNew: true,
    };
    onChange([...data, newRow]);
    message.success('자재가 추가되었습니다');
  }, [data, onChange]);

  const handleDeleteRow = useCallback(
    (key: string) => {
      const newData = data.map((row) => {
        if (row.key === key) {
          if (row.isNew) {
            return null; // Remove new rows completely
          }
          return {
            ...row,
            status: ChangeItemStatus.DELETED,
            isDeleted: true,
          };
        }
        return row;
      }).filter(Boolean) as MaterialChangeRow[];
      onChange(newData);
      message.success('삭제 예정으로 표시되었습니다');
    },
    [data, onChange]
  );

  const handleMaterialSelect = useCallback(
    (key: string, materialId: string) => {
      const material = materials?.find((m) => m.id === materialId);
      if (!material) return;

      const newData = data.map((row) => {
        if (row.key === key) {
          return {
            ...row,
            material_id: materialId,
            material,
            after_unit_price: material.unit_price,
            before_unit_price: material.unit_price,
          };
        }
        return row;
      });
      onChange(newData);
    },
    [data, materials, onChange]
  );

  const columns: ColumnDef<MaterialChangeRow>[] = useMemo(
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
        accessorKey: 'material_id',
        header: '자재',
        size: 200,
        cell: ({ row }) => {
          if (row.original.isNew && !row.original.material) {
            return (
              <Select
                showSearch
                placeholder="자재 선택"
                value={row.original.material_id || undefined}
                onChange={(value) => handleMaterialSelect(row.original.key, value)}
                options={materials?.map((m) => ({
                  label: `${m.material_id} - ${m.name}`,
                  value: m.id,
                }))}
                style={{ width: '100%' }}
                optionFilterProp="label"
                disabled={disabled}
              />
            );
          }
          return (
            <span>
              {row.original.material?.material_id} - {row.original.material?.name}
            </span>
          );
        },
      },
      {
        accessorKey: 'before_quantity',
        header: '변경 전 수량',
        size: 100,
        cell: ({ row }) => (
          <span>{row.original.before_quantity?.toFixed(2) || '-'}</span>
        ),
      },
      {
        accessorKey: 'after_quantity',
        header: '변경 후 수량',
        size: 120,
        cell: ({ row }) => {
          const isEditing =
            editingCell?.key === row.original.key &&
            editingCell?.field === 'after_quantity';
          const value = row.original.after_quantity;

          if (isEditing) {
            return (
              <InputNumber
                autoFocus
                defaultValue={value}
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                onBlur={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  handleCellChange(row.original.key, 'after_quantity', newValue);
                }}
                onPressEnter={(e) => {
                  const newValue = parseFloat((e.target as HTMLInputElement).value) || 0;
                  handleCellChange(row.original.key, 'after_quantity', newValue);
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
                setEditingCell({ key: row.original.key, field: 'after_quantity' })
              }
              data-testid="editable-quantity"
            >
              {value?.toFixed(2) || '0.00'}
            </div>
          );
        },
      },
      {
        accessorKey: 'before_unit_price',
        header: '변경 전 단가',
        size: 100,
        cell: ({ row }) => (
          <span>{row.original.before_unit_price?.toFixed(2) || '-'}</span>
        ),
      },
      {
        accessorKey: 'after_unit_price',
        header: '변경 후 단가',
        size: 120,
        cell: ({ row }) => {
          const isEditing =
            editingCell?.key === row.original.key &&
            editingCell?.field === 'after_unit_price';
          const value = row.original.after_unit_price;

          if (isEditing) {
            return (
              <InputNumber
                autoFocus
                defaultValue={value}
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                onBlur={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  handleCellChange(row.original.key, 'after_unit_price', newValue);
                }}
                onPressEnter={(e) => {
                  const newValue = parseFloat((e.target as HTMLInputElement).value) || 0;
                  handleCellChange(row.original.key, 'after_unit_price', newValue);
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
                setEditingCell({ key: row.original.key, field: 'after_unit_price' })
              }
              data-testid="editable-unit-price"
            >
              {value?.toFixed(2) || '0.00'}
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
      materials,
      disabled,
      handleCellChange,
      handleMaterialSelect,
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
          <span>자재 항목</span>
          <Tag>{data.length}개</Tag>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRow}
          disabled={disabled}
          aria-label="자재 추가"
        >
          자재 추가
        </Button>
      }
      className={styles.container}
    >
      <div className={styles.tableWrapper} data-testid="material-change-table">
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
          <div className={styles.empty}>자재 항목이 없습니다</div>
        )}
      </div>
    </Card>
  );
}

export default MaterialChangeTable;
