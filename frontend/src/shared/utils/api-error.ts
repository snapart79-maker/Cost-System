/**
 * API Error Handling Utilities
 * API 오류 처리 유틸리티
 */

import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  detail?: string | { msg: string; loc: string[] }[];
  message?: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }

  static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    const status = error.response?.status || 500;
    let message = '알 수 없는 오류가 발생했습니다.';
    let detail: string | undefined;

    if (error.response?.data) {
      const data = error.response.data;

      // FastAPI validation error format
      if (Array.isArray(data.detail)) {
        message = '입력 데이터 검증에 실패했습니다.';
        detail = data.detail.map((d) => `${d.loc.join('.')}: ${d.msg}`).join(', ');
      } else if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (data.message) {
        message = data.message;
      }
    } else if (error.message) {
      message = error.message;
    }

    // Map status codes to Korean messages
    switch (status) {
      case 400:
        message = message || '잘못된 요청입니다.';
        break;
      case 401:
        message = '인증이 필요합니다.';
        break;
      case 403:
        message = '접근 권한이 없습니다.';
        break;
      case 404:
        message = '요청한 리소스를 찾을 수 없습니다.';
        break;
      case 409:
        message = '이미 존재하는 데이터입니다.';
        break;
      case 422:
        message = message || '입력 데이터 형식이 올바르지 않습니다.';
        break;
      case 500:
        message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        break;
      case 502:
      case 503:
      case 504:
        message = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
        break;
    }

    return new ApiError(message, status, detail);
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }

  static isNetworkError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      return !error.response && error.code === 'ERR_NETWORK';
    }
    return false;
  }
}

/**
 * API 호출 래퍼 - 일관된 에러 처리
 */
export async function handleApiCall<T>(apiCall: Promise<T>): Promise<T> {
  try {
    return await apiCall;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw ApiError.fromAxiosError(error);
    }
    throw error;
  }
}
