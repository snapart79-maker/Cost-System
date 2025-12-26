/**
 * QuickActions Component
 * 빠른 이동 버튼
 */

import { Card, Row, Col, Button } from 'antd';
import {
  PlusOutlined,
  FileSearchOutlined,
  CalculatorOutlined,
  HistoryOutlined,
  SettingOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './QuickActions.module.css';

export interface QuickActionsProps {
  className?: string;
}

interface ActionItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const ACTIONS: ActionItem[] = [
  {
    key: 'price-change',
    title: '단가 변경 등록',
    icon: <PlusOutlined />,
    path: '/price-change',
    color: '#1890ff',
  },
  {
    key: 'cost-sheet',
    title: '원가 계산서',
    icon: <FileSearchOutlined />,
    path: '/cost-sheet',
    color: '#52c41a',
  },
  {
    key: 'settlement',
    title: '정산 관리',
    icon: <CalculatorOutlined />,
    path: '/settlement',
    color: '#fa8c16',
  },
  {
    key: 'history',
    title: '변경 이력',
    icon: <HistoryOutlined />,
    path: '/history',
    color: '#722ed1',
  },
  {
    key: 'master-data',
    title: '기초 데이터',
    icon: <DatabaseOutlined />,
    path: '/master-data',
    color: '#13c2c2',
  },
  {
    key: 'settings',
    title: '설정',
    icon: <SettingOutlined />,
    path: '/settings',
    color: '#8c8c8c',
  },
];

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };

  return (
    <Card title="빠른 이동" className={`${styles.card} ${className || ''}`}>
      <Row gutter={[16, 16]}>
        {ACTIONS.map((action) => (
          <Col xs={12} sm={8} md={4} key={action.key}>
            <Button
              className={styles.actionButton}
              onClick={() => handleClick(action.path)}
              block
            >
              <div className={styles.actionContent}>
                <span
                  className={styles.actionIcon}
                  style={{ color: action.color }}
                >
                  {action.icon}
                </span>
                <span className={styles.actionTitle}>{action.title}</span>
              </div>
            </Button>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default QuickActions;
