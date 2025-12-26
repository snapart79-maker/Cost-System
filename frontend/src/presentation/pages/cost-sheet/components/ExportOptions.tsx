/**
 * ExportOptions Component
 * PDF/Excel 다운로드 버튼
 */

import { useState } from 'react';
import { Button, Space, message } from 'antd';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { pdfService } from '@/infrastructure/services/pdf.service';
import type { WorkTypeFilterValue } from './WorkTypeFilter';
import styles from './ExportOptions.module.css';

export interface ExportOptionsProps {
  productId?: string;
  workType: WorkTypeFilterValue;
  disabled?: boolean;
}

export function ExportOptions({
  productId,
  workType,
  disabled = false,
}: ExportOptionsProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const handlePdfDownload = async () => {
    if (!productId) {
      message.warning('완제품을 선택해주세요');
      return;
    }

    try {
      setPdfLoading(true);
      await pdfService.downloadCostSheetPdf({
        productId,
        workType,
      });
      message.success('PDF 다운로드가 완료되었습니다');
    } catch (error) {
      message.error('PDF 다운로드에 실패했습니다');
      console.error('PDF download error:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcelDownload = async () => {
    if (!productId) {
      message.warning('완제품을 선택해주세요');
      return;
    }

    try {
      setExcelLoading(true);
      await pdfService.downloadCostSheetExcel({
        productId,
        workType,
      });
      message.success('Excel 다운로드가 완료되었습니다');
    } catch (error) {
      message.error('Excel 다운로드에 실패했습니다');
      console.error('Excel download error:', error);
    } finally {
      setExcelLoading(false);
    }
  };

  const isDisabled = disabled || !productId;

  return (
    <div className={styles.container}>
      <Space>
        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          onClick={handlePdfDownload}
          loading={pdfLoading}
          disabled={isDisabled}
          aria-label="PDF 다운로드"
        >
          PDF
        </Button>
        <Button
          icon={<FileExcelOutlined />}
          onClick={handleExcelDownload}
          loading={excelLoading}
          disabled={isDisabled}
          aria-label="Excel 다운로드"
        >
          Excel
        </Button>
      </Space>
    </div>
  );
}

export default ExportOptions;
