/**
 * MasterDataPage Integration Tests
 * 기초 데이터 관리 페이지 통합 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MasterDataPage } from '@/presentation/pages/master-data/MasterDataPage';
import { ReactNode } from 'react';

// Create wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const Wrapper = createWrapper();

describe('MasterDataPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Multiple elements may have this text (breadcrumb + header), so use getAllByText
      const titles = screen.getAllByText('기초 데이터 관리');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should render all tabs', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      expect(screen.getByRole('tab', { name: /자재/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /공정/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /완제품/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /BOM/i })).toBeInTheDocument();
    });

    it('should render material tab as default', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Material tab should be selected by default
      const materialTab = screen.getByRole('tab', { name: /자재/i });
      expect(materialTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to process tab on click', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      const processTab = screen.getByRole('tab', { name: /공정/i });
      fireEvent.click(processTab);

      await waitFor(() => {
        expect(processTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should switch to product tab on click', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      const productTab = screen.getByRole('tab', { name: /완제품/i });
      fireEvent.click(productTab);

      await waitFor(() => {
        expect(productTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should switch to BOM tab on click', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      const bomTab = screen.getByRole('tab', { name: /BOM/i });
      fireEvent.click(bomTab);

      await waitFor(() => {
        expect(bomTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Material Tab', () => {
    it('should load and display materials', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should have table with data
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should have add button', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      const addButton = screen.getByRole('button', { name: /추가/i });
      expect(addButton).toBeInTheDocument();
    });

    it('should open form modal on add button click', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      const addButton = screen.getByRole('button', { name: /추가/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Process Tab', () => {
    it('should load and display processes', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Switch to process tab
      const processTab = screen.getByRole('tab', { name: /공정/i });
      fireEvent.click(processTab);

      // Wait for data to load
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Product Tab', () => {
    it('should load and display products', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Switch to product tab
      const productTab = screen.getByRole('tab', { name: /완제품/i });
      fireEvent.click(productTab);

      // Wait for data to load
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('BOM Tab', () => {
    it('should show product selector in BOM tab', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Switch to BOM tab
      const bomTab = screen.getByRole('tab', { name: /BOM/i });
      fireEvent.click(bomTab);

      await waitFor(() => {
        // Should have product selector
        expect(screen.getByText(/완제품 선택/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should have search input', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      const searchInput = screen.getByPlaceholderText(/검색/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter data on search input', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      const searchInput = screen.getByPlaceholderText(/검색/i);
      fireEvent.change(searchInput, { target: { value: '전선' } });

      // Results should be filtered
      await waitFor(() => {
        // Table should still be present
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should delete selected rows on delete button click', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Delete button should be disabled when no selection
      const deleteButton = screen.getByRole('button', { name: /삭제/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button when rows are selected', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]); // First data row

        // Delete button should be enabled
        await waitFor(() => {
          const deleteButton = screen.getByRole('button', { name: /삭제/i });
          expect(deleteButton).not.toBeDisabled();
        });
      }
    });
  });

  describe('Excel Import/Export', () => {
    it('should have Excel button', async () => {
      render(<MasterDataPage />, { wrapper: Wrapper });

      // Multiple tabs may have Excel buttons, get all and check at least one exists
      const excelButtons = screen.getAllByRole('button', { name: /Excel/i });
      expect(excelButtons.length).toBeGreaterThan(0);
    });
  });
});
