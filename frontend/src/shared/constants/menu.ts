import { ROUTES } from './routes';

export interface MenuItem {
  key: string;
  icon?: string;
  label: string;
  path?: string;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    key: 'dashboard',
    icon: 'DashboardOutlined',
    label: '대시보드',
    path: ROUTES.DASHBOARD,
  },
  {
    key: 'price-management',
    icon: 'DollarOutlined',
    label: '단가 관리',
    children: [
      {
        key: 'price-register',
        label: '변경 등록',
        path: ROUTES.PRICE_CHANGE_REGISTER,
      },
      { key: 'cost-sheet', label: '원가 계산서', path: ROUTES.COST_SHEET },
      { key: 'settlement', label: '정산 관리', path: ROUTES.SETTLEMENT },
    ],
  },
  {
    key: 'master-data',
    icon: 'DatabaseOutlined',
    label: '기초 데이터',
    children: [
      { key: 'material', label: '자재', path: ROUTES.MASTER_MATERIAL },
      { key: 'process', label: '공정', path: ROUTES.MASTER_PROCESS },
      { key: 'product', label: '완제품', path: ROUTES.MASTER_PRODUCT },
      { key: 'bom', label: 'BOM', path: ROUTES.MASTER_BOM },
    ],
  },
  {
    key: 'history',
    icon: 'HistoryOutlined',
    label: '이력 조회',
    children: [
      { key: 'change-history', label: '변경 이력', path: ROUTES.CHANGE_HISTORY },
      {
        key: 'settlement-history',
        label: '정산 이력',
        path: ROUTES.SETTLEMENT_HISTORY,
      },
    ],
  },
  {
    key: 'settings',
    icon: 'SettingOutlined',
    label: '설정',
    path: ROUTES.SETTINGS,
  },
];
