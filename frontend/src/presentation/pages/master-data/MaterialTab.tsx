/**
 * MaterialTab Component
 * 자재 관리 탭 - DataTable + CRUD
 */

import { useState, useCallback, useMemo } from 'react';
import { message, Modal } from 'antd';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, TableToolbar } from '@/presentation/components/table';
import { useMaterials } from '@/application/hooks/use-materials';
import { Material, MaterialType, MATERIAL_TYPE_LABELS } from '@/domain/entities/material';
import { MasterDataForm } from './components/MasterDataForm';
import { ImportExportButtons } from './components/ImportExportButtons';
import styles from './TabStyles.module.css';

export function MaterialTab() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Material[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const { materials, isLoading, createMaterial, updateMaterial, deleteMaterial, refetch } =
    useMaterials({ search: searchValue });

  const columns: ColumnDef<Material>[] = useMemo(
    () => [
      {
        accessorKey: 'material_id',
        header: '자재코드',
        size: 120,
      },
      {
        accessorKey: 'name',
        header: '자재명',
        size: 180,
      },
      {
        accessorKey: 'type',
        header: '유형',
        size: 100,
        cell: ({ getValue }) => MATERIAL_TYPE_LABELS[getValue<MaterialType>()] || getValue(),
      },
      {
        accessorKey: 'specification',
        header: '규격',
        size: 150,
      },
      {
        accessorKey: 'unit',
        header: '단위',
        size: 80,
      },
      {
        accessorKey: 'unit_price',
        header: '단가',
        size: 120,
        cell: ({ getValue }) =>
          `${getValue<number>().toLocaleString()}원`,
      },
    ],
    []
  );

  const handleAdd = useCallback(() => {
    setEditingMaterial(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((material: Material) => {
    setEditingMaterial(material);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;

    Modal.confirm({
      title: '삭제 확인',
      content: `선택한 ${selectedRows.length}개의 자재를 삭제하시겠습니까?`,
      okText: '삭제',
      okButtonProps: { danger: true },
      cancelText: '취소',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRows.map((row) => deleteMaterial.mutateAsync(row.id))
          );
          message.success(`${selectedRows.length}개 자재가 삭제되었습니다.`);
          setSelectedRows([]);
        } catch (error) {
          message.error('삭제 중 오류가 발생했습니다.');
        }
      },
    });
  }, [selectedRows, deleteMaterial]);

  const handleFormSubmit = useCallback(
    async (data: Partial<Material>) => {
      try {
        if (editingMaterial) {
          await updateMaterial.mutateAsync({
            id: editingMaterial.id,
            data,
          });
          message.success('자재가 수정되었습니다.');
        } else {
          await createMaterial.mutateAsync(data as Omit<Material, 'id' | 'created_at' | 'updated_at'>);
          message.success('자재가 등록되었습니다.');
        }
        setFormOpen(false);
        setEditingMaterial(null);
      } catch (error) {
        message.error('저장 중 오류가 발생했습니다.');
      }
    },
    [editingMaterial, createMaterial, updateMaterial]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingMaterial(null);
  }, []);

  return (
    <div className={styles.tabContainer}>
      <TableToolbar
        onAdd={handleAdd}
        onDelete={handleDelete}
        onSearch={setSearchValue}
        searchValue={searchValue}
        searchPlaceholder="자재코드 또는 자재명 검색..."
        selectedCount={selectedRows.length}
        addLabel="자재 추가"
        customActions={[
          {
            key: 'import-export',
            label: '',
            icon: <ImportExportButtons entityType="materials" onImportComplete={refetch} />,
            onClick: () => {},
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={materials || []}
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
        emptyText="등록된 자재가 없습니다."
      />

      <MasterDataForm
        open={formOpen}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        entityType="material"
        initialData={editingMaterial || undefined}
        title={editingMaterial ? '자재 수정' : '자재 등록'}
        loading={createMaterial.isPending || updateMaterial.isPending}
      />
    </div>
  );
}

export default MaterialTab;
