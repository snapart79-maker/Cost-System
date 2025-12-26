/**
 * ErrorBoundary Component
 * React 에러 경계 컴포넌트
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './CommonComponents.module.css';

const { Text, Paragraph } = Typography;

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    const { children, fallback, showDetails = false } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className={styles.errorContainer}>
          <Result
            status="error"
            title="오류가 발생했습니다"
            subTitle="페이지를 로드하는 중 문제가 발생했습니다. 다시 시도해 주세요."
            extra={[
              <Button
                key="retry"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleRetry}
              >
                다시 시도
              </Button>,
              <Button
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                페이지 새로고침
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
              >
                홈으로 이동
              </Button>,
            ]}
          >
            {showDetails && error && (
              <div className={styles.errorDetails}>
                <Paragraph>
                  <Text strong>에러 메시지:</Text>
                </Paragraph>
                <Paragraph>
                  <Text code>{error.message}</Text>
                </Paragraph>
                {import.meta.env.DEV && errorInfo && (
                  <>
                    <Paragraph>
                      <Text strong>컴포넌트 스택:</Text>
                    </Paragraph>
                    <pre className={styles.stackTrace}>
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </Result>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
