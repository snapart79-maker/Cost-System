/**
 * BomTab Component
 * BOM 관리 탭 - 완제품 선택 → BOM 항목 관리
 */

import { useState, useCallback, useMemo } from 'react';
import { Select, message, Modal, Tag, Card, Space, Typography } from 'antd';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, TableToolbar } from '@/presentation/components/table';
import { useProducts } from '@/application/hooks/use-products';
import { useBom } from '@/application/hooks/use-bom';
import { BomItem, BomItemType, BOM_ITEM_TYPE_LABELS } from '@/domain/entities/bom';
import { MasterDataForm } from './components/MasterDataForm';
import styles from './TabStyles.module.css';

const { Text } = Typography;

export function BomTab() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<BomItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBomItem, setEditingBomItem] = useState<BomItem | null>(null);

  const { products, isLoading: productsLoading } = useProducts();
  const {
    bomItems,
    bomSummary,
    isLoading: bomLoading,
    createBomItem,
    updateBomItem,
    deleteBomItem,
  } = useBom({ productId: selectedProductId || undefined });

  const productOptions = useMemo(
    () =>
      (products || []).map((p) => ({
        value: p.id,
        label: `${p.product_id} - ${p.name}`,
      })),
    [products]
  );

  const columns: ColumnDef<BomItem>[] = useMemo(
    () => [
      {
        accessorKey: 'item_type',
        header: '구분',
        size: 80,
        cell: ({ getValue }) => {
          const type = getValue<BomItemType>();
          return (
            <Tag color={type === BomItemType.MATERIAL ? 'blue' : 'purple'}>
              {BOM_ITEM_TYPE_LABELS[type]}
            </Tag>
          );
        },
      },
      {
        accessorKey: 'item_code',
        header: '코드',
        size: 120,
      },
      {
        accessorKey: 'item_name',
        header: '품명',
        size: 180,
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
        accessorKey: 'quantity',
        header: '소요량',
        size: 100,
        cell: ({ getValue }) => getValue<number>()?.toFixed(4) || '-',
      },
      {
        accessorKey: 'unit_price',
        header: '단가',
        size: 120,
        cell: ({ getValue }) =>
          getValue<number>() ? `${getValue<number>().toLocaleString()}원` : '-',
      },
      {
        accessorKey: 'amount',
        header: '금액',
        size: 120,
        cell: ({ getValue }) =>
          getValue<number>() ? `${getValue<number>().toLocaleString()}원` : '-',
      },
    ],
    []
  );

  const handleProductChange = useCallback((value: string) => {
    setSelectedProductId(value);
    setSelectedRows([]);
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedProductId) {
      message.warning('먼저 완제품을 선택하세요.');
      return;
    }
    setEditingBomItem(null);
    setFormOpen(true);
  }, [selectedProductId]);

  const handleEdit = useCallback((item: BomItem) => {
    setEditingBomItem(item);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedRows.length === 0) return;

    Modal.confirm({
      title: '삭제 확인',
      content: `선택한 ${selectedRows.length}개의 BOM 항목을 삭제하시겠습니까?`,
      okText: '삭제',
      okButtonProps: { danger: true },
      cancelText: '취소',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRows.map((row) => deleteBomItem.mutateAsync(row.id))
          );
          message.success(`${selectedRows.length}개 BOM 항목이 삭제되었습니다.`);
          setSelectedRows([]);
        } catch (error) {
          message.error('삭제 중 오류가 발생했습니다.');
        }
      },
    });
  }, [selectedRows, deleteBomItem]);

  const handleFormSubmit = useCallback(
    async (data: Partial<BomItem>) => {
      try {
        if (editingBomItem) {
          await updateBomItem.mutateAsync({
            id: editingBomItem.id,
            data,
          });
          message.success('BOM 항목이 수정되었습니다.');
        } else {
          await createBomItem.mutateAsync({
            ...data,
            product_id: selectedProductId!,
          } as Omit<BomItem, 'id' | 'created_at' | 'updated_at'>);
          message.success('BOM 항목이 등록되었습니다.');
        }
        setFormOpen(false);
        setEditingBomItem(null);
      } catch (error) {
        message.error('저장 중 오류가 발생했습니다.');
      }
    },
    [editingBomItem, selectedProductId, createBomItem, updateBomItem]
  );

  const handleFormCancel = useCallback(() => {
    setFormOpen(false);
    setEditingBomItem(null);
  }, []);

  return (
    <div className={styles.tabContainer}>
      {/* Product Selector */}
      <Card size="small" className={styles.selectorCard}>
        <Space size="large" align="center">
          <Text strong>완제품 선택:</Text>
          <Select
            placeholder="완제품을 선택하세요"
            style={{ width: 400 }}
            options={productOptions}
            value={selectedProductId}
            onChange={handleProductChange}
            loading={productsLoading}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString() || '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Space>
      </Card>

      {/* BOM Summary */}
      {bomSummary && selectedProductId && (
        <Card size="small" className={styles.summaryCard}>
          <Space size="large">
            <div>
              <Text type="secondary">자재 항목:</Text>
              <Text strong> {bomSummary.material_count}개</Text>
            </div>
            <div>
              <Text type="secondary">공정 항목:</Text>
              <Text strong> {bomSummary.process_count}개</Text>
            </div>
            <div>
              <Text type="secondary">재료비:</Text>
              <Text strong> {bomSummary.total_material_cost.toLocaleString()}원</Text>
            </div>
            <div>
              <Text type="secondary">가공비:</Text>
              <Text strong> {bomSummary.total_process_cost.toLocaleString()}원</Text>
            </div>
          </Space>
        </Card>
      )}

      {/* BOM Table */}
      {selectedProductId ? (
        <>
          <TableToolbar
            onAdd={handleAdd}
            onDelete={handleDelete}
            selectedCount={selectedRows.length}
            addLabel="BOM 항목 추가"
            showSearch={false}
          />

          <DataTable
            columns={columns}
            data={bomItems || []}
            loading={bomLoading}
            sortable
            filterable={false}
            pagination
            pageSize={20}
            selectable
            onSelectionChange={setSelectedRows}
            actions={[{ label: '수정', onClick: handleEdit }]}
            emptyText="등록된 BOM 항목이 없습니다."
          />
        </>
      ) : (
        <div className={styles.emptyState}>
          <Text type="secondary">완제품을 선택하면 BOM 항목이 표시됩니다.</Text>
        </div>
      )}

      <MasterDataForm
        open={formOpen}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        entityType="bom"
        initialData={editingBomItem || undefined}
        title={editingBomItem ? 'BOM 항목 수정' : 'BOM 항목 등록'}
        loading={createBomItem.isPending || updateBomItem.isPending}
      />
    </div>
  );
}

export default BomTab;
