import { Layout, Typography, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { env } from '@/shared/config/env';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ collapsed }) => {
  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: collapsed ? 80 : 200,
        transition: 'margin-left 0.2s',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        {env.APP_NAME}
      </Typography.Title>
      <Space>
        <UserOutlined />
        <Text>사용자</Text>
      </Space>
    </AntHeader>
  );
};

export default Header;
