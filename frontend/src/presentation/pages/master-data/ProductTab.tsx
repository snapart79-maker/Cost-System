/**
 * ProductTab Component
 * 완제품 관리 탭 - DataTable + CRUD
 */

import { useState, useCallback, useMemo } from 'react';
import { message, Modal, Tag } from 'antd';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, TableToolbar } from '@/presentation/components/table';
import { useProducts } from '@/application/hooks/use-products';
import { Product, ProductStatus, PRODUCT_STATUS_LABELS } from '@/domain/entities/product';
import { MasterDataForm } from './components/MasterDataForm';
import { ImportExportButtons } from './components/ImportExportButtons';
import styles from './TabStyles.module.css';

const STATUS_COLORS: Record<ProductStatus, string> = {
  [ProductStatus.DEVELOPMENT]: 'gold',
  [ProductStatus.PRODUCTION]: 'green',
  [ProductStatus.DISCONTINUED]: 'red',
};

export function ProductTab() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { products, isLoading, createProduct, updateProduct, deleteProduct, refetch } =
    useProducts({ search: searchValue });

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: 'product_id',
        header: '품번',
        size: 120,
      },
      {
        accessorKey: 'name',
        header: '품명',
        size: 200,
      },
      {
        accessorKey: 'customer_name',
        header: '고객사',
        size: 150,
      },
      {
        accessorKey: 'status',
        header: '상태',
        size: 100,
        cell: ({ getValue }) => {
          const status = getValue<ProductStatus>();
          return (
            <Tag color={STATUS_COLORS[status]}>
              {PRODUCT_STATUS_LABELS[status]}
            </Tag>
          );
        },
      },
      {
        accessorKey: 'model_year',
        header: '연식',
        size: 80,
      },
      {
        accessorKey: 'current_purchase_cost',
        header: '현재 구매원가',
        size: 130,
        cell: ({ getValue }) =>
          getValue<number>() ? `${getValue<number>().toLocaleString()}원` : '-',
      },
    ],
    []
  );

  const handleAdd = useCallback(() => {
    setEditingProduct(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;

    Modal.confirm({
      title: '삭제 확인',
      content: `선택한 ${selectedRows.length}개의 완제품을 삭제하시겠습니까?`,
      okText: '삭제',
      okButtonProps: { danger: true },
      cancelText: '취소',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRows.map((row) => deleteProduct.mutateAsync(row.id))
          );
          message.success(`${selectedRows.length}개 완제품이 삭제되었습니다.`);
          setSelectedRows([]);
        } catch (error) {
          message.error('삭제 중 오류가 발생했습니다.');
        }
      },
    });
  }, [selectedRows, deleteProduct]);

  const handleFormSubmit = useCallback(
    async (data: Partial<Product>) => {
      try {
        if (editingProduct) {
          await updateProduct.mutateAsync({
            id: editingProduct.id,
            data,
          });
          message.success('완제품이 수정되었습니다.');
        } else {
          await createProduct.mutateAsync(data as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
          message.success('완제품이 등록되었습니다.');
        }
        setFormOpen(false);
        setEditingProduct(null);
      } catch (error) {
        message.error('저장 중 오류가 발생했습니다.');
      }
    },
    [editingProduct, createProduct, updateProduct]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingProduct(null);
  }, []);

  return (
    <div className={styles.tabContainer}>
      <TableToolbar
        onAdd={handleAdd}
        onDelete={handleDelete}
        onSearch={setSearchValue}
        searchValue={searchValue}
        searchPlaceholder="품번, 품명 또는 고객사 검색..."
        selectedCount={selectedRows.length}
        addLabel="완제품 추가"
        customActions={[
          {
            key: 'import-export',
            label: '',
            icon: <ImportExportButtons entityType="products" onImportComplete={refetch} />,
            onClick: () => {},
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={products || []}
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
        emptyText="등록된 완제품이 없습니다."
      />

      <MasterDataForm
        open={formOpen}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        entityType="product"
        initialData={editingProduct || undefined}
        title={editingProduct ? '완제품 수정' : '완제품 등록'}
        loading={createProduct.isPending || updateProduct.isPending}
      />
    </div>
  );
}

export default ProductTab;
