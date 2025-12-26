// Route paths
export const ROUTES = {
  DASHBOARD: '/',

  // 단가 관리
  PRICE_CHANGE: '/price-change',
  PRICE_CHANGE_REGISTER: '/price-change/register',
  COST_SHEET: '/cost-sheet',
  SETTLEMENT: '/settlement',
  SETTLEMENT_HISTORY: '/settlement/history',

  // 기초 데이터
  MASTER_DATA: '/master-data',
  MASTER_MATERIAL: '/master-data/material',
  MASTER_PROCESS: '/master-data/process',
  MASTER_PRODUCT: '/master-data/product',
  MASTER_BOM: '/master-data/bom',

  // 이력
  CHANGE_HISTORY: '/history/changes',

  // 설정
  SETTINGS: '/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
