/**
 * Notification Utilities
 * 알림 유틸리티 (Ant Design message/notification 래퍼)
 */

import { message, notification } from 'antd';
import { ApiError } from './api-error';
import type { AxiosError } from 'axios';

// Message duration settings
const MESSAGE_DURATION = {
  success: 2,
  error: 4,
  warning: 3,
  info: 3,
  loading: 0, // stays until dismissed
};

/**
 * Show success message
 */
export function showSuccess(content: string, duration?: number): void {
  message.success(content, duration ?? MESSAGE_DURATION.success);
}

/**
 * Show error message
 */
export function showError(content: string, duration?: number): void {
  message.error(content, duration ?? MESSAGE_DURATION.error);
}

/**
 * Show warning message
 */
export function showWarning(content: string, duration?: number): void {
  message.warning(content, duration ?? MESSAGE_DURATION.warning);
}

/**
 * Show info message
 */
export function showInfo(content: string, duration?: number): void {
  message.info(content, duration ?? MESSAGE_DURATION.info);
}

/**
 * Show loading message (returns hide function)
 */
export function showLoading(content: string = '처리 중...'): () => void {
  const hide = message.loading(content, MESSAGE_DURATION.loading);
  return hide;
}

/**
 * Show API error with user-friendly message
 */
export function showApiError(error: unknown): void {
  let errorMessage: string;
  let errorDetail: string | undefined;

  if (ApiError.isApiError(error)) {
    errorMessage = error.message;
    errorDetail = error.detail;
  } else if (error instanceof Error) {
    // Check for network errors
    if ('code' in error && (error as AxiosError).code === 'ERR_NETWORK') {
      errorMessage = '네트워크 연결을 확인해주세요.';
    } else if ('code' in error && (error as AxiosError).code === 'ECONNABORTED') {
      errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    } else {
      errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
    }
  } else {
    errorMessage = '알 수 없는 오류가 발생했습니다.';
  }

  // Show detailed notification for complex errors
  if (errorDetail) {
    notification.error({
      message: errorMessage,
      description: errorDetail,
      duration: 5,
      placement: 'topRight',
    });
  } else {
    message.error(errorMessage, MESSAGE_DURATION.error);
  }
}

/**
 * Show network error
 */
export function showNetworkError(): void {
  notification.error({
    message: '네트워크 오류',
    description: '서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
    duration: 6,
    placement: 'topRight',
  });
}

/**
 * Show validation error
 */
export function showValidationError(fields: string[]): void {
  const fieldList = fields.join(', ');
  message.error(`다음 필드를 확인해주세요: ${fieldList}`, MESSAGE_DURATION.error);
}

/**
 * Show confirmation success
 */
export function showSaveSuccess(itemName?: string): void {
  const content = itemName ? `${itemName}이(가) 저장되었습니다.` : '저장되었습니다.';
  message.success(content, MESSAGE_DURATION.success);
}

/**
 * Show delete success
 */
export function showDeleteSuccess(itemName?: string): void {
  const content = itemName ? `${itemName}이(가) 삭제되었습니다.` : '삭제되었습니다.';
  message.success(content, MESSAGE_DURATION.success);
}

/**
 * Notification wrapper for async operations
 */
export async function withNotification<T>(
  operation: () => Promise<T>,
  options: {
    loading?: string;
    success?: string;
    error?: string;
  } = {}
): Promise<T> {
  const {
    loading = '처리 중...',
    success = '완료되었습니다.',
    error: errorMsg = '오류가 발생했습니다.',
  } = options;

  const hide = showLoading(loading);

  try {
    const result = await operation();
    hide();
    showSuccess(success);
    return result;
  } catch (error) {
    hide();
    if (ApiError.isApiError(error)) {
      showApiError(error);
    } else {
      showError(errorMsg);
    }
    throw error;
  }
}
