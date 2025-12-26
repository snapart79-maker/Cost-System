import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  DollarOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { MENU_ITEMS } from '@/shared/constants/menu';

const { Sider } = Layout;

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  DollarOutlined: <DollarOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  HistoryOutlined: <HistoryOutlined />,
  SettingOutlined: <SettingOutlined />,
};

// Convert menu items to Ant Design format
const convertMenuItems = (items: typeof MENU_ITEMS): MenuProps['items'] => {
  return items.map((item) => ({
    key: item.key,
    icon: item.icon ? iconMap[item.icon] : undefined,
    label: item.label,
    children: item.children
      ? item.children.map((child) => ({
          key: child.key,
          label: child.label,
        }))
      : undefined,
  }));
};

// Find path by menu key
const findPathByKey = (key: string): string | undefined => {
  for (const item of MENU_ITEMS) {
    if (item.key === key && item.path) {
      return item.path;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.key === key && child.path) {
          return child.path;
        }
      }
    }
  }
  return undefined;
};

// Find key by path
const findKeyByPath = (path: string): string[] => {
  const keys: string[] = [];
  for (const item of MENU_ITEMS) {
    if (item.path === path) {
      keys.push(item.key);
      return keys;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.path === path) {
          keys.push(child.key);
          return keys;
        }
      }
    }
  }
  return keys;
};

// Find open keys by path
const findOpenKeysByPath = (path: string): string[] => {
  for (const item of MENU_ITEMS) {
    if (item.children) {
      for (const child of item.children) {
        if (child.path === path) {
          return [item.key];
        }
      }
    }
  }
  return [];
};

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = findKeyByPath(location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>(
    findOpenKeysByPath(location.pathname)
  );

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const path = findPathByKey(key);
    if (path) {
      navigate(path);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
      role="navigation"
      aria-label="메인 네비게이션"
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: collapsed ? 14 : 16,
        }}
        role="banner"
        aria-label="와이어 하네스 매입 단가 관리 시스템"
      >
        {collapsed ? 'WH' : 'WH-PMS'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick}
        items={convertMenuItems(MENU_ITEMS)}
        aria-label="메뉴"
      />
    </Sider>
  );
};

export default Sidebar;
