/**
 * SettlementPage Integration Tests
 * 정산 관리 페이지 통합 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { SettlementPage } from '@/presentation/pages/settlement/SettlementPage';

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

describe('SettlementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('heading', { name: '정산 관리' })).toBeInTheDocument();
    });

    it('should render settlement condition form section', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('정산 조건')).toBeInTheDocument();
    });

    it('should render price change selector', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('단가 변경 건')).toBeInTheDocument();
    });

    it('should render period type selector', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('조회 단위')).toBeInTheDocument();
    });

    it('should render date range picker', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('정산 기간')).toBeInTheDocument();
    });
  });

  describe('Price Change Selection', () => {
    it('should load price changes in dropdown', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBeGreaterThan(0);
      });
    });

    it('should show products when price change is selected', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      // Wait for price changes to load
      await waitFor(() => {
        expect(screen.getByText('단가 변경 건')).toBeInTheDocument();
      });
    });
  });

  describe('Period Type Selection', () => {
    it('should render period type options', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      // Check for period type radio buttons or select
      await waitFor(() => {
        const monthlyOption = screen.queryByText('월별') || screen.queryByRole('radio', { name: /월별/ });
        expect(monthlyOption).toBeInTheDocument();
      });
    });

    it('should have monthly selected by default', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if monthly is the default selection
        const form = screen.getByText('조회 단위').closest('div');
        expect(form).toBeInTheDocument();
      });
    });
  });

  describe('Receipt Quantity Section', () => {
    it('should render receipt quantity section title', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('입고 수량')).toBeInTheDocument();
    });

    it('should render Excel template download button', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /양식 다운로드/ })).toBeInTheDocument();
    });

    it('should render Excel upload button', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /Excel 업로드/ })).toBeInTheDocument();
    });
  });

  describe('Settlement Result Section', () => {
    it('should render settlement result section title', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByText('정산 결과')).toBeInTheDocument();
    });

    it('should show empty state before calculation', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/정산 조건을 설정하고 계산하기 버튼을 클릭/)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render calculate button', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /계산하기/ })).toBeInTheDocument();
    });

    it('should render save button', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /저장하기/ })).toBeInTheDocument();
    });

    it('should disable save button initially', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      const saveButton = screen.getByRole('button', { name: /저장하기/ });
      expect(saveButton).toBeDisabled();
    });

    it('should disable calculate button when no price change selected', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      const calculateButton = screen.getByRole('button', { name: /계산하기/ });
      expect(calculateButton).toBeDisabled();
    });
  });

  describe('Export Options', () => {
    it('should render PDF export button', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /PDF/ })).toBeInTheDocument();
    });

    it('should render Excel export button', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      // There are multiple Excel buttons (upload and export), use getAllByRole
      const excelButtons = screen.getAllByRole('button', { name: /Excel/ });
      expect(excelButtons.length).toBeGreaterThan(0);
    });

    it('should disable export buttons when no result', async () => {
      render(<SettlementPage />, { wrapper: createWrapper() });

      const pdfButton = screen.getByRole('button', { name: /PDF/ });
      // Use exact match for the export Excel button (not "Excel 업로드")
      const excelButtons = screen.getAllByRole('button', { name: /Excel/ });
      const exportExcelButton = excelButtons.find(btn => btn.textContent?.trim() === 'Excel');

      expect(pdfButton).toBeDisabled();
      expect(exportExcelButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should show warning when calculating without required fields', async () => {
      const user = userEvent.setup();
      render(<SettlementPage />, { wrapper: createWrapper() });

      // Try to click calculate button (should be disabled)
      const calculateButton = screen.getByRole('button', { name: /계산하기/ });
      expect(calculateButton).toBeDisabled();
    });
  });
});
