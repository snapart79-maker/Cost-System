/**
 * ProcessTab Component
 * 공정 관리 탭 - DataTable + CRUD
 */

import { useState, useCallback, useMemo } from 'react';
import { message, Modal, Tag } from 'antd';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, TableToolbar } from '@/presentation/components/table';
import { useProcesses } from '@/application/hooks/use-processes';
import { Process, WorkType, WORK_TYPE_LABELS } from '@/domain/entities/process';
import { MasterDataForm } from './components/MasterDataForm';
import { ImportExportButtons } from './components/ImportExportButtons';
import styles from './TabStyles.module.css';

export function ProcessTab() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Process[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);

  const { processes, isLoading, createProcess, updateProcess, deleteProcess, refetch } =
    useProcesses({ search: searchValue });

  const columns: ColumnDef<Process>[] = useMemo(
    () => [
      {
        accessorKey: 'process_id',
        header: '공정코드',
        size: 120,
      },
      {
        accessorKey: 'name',
        header: '공정명',
        size: 180,
      },
      {
        accessorKey: 'work_type',
        header: '작업유형',
        size: 100,
        cell: ({ getValue }) => {
          const type = getValue<WorkType>();
          return (
            <Tag color={type === WorkType.IN_HOUSE ? 'blue' : 'orange'}>
              {WORK_TYPE_LABELS[type]}
            </Tag>
          );
        },
      },
      {
        accessorKey: 'cycle_time',
        header: 'C/T(초)',
        size: 100,
        cell: ({ getValue }) => getValue<number>()?.toFixed(2) || '-',
      },
      {
        accessorKey: 'worker_count',
        header: '인원',
        size: 80,
      },
      {
        accessorKey: 'hourly_rate',
        header: '시간당 임률',
        size: 120,
        cell: ({ getValue }) =>
          getValue<number>() ? `${getValue<number>().toLocaleString()}원` : '-',
      },
    ],
    []
  );

  const handleAdd = useCallback(() => {
    setEditingProcess(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((process: Process) => {
    setEditingProcess(process);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;

    Modal.confirm({
      title: '삭제 확인',
      content: `선택한 ${selectedRows.length}개의 공정을 삭제하시겠습니까?`,
      okText: '삭제',
      okButtonProps: { danger: true },
      cancelText: '취소',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRows.map((row) => deleteProcess.mutateAsync(row.id))
          );
          message.success(`${selectedRows.length}개 공정이 삭제되었습니다.`);
          setSelectedRows([]);
        } catch (error) {
          message.error('삭제 중 오류가 발생했습니다.');
        }
      },
    });
  }, [selectedRows, deleteProcess]);

  const handleFormSubmit = useCallback(
    async (data: Partial<Process>) => {
      try {
        if (editingProcess) {
          await updateProcess.mutateAsync({
            id: editingProcess.id,
            data,
          });
          message.success('공정이 수정되었습니다.');
        } else {
          await createProcess.mutateAsync(data as Omit<Process, 'id' | 'created_at' | 'updated_at'>);
          message.success('공정이 등록되었습니다.');
        }
        setFormOpen(false);
        setEditingProcess(null);
      } catch (error) {
        message.error('저장 중 오류가 발생했습니다.');
      }
    },
    [editingProcess, createProcess, updateProcess]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingProcess(null);
  }, []);

  return (
    <div className={styles.tabContainer}>
      <TableToolbar
        onAdd={handleAdd}
        onDelete={handleDelete}
        onSearch={setSearchValue}
        searchValue={searchValue}
        searchPlaceholder="공정코드 또는 공정명 검색..."
        selectedCount={selectedRows.length}
        addLabel="공정 추가"
        customActions={[
          {
            key: 'import-export',
            label: '',
            icon: <ImportExportButtons entityType="processes" onImportComplete={refetch} />,
            onClick: () => {},
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={processes || []}
        loading={isLoading}
        sortable
        filterable={false}
        pagination
        pageSize={20}
        selectable
        onSelectionChange={setSelectedRows}
        actions={[
          { label: '수정', onClick: handleEdit },
        ]}
        emptyText="등록된 공정이 없습니다."
      />

      <MasterDataForm
        open={formOpen}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        entityType="process"
        initialData={editingProcess || undefined}
        title={editingProcess ? '공정 수정' : '공정 등록'}
        loading={createProcess.isPending || updateProcess.isPending}
      />
    </div>
  );
}

export default ProcessTab;
