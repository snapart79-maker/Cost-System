/**
 * MasterDataPage
 * 기초 데이터 관리 페이지 - 자재/공정/완제품/BOM 탭
 */

import { useState, useCallback } from 'react';
import { Tabs, Card } from 'antd';
import {
  AppstoreOutlined,
  ToolOutlined,
  InboxOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@/presentation/components/common';
import { MaterialTab } from './MaterialTab';
import { ProcessTab } from './ProcessTab';
import { ProductTab } from './ProductTab';
import { BomTab } from './BomTab';
import styles from './MasterDataPage.module.css';

type TabKey = 'materials' | 'processes' | 'products' | 'bom';

const TAB_ITEMS = [
  {
    key: 'materials' as TabKey,
    label: '자재',
    icon: <AppstoreOutlined />,
    children: <MaterialTab />,
  },
  {
    key: 'processes' as TabKey,
    label: '공정',
    icon: <ToolOutlined />,
    children: <ProcessTab />,
  },
  {
    key: 'products' as TabKey,
    label: '완제품',
    icon: <InboxOutlined />,
    children: <ProductTab />,
  },
  {
    key: 'bom' as TabKey,
    label: 'BOM',
    icon: <PartitionOutlined />,
    children: <BomTab />,
  },
];

export function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('materials');

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as TabKey);
  }, []);

  return (
    <div className={styles.container}>
      <PageHeader
        title="기초 데이터 관리"
        subtitle="자재, 공정, 완제품, BOM 데이터를 관리합니다"
        breadcrumbs={[{ label: '기초 데이터 관리' }]}
      />

      <Card className={styles.tabCard}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={TAB_ITEMS.map((item) => ({
            key: item.key,
            label: (
              <span>
                {item.icon}
                {item.label}
              </span>
            ),
            children: item.children,
          }))}
          size="large"
          className={styles.tabs}
        />
      </Card>
    </div>
  );
}

export default MasterDataPage;
