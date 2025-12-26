/**
 * Confirm Modal Helper Functions
 * 확인 모달 헬퍼 함수
 */

import { Modal } from 'antd';
import type { ConfirmModalType } from './ConfirmModal';

export interface ConfirmOptions {
  title: string;
  content?: string;
  onOk: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  type?: ConfirmModalType;
  centered?: boolean;
  okButtonProps?: {
    danger?: boolean;
    loading?: boolean;
    disabled?: boolean;
  };
}

export const confirm = (props: ConfirmOptions) => {
  return Modal.confirm({
    title: props.title,
    content: props.content,
    onOk: props.onOk,
    onCancel: props.onCancel,
    okText: props.okText || '확인',
    cancelText: props.cancelText || '취소',
    centered: props.centered ?? true,
    okButtonProps: props.okButtonProps,
  });
};

export const confirmDelete = (props: {
  title?: string;
  content?: string;
  onOk: () => void;
  onCancel?: () => void;
}) => {
  return Modal.confirm({
    title: props.title || '삭제 확인',
    content: props.content || '정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    onOk: props.onOk,
    onCancel: props.onCancel,
    okText: '삭제',
    cancelText: '취소',
    okButtonProps: { danger: true },
    centered: true,
  });
};
