/**
 * BackupRestore Component
 * 백업/복원 기능
 */

import { useState } from 'react';
import { Card, Button, Upload, message, Modal, Typography, Divider, Alert } from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import styles from './BackupRestore.module.css';

const { Text, Paragraph } = Typography;

export interface BackupRestoreProps {
  className?: string;
}

export function BackupRestore({ className }: BackupRestoreProps) {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Handle backup
  const handleBackup = async () => {
    try {
      setBackupLoading(true);

      // In a real implementation, this would call the backend API
      // For now, we'll simulate a backup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a mock backup file
      const backupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          settings: true,
          materials: true,
          processes: true,
          products: true,
          bom: true,
          priceChanges: true,
          settlements: true,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('백업이 완료되었습니다');
    } catch (error) {
      message.error('백업에 실패했습니다');
      console.error('Backup error:', error);
    } finally {
      setBackupLoading(false);
    }
  };

  // Handle restore
  const handleRestore = (file: File) => {
    Modal.confirm({
      title: '데이터 복원',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Paragraph>
            <Text strong type="danger">
              경고: 현재 데이터가 백업 파일의 데이터로 대체됩니다.
            </Text>
          </Paragraph>
          <Paragraph>
            복원할 파일: <Text code>{file.name}</Text>
          </Paragraph>
          <Paragraph>계속하시겠습니까?</Paragraph>
        </div>
      ),
      okText: '복원',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          setRestoreLoading(true);

          // Read the file
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const content = e.target?.result as string;
              const backupData = JSON.parse(content);

              // Validate backup file
              if (!backupData.version || !backupData.timestamp || !backupData.data) {
                throw new Error('Invalid backup file format');
              }

              // In a real implementation, this would send data to backend
              await new Promise((resolve) => setTimeout(resolve, 1500));

              message.success('데이터가 복원되었습니다');
            } catch (parseError) {
              message.error('백업 파일 형식이 올바르지 않습니다');
            } finally {
              setRestoreLoading(false);
            }
          };
          reader.onerror = () => {
            message.error('파일 읽기에 실패했습니다');
            setRestoreLoading(false);
          };
          reader.readAsText(file);
        } catch (error) {
          message.error('복원에 실패했습니다');
          console.error('Restore error:', error);
          setRestoreLoading(false);
        }
      },
    });

    return false; // Prevent default upload
  };

  const uploadProps: UploadProps = {
    accept: '.json',
    showUploadList: false,
    beforeUpload: handleRestore,
  };

  return (
    <Card title="백업 / 복원" className={`${styles.card} ${className || ''}`}>
      <Alert
        message="백업 안내"
        description="정기적으로 데이터를 백업하여 중요한 정보를 보호하세요. 백업 파일은 안전한 곳에 보관해 주세요."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <div className={styles.section}>
        <Text strong>데이터 백업</Text>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          현재 시스템의 모든 데이터를 JSON 파일로 다운로드합니다.
        </Paragraph>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleBackup}
          loading={backupLoading}
        >
          백업 다운로드
        </Button>
      </div>

      <Divider />

      <div className={styles.section}>
        <Text strong>데이터 복원</Text>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          이전에 백업한 JSON 파일에서 데이터를 복원합니다.
        </Paragraph>
        <Upload {...uploadProps}>
          <Button
            icon={<UploadOutlined />}
            loading={restoreLoading}
            danger
          >
            백업 파일 업로드
          </Button>
        </Upload>
      </div>

      <Divider />

      <div className={styles.infoSection}>
        <Text strong>백업에 포함되는 데이터:</Text>
        <ul className={styles.dataList}>
          <li><CheckCircleOutlined className={styles.checkIcon} /> 시스템 설정</li>
          <li><CheckCircleOutlined className={styles.checkIcon} /> 자재 마스터</li>
          <li><CheckCircleOutlined className={styles.checkIcon} /> 공정 마스터</li>
          <li><CheckCircleOutlined className={styles.checkIcon} /> 완제품 마스터</li>
          <li><CheckCircleOutlined className={styles.checkIcon} /> BOM 정보</li>
          <li><CheckCircleOutlined className={styles.checkIcon} /> 단가 변경 이력</li>
          <li><CheckCircleOutlined className={styles.checkIcon} /> 정산 이력</li>
        </ul>
      </div>
    </Card>
  );
}

export default BackupRestore;
