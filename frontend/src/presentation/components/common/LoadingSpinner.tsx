/**
 * LoadingSpinner Component
 * 로딩 스피너 컴포넌트
 */

import { memo } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styles from './CommonComponents.module.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
  delay?: number;
  className?: string;
}

export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'default',
  tip,
  fullScreen = false,
  delay = 0,
  className,
}: LoadingSpinnerProps) {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: size === 'small' ? 24 : size === 'large' ? 48 : 32,
      }}
      spin
    />
  );

  const spinner = (
    <Spin
      indicator={antIcon}
      tip={tip}
      delay={delay}
      className={className}
    />
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreenLoader}>
        {spinner}
      </div>
    );
  }

  return (
    <div className={styles.spinnerContainer}>
      {spinner}
    </div>
  );
});

export default LoadingSpinner;
