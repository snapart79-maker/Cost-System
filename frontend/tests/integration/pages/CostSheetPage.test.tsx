/**
 * CostSheetPage Integration Tests
 * 원가 계산서 페이지 통합 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { CostSheetPage } from '@/presentation/pages/cost-sheet/CostSheetPage';

// Create a wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Create a wrapper with initial product selection
const createWrapperWithProduct = (productId: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/cost-sheet?product=${productId}`]}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CostSheetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('heading', { name: '원가 계산서' })).toBeInTheDocument();
    });

    it('should render product selector', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      expect(screen.getByText('완제품 선택')).toBeInTheDocument();
    });

    it('should render work type filter', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('radio', { name: '전체' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '내작' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: '외작' })).toBeInTheDocument();
    });

    it('should show empty state when no product selected', () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/원가 계산서를 조회할 수 있습니다/)).toBeInTheDocument();
    });
  });

  describe('Product Selection', () => {
    it('should load products in dropdown', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('should display cost breakdown when product is selected via URL', async () => {
      render(<CostSheetPage />, { wrapper: createWrapperWithProduct('1') });

      // Wait for cost data to load
      await waitFor(() => {
        expect(screen.getByText('원가 요약')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Cost Summary Section (with product selected)', () => {
    it('should display cost summary when product is selected', async () => {
      render(<CostSheetPage />, { wrapper: createWrapperWithProduct('1') });

      // Wait for cost breakdown to load - first check for loading to finish
      await waitFor(() => {
        // Check for either cost summary or loading state
        const hasContent = screen.queryByText('원가 요약') || screen.queryByText('구매원가');
        expect(hasContent).toBeTruthy();
      }, { timeout: 10000 });
    });

    it('should show cost categories in summary table', async () => {
      render(<CostSheetPage />, { wrapper: createWrapperWithProduct('1') });

      // Wait for the cost summary to render
      await waitFor(() => {
        expect(screen.getByText('원가 요약')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Check that cost summary table exists with key cost categories
      // Use getAllByText since some labels may appear multiple times (summary table + tab labels)
      expect(screen.getAllByText('재료비').length).toBeGreaterThan(0);
      expect(screen.getAllByText('노무비').length).toBeGreaterThan(0);
      expect(screen.getAllByText('경비').length).toBeGreaterThan(0);
      expect(screen.getByText('제조원가')).toBeInTheDocument();
      expect(screen.getByText('구매원가')).toBeInTheDocument();
    });
  });

  describe('Work Type Filter', () => {
    it('should filter by work type when selected', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      // Find the "내작" radio button (use label click for Ant Design Radio.Button)
      const inhouseLabel = screen.getByText('내작');
      inhouseLabel.click();

      await waitFor(() => {
        const inhouseRadio = screen.getByRole('radio', { name: '내작' });
        expect(inhouseRadio).toBeChecked();
      });
    });

    it('should filter by outsource when selected', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      // Find the "외작" radio button (use label click for Ant Design Radio.Button)
      const outsourceLabel = screen.getByText('외작');
      outsourceLabel.click();

      await waitFor(() => {
        const outsourceRadio = screen.getByRole('radio', { name: '외작' });
        expect(outsourceRadio).toBeChecked();
      });
    });
  });

  describe('Tab Navigation (with product selected)', () => {
    it('should render material cost tab', async () => {
      render(<CostSheetPage />, { wrapper: createWrapperWithProduct('1') });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /재료비 상세/ })).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should render process cost tab', async () => {
      render(<CostSheetPage />, { wrapper: createWrapperWithProduct('1') });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /가공비 상세/ })).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should switch to process cost tab when clicked', async () => {
      const user = userEvent.setup();
      render(<CostSheetPage />, { wrapper: createWrapperWithProduct('1') });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /가공비 상세/ })).toBeInTheDocument();
      }, { timeout: 5000 });

      const processTab = screen.getByRole('tab', { name: /가공비 상세/ });
      await user.click(processTab);

      expect(processTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Export Options', () => {
    it('should render PDF download button', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /PDF/ })).toBeInTheDocument();
    });

    it('should render Excel download button', async () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /Excel/ })).toBeInTheDocument();
    });

    it('should disable export buttons when no product selected', () => {
      render(<CostSheetPage />, { wrapper: createWrapper() });

      const pdfButton = screen.getByRole('button', { name: /PDF/ });
      const excelButton = screen.getByRole('button', { name: /Excel/ });

      expect(pdfButton).toBeDisabled();
      expect(excelButton).toBeDisabled();
    });
  });
});
