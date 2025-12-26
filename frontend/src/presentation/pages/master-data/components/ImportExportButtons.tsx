/**
 * ImportExportButtons Component
 * Excel Import/Export 버튼 그룹
 */

import { useState } from 'react';
import { Button, Dropdown, message, Upload, Modal, Space, Typography } from 'antd';
import type { UploadProps, MenuProps } from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { excelService, type EntityType } from '@/infrastructure/services/excel.service';

const { Text } = Typography;

export interface ImportExportButtonsProps {
  entityType: EntityType;
  onImportComplete?: () => void;
}

export function ImportExportButtons({
  entityType,
  onImportComplete,
}: ImportExportButtonsProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported_count: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);

  const handleDownloadTemplate = async () => {
    try {
      await excelService.downloadTemplate(entityType);
      message.success('템플릿이 다운로드되었습니다.');
    } catch (error) {
      message.error('템플릿 다운로드에 실패했습니다.');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await excelService.exportData(entityType);
      message.success('데이터가 내보내졌습니다.');
    } catch (error) {
      message.error('데이터 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);

    try {
      const result = await excelService.importData(entityType, file);
      setImportResult(result);

      if (result.success) {
        message.success(`${result.imported_count}개 항목이 가져오기되었습니다.`);
        onImportComplete?.();
        setImportModalOpen(false);
      } else if (result.errors.length > 0) {
        message.warning('일부 항목에서 오류가 발생했습니다.');
      }
    } catch (error) {
      message.error('가져오기에 실패했습니다.');
      setImportResult({
        success: false,
        imported_count: 0,
        errors: [{ row: 0, message: '파일 처리 중 오류가 발생했습니다.' }],
      });
    } finally {
      setImporting(false);
    }
  };

  const uploadProps: UploadProps = {
    accept: '.xlsx,.xls',
    showUploadList: false,
    beforeUpload: (file) => {
      handleImport(file);
      return false; // Prevent auto upload
    },
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'template',
      label: '템플릿 다운로드',
      icon: <DownloadOutlined />,
      onClick: handleDownloadTemplate,
    },
    {
      key: 'import',
      label: '가져오기 (Excel)',
      icon: <UploadOutlined />,
      onClick: () => setImportModalOpen(true),
    },
    {
      key: 'export',
      label: '내보내기 (Excel)',
      icon: <FileExcelOutlined />,
      onClick: handleExport,
    },
  ];

  const getEntityLabel = (): string => {
    switch (entityType) {
      case 'materials':
        return '자재';
      case 'processes':
        return '공정';
      case 'products':
        return '완제품';
      case 'bom':
        return 'BOM';
      default:
        return '데이터';
    }
  };

  return (
    <>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button icon={<MoreOutlined />} loading={exporting}>
          Excel
        </Button>
      </Dropdown>

      <Modal
        title={`${getEntityLabel()} 가져오기`}
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setImportResult(null);
        }}
        footer={null}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Text type="secondary">
            Excel 파일(.xlsx)을 업로드하여 {getEntityLabel()} 데이터를 가져옵니다.
            템플릿을 먼저 다운로드하여 형식을 확인하세요.
          </Text>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            style={{ width: '100%' }}
          >
            템플릿 다운로드
          </Button>

          <Upload {...uploadProps} style={{ width: '100%' }}>
            <Button
              icon={<UploadOutlined />}
              loading={importing}
              type="primary"
              style={{ width: '100%' }}
            >
              파일 선택 및 가져오기
            </Button>
          </Upload>

          {importResult && (
            <div
              style={{
                padding: 12,
                background: importResult.success ? '#f6ffed' : '#fff2f0',
                borderRadius: 4,
              }}
            >
              {importResult.success ? (
                <Text type="success">
                  {importResult.imported_count}개 항목이 성공적으로 가져오기되었습니다.
                </Text>
              ) : (
                <>
                  <Text type="danger">가져오기 중 오류가 발생했습니다:</Text>
                  <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                    {importResult.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>
                        <Text type="secondary">
                          {err.row > 0 ? `행 ${err.row}: ` : ''}
                          {err.message}
                        </Text>
                      </li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>
                        <Text type="secondary">
                          ... 외 {importResult.errors.length - 5}건
                        </Text>
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
}

export default ImportExportButtons;
