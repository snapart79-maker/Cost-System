/**
 * PageHeader Component
 * 페이지 상단 헤더 컴포넌트
 */

import { ReactNode, memo } from 'react';
import { Typography, Breadcrumb, Space, Button } from 'antd';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import styles from './CommonComponents.module.css';

const { Title, Text } = Typography;

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageHeaderAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  type?: 'default' | 'primary' | 'link' | 'text' | 'dashed';
  danger?: boolean;
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageHeaderAction[];
  showBack?: boolean;
  onBack?: () => void;
  extra?: ReactNode;
  className?: string;
}

export const PageHeader = memo(function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  showBack = false,
  onBack,
  extra,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`${styles.pageHeader} ${className || ''}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className={styles.breadcrumb}>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          {breadcrumbs.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {item.path ? (
                <Link to={item.path}>{item.label}</Link>
              ) : (
                item.label
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      {/* Header Content */}
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className={styles.backButton}
              aria-label="뒤로 가기"
            />
          )}
          <div>
            <Title level={3} className={styles.title}>
              {title}
            </Title>
            {subtitle && (
              <Text type="secondary" className={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </div>
        </div>

        <div className={styles.actionSection}>
          {extra}
          {actions && actions.length > 0 && (
            <Space size="small">
              {actions.map((action) => (
                <Button
                  key={action.key}
                  type={action.type || 'default'}
                  icon={action.icon}
                  onClick={action.onClick}
                  danger={action.danger}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </Space>
          )}
        </div>
      </div>
    </div>
  );
});

export default PageHeader;
