/**
 * PriceChangeRegisterPage Integration Test
 * 단가 변경 등록 페이지 통합 테스트 - TDD RED Phase
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PriceChangeRegisterPage } from '@/presentation/pages/price-change/PriceChangeRegisterPage';

// Create wrapper with QueryClient and Router
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  return Wrapper;
};

describe('PriceChangeRegisterPage', () => {
  describe('Rendering - 렌더링', () => {
    it('should render page title', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/단가 변경 등록/i)).toBeInTheDocument();
    });

    it('should render product selector section', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/완제품 선택/i)).toBeInTheDocument();
    });

    it('should render change info form section', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/변경 정보/i)).toBeInTheDocument();
    });

    it('should render change items section', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/변경 항목/i)).toBeInTheDocument();
    });

    it('should render cost preview section', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/원가 미리보기/i)).toBeInTheDocument();
    });
  });

  describe('Product Selection - 완제품 선택', () => {
    it('should show product dropdown', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      expect(productSelector).toBeInTheDocument();
    });

    it('should load BOM data when product is selected', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Open product dropdown
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      // Select first product
      await waitFor(() => {
        const option = screen.getByText(/WH-001/i);
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText(/WH-001/i);
      await user.click(option);

      // Wait for BOM data to load
      await waitFor(() => {
        expect(screen.getByText(/자재 항목/i)).toBeInTheDocument();
      });
    });

    it('should display product info after selection', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });

      const option = screen.getByText(/WH-001/i);
      await user.click(option);

      await waitFor(() => {
        expect(screen.getByText(/현대자동차/i)).toBeInTheDocument();
      });
    });
  });

  describe('Change Info Form - 변경 정보 입력', () => {
    it('should have effective date input', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/적용일/i)).toBeInTheDocument();
    });

    it('should have ECO number input', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/ECO 번호/i)).toBeInTheDocument();
    });

    it('should have change reason textarea', async () => {
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/변경 사유/i)).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /저장/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/필수 항목입니다/i)).toBeInTheDocument();
      });
    });
  });

  describe('Material Change Table - 자재 변경 테이블', () => {
    it('should show material change table after product selection', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product first
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/WH-001/i));

      // Material change table should appear
      await waitFor(() => {
        const table = screen.getByTestId('material-change-table');
        expect(table).toBeInTheDocument();
      });
    });

    it('should allow inline editing of quantity', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      // Wait for table to load
      await waitFor(() => {
        expect(screen.getByTestId('material-change-table')).toBeInTheDocument();
      });

      // Click on quantity cell to edit
      const quantityCell = screen.getAllByTestId('editable-quantity')[0];
      await user.click(quantityCell);

      // Input should appear
      const input = within(quantityCell).getByRole('spinbutton');
      expect(input).toBeInTheDocument();

      // Change value
      await user.clear(input);
      await user.type(input, '2.5');
      await user.keyboard('{Enter}');

      // Value should be updated
      await waitFor(() => {
        expect(screen.getByText('2.5')).toBeInTheDocument();
      });
    });

    it('should allow inline editing of unit price', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByTestId('material-change-table')).toBeInTheDocument();
      });

      // Click on unit price cell to edit
      const unitPriceCell = screen.getAllByTestId('editable-unit-price')[0];
      await user.click(unitPriceCell);

      const input = within(unitPriceCell).getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '75.50');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('75.50')).toBeInTheDocument();
      });
    });

    it('should show row status indicator', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByTestId('material-change-table')).toBeInTheDocument();
      });

      // Edit a cell
      const quantityCell = screen.getAllByTestId('editable-quantity')[0];
      await user.click(quantityCell);
      const input = within(quantityCell).getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '3.0');
      await user.keyboard('{Enter}');

      // Should show modified indicator
      await waitFor(() => {
        expect(screen.getByText(/수정됨/i)).toBeInTheDocument();
      });
    });

    it('should allow adding new material row', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByTestId('material-change-table')).toBeInTheDocument();
      });

      // Click add button
      const addButton = screen.getByRole('button', { name: /자재 추가/i });
      await user.click(addButton);

      // New row should appear with NEW status
      await waitFor(() => {
        expect(screen.getByText(/신규/i)).toBeInTheDocument();
      });
    });

    it('should allow deleting material row', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByTestId('material-change-table')).toBeInTheDocument();
      });

      // Click delete button on first row
      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
      await user.click(deleteButtons[0]);

      // Should show deleted indicator
      await waitFor(() => {
        expect(screen.getByText(/삭제예정/i)).toBeInTheDocument();
      });
    });
  });

  describe('Process Change Table - 공정 변경 테이블', () => {
    it('should show process change table after product selection', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByTestId('process-change-table')).toBeInTheDocument();
      });
    });

    it('should allow editing cycle time', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByTestId('process-change-table')).toBeInTheDocument();
      });

      const cycleTimeCell = screen.getAllByTestId('editable-cycle-time')[0];
      await user.click(cycleTimeCell);

      const input = within(cycleTimeCell).getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '2.5');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('2.5')).toBeInTheDocument();
      });
    });
  });

  describe('Cost Preview - 원가 미리보기', () => {
    it('should update cost preview when data changes', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByTestId('cost-preview')).toBeInTheDocument();
      });

      // Edit a material
      const quantityCell = screen.getAllByTestId('editable-quantity')[0];
      await user.click(quantityCell);
      const input = within(quantityCell).getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '5.0');
      await user.keyboard('{Enter}');

      // Cost preview should update
      await waitFor(() => {
        const preview = screen.getByTestId('cost-preview');
        expect(within(preview).getByText(/변경 후/i)).toBeInTheDocument();
      });
    });

    it('should show before/after cost comparison', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        const preview = screen.getByTestId('cost-preview');
        expect(within(preview).getByText(/변경 전/i)).toBeInTheDocument();
        expect(within(preview).getByText(/변경 후/i)).toBeInTheDocument();
        expect(within(preview).getByText(/차이/i)).toBeInTheDocument();
      });
    });

    it('should display cost breakdown details', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        const preview = screen.getByTestId('cost-preview');
        expect(within(preview).getByText(/재료비/i)).toBeInTheDocument();
        expect(within(preview).getByText(/노무비/i)).toBeInTheDocument();
        expect(within(preview).getByText(/제조원가/i)).toBeInTheDocument();
        expect(within(preview).getByText(/구매원가/i)).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Edit - 일괄 수정', () => {
    it('should open bulk edit modal', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /일괄 수정/i })).toBeInTheDocument();
      });

      const bulkEditButton = screen.getByRole('button', { name: /일괄 수정/i });
      await user.click(bulkEditButton);

      await waitFor(() => {
        expect(screen.getByText(/Excel 업로드/i)).toBeInTheDocument();
      });
    });

    it('should have Excel template download option', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      const bulkEditButton = screen.getByRole('button', { name: /일괄 수정/i });
      await user.click(bulkEditButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /양식 다운로드/i })).toBeInTheDocument();
      });
    });
  });

  describe('Submit - 저장', () => {
    it('should validate all required fields before submit', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /저장/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Should show validation errors
        expect(screen.getAllByText(/필수/i).length).toBeGreaterThan(0);
      });
    });

    it('should submit successfully with valid data', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      // Fill required fields
      await waitFor(() => {
        expect(screen.getByLabelText(/적용일/i)).toBeInTheDocument();
      });

      const effectiveDateInput = screen.getByLabelText(/적용일/i);
      await user.click(effectiveDateInput);
      await user.type(effectiveDateInput, '2025-04-01');

      const changeReasonInput = screen.getByLabelText(/변경 사유/i);
      await user.type(changeReasonInput, '원자재 가격 인상으로 인한 단가 변경');

      // Edit at least one material
      const quantityCell = screen.getAllByTestId('editable-quantity')[0];
      await user.click(quantityCell);
      const input = within(quantityCell).getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '2.0');
      await user.keyboard('{Enter}');

      // Submit
      const submitButton = screen.getByRole('button', { name: /저장/i });
      await user.click(submitButton);

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/저장되었습니다/i)).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog before submit', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Select product and fill form
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/적용일/i)).toBeInTheDocument();
      });

      const effectiveDateInput = screen.getByLabelText(/적용일/i);
      await user.type(effectiveDateInput, '2025-04-01');

      const changeReasonInput = screen.getByLabelText(/변경 사유/i);
      await user.type(changeReasonInput, '테스트 변경 사유');

      // Submit
      const submitButton = screen.getByRole('button', { name: /저장/i });
      await user.click(submitButton);

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/등록하시겠습니까/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation - 네비게이션', () => {
    it('should navigate to cost sheet page after successful submit', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      // Complete the form submission flow...
      const productSelector = screen.getByRole('combobox', { name: /완제품/i });
      await user.click(productSelector);

      await waitFor(() => {
        expect(screen.getByText(/WH-001/i)).toBeInTheDocument();
      });
      await user.click(screen.getByText(/WH-001/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/적용일/i)).toBeInTheDocument();
      });

      const effectiveDateInput = screen.getByLabelText(/적용일/i);
      await user.type(effectiveDateInput, '2025-04-01');

      const changeReasonInput = screen.getByLabelText(/변경 사유/i);
      await user.type(changeReasonInput, '테스트');

      // Edit a material
      const quantityCell = screen.getAllByTestId('editable-quantity')[0];
      await user.click(quantityCell);
      const input = within(quantityCell).getByRole('spinbutton');
      await user.clear(input);
      await user.type(input, '2.0');
      await user.keyboard('{Enter}');

      const submitButton = screen.getByRole('button', { name: /저장/i });
      await user.click(submitButton);

      // Confirm dialog
      await waitFor(() => {
        expect(screen.getByText(/등록하시겠습니까/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /확인/i });
      await user.click(confirmButton);

      // Should navigate (check for route change or success state)
      await waitFor(
        () => {
          expect(
            screen.getByText(/저장되었습니다/i) ||
            window.location.pathname.includes('cost-sheet')
          ).toBeTruthy();
        },
        { timeout: 5000 }
      );
    });

    it('should have cancel button that resets form', async () => {
      const user = userEvent.setup();
      render(<PriceChangeRegisterPage />, { wrapper: createWrapper() });

      const cancelButton = screen.getByRole('button', { name: /취소/i });
      expect(cancelButton).toBeInTheDocument();

      await user.click(cancelButton);

      // Form should be reset or confirmation dialog should appear
      await waitFor(() => {
        expect(
          screen.getByText(/취소하시겠습니까/i) ||
          !screen.queryByRole('combobox', { name: /완제품/i })?.getAttribute('aria-expanded')
        ).toBeTruthy();
      });
    });
  });
});
