/**
 * RecentChanges Component
 * 최근 변경 이력
 */

import { Card, List, Tag, Typography, Empty, Skeleton } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { PriceChange } from '@/domain/entities/price-change';
import styles from './RecentChanges.module.css';

const { Text } = Typography;

export interface RecentChangesProps {
  data?: PriceChange[];
  loading?: boolean;
  maxItems?: number;
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  MATERIAL: 'blue',
  PROCESS: 'green',
  COMBINED: 'purple',
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  MATERIAL: '자재',
  PROCESS: '공정',
  COMBINED: '복합',
};

export function RecentChanges({
  data,
  loading = false,
  maxItems = 5,
}: RecentChangesProps) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/history');
  };

  const displayData = data?.slice(0, maxItems) || [];

  return (
    <Card
      title="최근 변경 이력"
      className={styles.card}
      extra={
        <a onClick={handleViewAll} className={styles.viewAll}>
          전체 보기 <RightOutlined />
        </a>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : displayData.length === 0 ? (
        <Empty
          description="변경 이력이 없습니다"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={displayData}
          renderItem={(item) => (
            <List.Item className={styles.listItem}>
              <List.Item.Meta
                title={
                  <div className={styles.itemTitle}>
                    <Tag color={CHANGE_TYPE_COLORS[item.change_type] || 'default'}>
                      {CHANGE_TYPE_LABELS[item.change_type] || item.change_type}
                    </Tag>
                    <span>{item.product?.name || item.product_id}</span>
                  </div>
                }
                description={
                  <div className={styles.itemDesc}>
                    <Text type="secondary">{item.change_reason}</Text>
                    <Text type="secondary" className={styles.date}>
                      {item.effective_date}
                    </Text>
                  </div>
                }
              />
              <div className={styles.costDiff}>
                <Text type={item.cost_diff >= 0 ? 'danger' : 'success'}>
                  {item.cost_diff >= 0 ? '+' : ''}
                  {item.cost_diff?.toLocaleString()}원
                </Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}

export default RecentChanges;
