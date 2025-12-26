/**
 * Excel Service
 * Excel Import/Export 기능
 */

import { apiClient } from '@/infrastructure/api/client';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';

export type EntityType = 'materials' | 'processes' | 'products' | 'bom';

export interface ExcelImportResult {
  success: boolean;
  imported_count: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export class ExcelService {
  /**
   * Excel 템플릿 다운로드
   */
  async downloadTemplate(entityType: EntityType): Promise<void> {
    const response = await apiClient.get(
      `${API_ENDPOINTS.EXCEL.TEMPLATE}/${entityType}`,
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityType}_template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Excel 파일 내보내기
   */
  async exportData(entityType: EntityType, filters?: Record<string, unknown>): Promise<void> {
    const response = await apiClient.post(
      `${API_ENDPOINTS.EXCEL.EXPORT}/${entityType}`,
      filters,
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityType}_${timestamp}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Excel 파일 가져오기
   */
  async importData(entityType: EntityType, file: File): Promise<ExcelImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `${API_ENDPOINTS.EXCEL.IMPORT}/${entityType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }
}

export const excelService = new ExcelService();
export default excelService;
