/**
 * BulkEditModal Component
 * 일괄 수정 모달 - Excel 업로드/다운로드
 */

import { useState } from 'react';
import { Modal, Upload, Button, Space, Tabs, Alert, message } from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import styles from './BulkEditModal.module.css';

export interface BulkEditModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (data: BulkEditData) => void;
  type: 'material' | 'process';
}

export interface BulkEditData {
  type: 'material' | 'process';
  items: Array<{
    id: string;
    quantity?: number;
    unit_price?: number;
    cycle_time?: number;
    workers?: number;
  }>;
}

export function BulkEditModal({
  open,
  onClose,
  onApply,
  type,
}: BulkEditModalProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pasteData, setPasteData] = useState('');

  const handleDownloadTemplate = () => {
    // Create template based on type
    const templateUrl =
      type === 'material'
        ? '/api/v1/excel/template/material-change'
        : '/api/v1/excel/template/process-change';

    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = `${type}-change-template.xlsx`;
    link.click();

    message.success('양식이 다운로드되었습니다');
  };

  const handleUpload: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} 파일이 업로드되었습니다`);
      // Parse the response and apply
      if (info.file.response) {
        onApply(info.file.response);
        onClose();
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 파일 업로드에 실패했습니다`);
    }
  };

  const handlePasteApply = () => {
    if (!pasteData.trim()) {
      message.warning('데이터를 입력해주세요');
      return;
    }

    try {
      // Parse tab-separated or comma-separated values
      const lines = pasteData.trim().split('\n');
      const items = lines.map((line) => {
        const values = line.split(/[\t,]/);
        if (type === 'material') {
          return {
            id: values[0]?.trim() || '',
            quantity: parseFloat(values[1]) || undefined,
            unit_price: parseFloat(values[2]) || undefined,
          };
        }
        return {
          id: values[0]?.trim() || '',
          cycle_time: parseFloat(values[1]) || undefined,
          workers: parseInt(values[2], 10) || undefined,
        };
      });

      onApply({ type, items });
      message.success('데이터가 적용되었습니다');
      onClose();
    } catch (error) {
      message.error('데이터 형식이 올바르지 않습니다');
    }
  };

  const tabItems = [
    {
      key: 'upload',
      label: 'Excel 업로드',
      children: (
        <div className={styles.tabContent}>
          <Alert
            type="info"
            message="Excel 파일로 일괄 수정"
            description="양식을 다운로드하여 작성 후 업로드하세요. 기존 데이터가 덮어씌워집니다."
            showIcon
            className={styles.alert}
          />

          <Space direction="vertical" size="middle" className={styles.uploadArea}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              aria-label="양식 다운로드"
            >
              양식 다운로드
            </Button>

            <Upload
              name="file"
              action={`/api/v1/excel/import/${type}-change`}
              onChange={handleUpload}
              fileList={fileList}
              accept=".xlsx,.xls"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Excel 업로드</Button>
            </Upload>
          </Space>
        </div>
      ),
    },
    {
      key: 'paste',
      label: '직접 입력',
      children: (
        <div className={styles.tabContent}>
          <Alert
            type="info"
            message="직접 입력"
            description={
              type === 'material'
                ? 'Excel에서 복사한 데이터를 붙여넣기 하세요. (자재ID, 수량, 단가)'
                : 'Excel에서 복사한 데이터를 붙여넣기 하세요. (공정ID, C/T, 인원)'
            }
            showIcon
            className={styles.alert}
          />

          <textarea
            className={styles.pasteArea}
            placeholder={
              type === 'material'
                ? 'AWG20-RED\t1.5\t72.78\nTERM-001\t4\t18.50'
                : 'CUT-001\t3.0\t1\nTAPE-001\t2.5\t1'
            }
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            rows={10}
          />

          <Button
            type="primary"
            onClick={handlePasteApply}
            className={styles.applyButton}
          >
            적용
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileExcelOutlined />
          <span>
            {type === 'material' ? '자재' : '공정'} 일괄 수정
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </Modal>
  );
}

export default BulkEditModal;
