/**
 * TableToolbar Component
 * 테이블 상단 도구 모음 (추가, 삭제, 일괄수정, 검색)
 */

import { Button, Space, Input, Dropdown, MenuProps } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import styles from './TableToolbar.module.css';

export interface ToolbarAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface TableToolbarProps {
  onAdd?: () => void;
  onDelete?: () => void;
  onBulkEdit?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  selectedCount?: number;
  addLabel?: string;
  showAdd?: boolean;
  showDelete?: boolean;
  showBulkEdit?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showSearch?: boolean;
  customActions?: ToolbarAction[];
  className?: string;
}

export function TableToolbar({
  onAdd,
  onDelete,
  onBulkEdit,
  onExport,
  onImport,
  onSearch,
  searchValue = '',
  searchPlaceholder = '검색...',
  selectedCount = 0,
  addLabel = '추가',
  showAdd = true,
  showDelete = true,
  showBulkEdit = false,
  showExport = false,
  showImport = false,
  showSearch = true,
  customActions = [],
  className,
}: TableToolbarProps) {
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'export-excel',
      label: 'Excel 내보내기',
      icon: <DownloadOutlined />,
      onClick: onExport,
    },
    {
      key: 'import-excel',
      label: 'Excel 가져오기',
      icon: <UploadOutlined />,
      onClick: onImport,
    },
  ];

  return (
    <div className={`${styles.toolbar} ${className || ''}`}>
      <div className={styles.leftSection}>
        <Space size="small">
          {showAdd && onAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              {addLabel}
            </Button>
          )}

          {showDelete && onDelete && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={onDelete}
              disabled={selectedCount === 0}
            >
              삭제 {selectedCount > 0 && `(${selectedCount})`}
            </Button>
          )}

          {showBulkEdit && onBulkEdit && (
            <Button icon={<EditOutlined />} onClick={onBulkEdit}>
              일괄 수정
            </Button>
          )}

          {(showExport || showImport) && (
            <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
              <Button icon={<DownloadOutlined />}>Excel</Button>
            </Dropdown>
          )}

          {customActions.map((action) => (
            <Button
              key={action.key}
              icon={action.icon}
              onClick={action.onClick}
              danger={action.danger}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </Space>

        {selectedCount > 0 && (
          <span className={styles.selectionInfo}>
            {selectedCount}개 항목 선택됨
          </span>
        )}
      </div>

      <div className={styles.rightSection}>
        {showSearch && onSearch && (
          <Input.Search
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className={styles.searchInput}
            allowClear
            prefix={<SearchOutlined />}
          />
        )}
      </div>
    </div>
  );
}

export default TableToolbar;
