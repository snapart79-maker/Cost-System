import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/presentation/layouts';
import { ROUTES } from '@/shared/constants/routes';
import {
  DashboardPage,
  PriceChangeRegisterPage,
  CostSheetPage,
  SettlementPage,
  SettlementHistoryPage,
  MasterDataPage,
  ChangeHistoryPage,
  SettingsPage,
} from '@/presentation/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.PRICE_CHANGE_REGISTER,
        element: <PriceChangeRegisterPage />,
      },
      {
        path: ROUTES.COST_SHEET,
        element: <CostSheetPage />,
      },
      {
        path: ROUTES.SETTLEMENT,
        element: <SettlementPage />,
      },
      {
        path: ROUTES.SETTLEMENT_HISTORY,
        element: <SettlementHistoryPage />,
      },
      {
        path: ROUTES.MASTER_MATERIAL,
        element: <MasterDataPage />,
      },
      {
        path: ROUTES.MASTER_PROCESS,
        element: <MasterDataPage />,
      },
      {
        path: ROUTES.MASTER_PRODUCT,
        element: <MasterDataPage />,
      },
      {
        path: ROUTES.MASTER_BOM,
        element: <MasterDataPage />,
      },
      {
        path: ROUTES.CHANGE_HISTORY,
        element: <ChangeHistoryPage />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <SettingsPage />,
      },
    ],
  },
]);

export default router;
