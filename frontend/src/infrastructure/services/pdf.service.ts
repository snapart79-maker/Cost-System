/**
 * PDF Service
 * PDF 다운로드 서비스
 */

import { apiClient } from '@/infrastructure/api/client';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';

export interface PdfExportOptions {
  productId: string;
  workType?: 'ALL' | 'IN_HOUSE' | 'OUTSOURCE';
}

export interface ExcelExportOptions {
  productId: string;
  workType?: 'ALL' | 'IN_HOUSE' | 'OUTSOURCE';
}

class PdfService {
  /**
   * Download cost sheet as PDF
   */
  async downloadCostSheetPdf(options: PdfExportOptions): Promise<void> {
    const { productId, workType = 'ALL' } = options;

    const response = await apiClient.get(
      API_ENDPOINTS.PDF_COST_BREAKDOWN(productId),
      {
        params: { work_type: workType },
        responseType: 'blob',
      }
    );

    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cost-sheet-${productId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download cost sheet as Excel
   */
  async downloadCostSheetExcel(options: ExcelExportOptions): Promise<void> {
    const { productId, workType = 'ALL' } = options;

    const response = await apiClient.get(
      API_ENDPOINTS.EXCEL_EXPORT_COST_BREAKDOWN(productId),
      {
        params: { work_type: workType },
        responseType: 'blob',
      }
    );

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cost-sheet-${productId}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const pdfService = new PdfService();
export default pdfService;
