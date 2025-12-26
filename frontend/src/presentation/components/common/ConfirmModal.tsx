/**
 * ConfirmModal Component
 * 확인 모달 컴포넌트
 */

import { Modal, Typography, Space } from 'antd';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import styles from './CommonComponents.module.css';

const { Text } = Typography;

export type ConfirmModalType = 'confirm' | 'success' | 'info' | 'warning' | 'error';

export interface ConfirmModalProps {
  open: boolean;
  type?: ConfirmModalType;
  title: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  onOk: () => void;
  onCancel: () => void;
  okButtonProps?: {
    danger?: boolean;
    loading?: boolean;
    disabled?: boolean;
  };
  closable?: boolean;
  centered?: boolean;
}

const iconMap = {
  confirm: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
  warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
  error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

export function ConfirmModal({
  open,
  type = 'confirm',
  title,
  content,
  okText = '확인',
  cancelText = '취소',
  onOk,
  onCancel,
  okButtonProps,
  closable = true,
  centered = true,
}: ConfirmModalProps) {
  const icon = iconMap[type];

  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={okButtonProps}
      closable={closable}
      centered={centered}
      className={styles.confirmModal}
      width={416}
    >
      <div className={styles.confirmContent}>
        <Space align="start" size={12}>
          <span className={styles.confirmIcon}>{icon}</span>
          <div>
            <div className={styles.confirmTitle}>{title}</div>
            {content && (
              <Text type="secondary" className={styles.confirmDescription}>
                {content}
              </Text>
            )}
          </div>
        </Space>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
