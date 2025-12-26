// Korean UI messages
export const MESSAGES = {
  // Common
  LOADING: '로딩 중...',
  SAVING: '저장 중...',
  SUCCESS: '성공적으로 처리되었습니다.',
  ERROR: '오류가 발생했습니다.',
  CONFIRM_DELETE: '정말 삭제하시겠습니까?',
  CONFIRM_CANCEL: '변경사항이 저장되지 않습니다. 취소하시겠습니까?',

  // CRUD
  CREATE_SUCCESS: '등록이 완료되었습니다.',
  UPDATE_SUCCESS: '수정이 완료되었습니다.',
  DELETE_SUCCESS: '삭제가 완료되었습니다.',
  SAVE_SUCCESS: '저장이 완료되었습니다.',

  // Validation
  REQUIRED_FIELD: '필수 입력 항목입니다.',
  INVALID_NUMBER: '유효한 숫자를 입력하세요.',
  INVALID_DATE: '유효한 날짜를 선택하세요.',
  MIN_VALUE: (min: number) => `${min} 이상의 값을 입력하세요.`,
  MAX_VALUE: (max: number) => `${max} 이하의 값을 입력하세요.`,

  // Price Change
  PRICE_CHANGE_REGISTER_SUCCESS: '단가 변경이 등록되었습니다.',
  SELECT_PRODUCT: '완제품을 선택하세요.',
  ENTER_CHANGE_REASON: '변경 사유를 입력하세요.',

  // Settlement
  SETTLEMENT_CALCULATE_SUCCESS: '정산 계산이 완료되었습니다.',
  SETTLEMENT_SAVE_SUCCESS: '정산이 저장되었습니다.',

  // Excel
  EXCEL_IMPORT_SUCCESS: 'Excel 파일 업로드가 완료되었습니다.',
  EXCEL_EXPORT_SUCCESS: 'Excel 파일 다운로드가 완료되었습니다.',
  INVALID_EXCEL_FORMAT: '올바른 Excel 파일 형식이 아닙니다.',

  // PDF
  PDF_DOWNLOAD_SUCCESS: 'PDF 다운로드가 완료되었습니다.',
} as const;
