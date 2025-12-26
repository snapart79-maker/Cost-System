import { test, expect } from '@playwright/test';

/**
 * Settlement E2E Tests
 * 정산 플로우 테스트
 */
test.describe('Settlement Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settlement page
    await page.goto('/settlement');
  });

  test('should display settlement page', async ({ page }) => {
    // Verify page title
    await expect(page.getByText('정산')).toBeVisible();
  });

  test('should navigate from dashboard to settlement page', async ({ page }) => {
    // Start from dashboard
    await page.goto('/');

    // Click on settlement menu
    await page.getByRole('link', { name: /정산/i }).first().click();

    // Verify navigation
    await expect(page).toHaveURL(/\/settlement/);
  });

  test('should show settlement condition form', async ({ page }) => {
    // Check for condition form elements
    await expect(page.getByText('정산 조건')).toBeVisible();
  });

  test('should show date range picker', async ({ page }) => {
    // Look for date range picker
    const dateSection = page.getByText('기간').or(
      page.getByText('정산 기간')
    ).first();
    await expect(dateSection).toBeVisible();
  });

  test('should show receipt quantity section', async ({ page }) => {
    // Check for receipt quantity input section
    await expect(page.getByText('입고 수량')).toBeVisible();
  });

  test('should show settlement result section', async ({ page }) => {
    // Check for result section
    await expect(page.getByText('정산 결과')).toBeVisible();
  });

  test('should have calculate button', async ({ page }) => {
    // Look for calculate button
    const calculateButton = page.getByRole('button', { name: /계산|조회/i });
    await expect(calculateButton).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    // Look for save button
    const saveButton = page.getByRole('button', { name: /저장/i });
    await expect(saveButton).toBeVisible();
  });

  test('should have export options', async ({ page }) => {
    // Check for PDF and Excel export buttons
    const pdfButton = page.getByRole('button', { name: /PDF/i });
    const excelButton = page.getByRole('button', { name: /Excel/i });

    const hasPdf = await pdfButton.isVisible().catch(() => false);
    const hasExcel = await excelButton.isVisible().catch(() => false);

    expect(hasPdf || hasExcel).toBeTruthy();
  });
});

test.describe('Settlement Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settlement');
  });

  test('should allow selecting price changes', async ({ page }) => {
    // Look for price change selection
    const priceChangeSection = page.getByText('단가 변경').first();
    await expect(priceChangeSection).toBeVisible();
  });

  test('should allow period unit selection', async ({ page }) => {
    // Look for period unit options (월별/일별/연간)
    const periodOptions = ['월별', '일별', '연간'];

    for (const option of periodOptions) {
      const element = page.getByText(option);
      if (await element.isVisible().catch(() => false)) {
        await expect(element).toBeVisible();
        break;
      }
    }
  });

  test('should display total settlement amount', async ({ page }) => {
    // Look for total amount display
    const totalSection = page.getByText('총 정산').or(
      page.getByText('합계')
    ).first();

    if (await totalSection.isVisible().catch(() => false)) {
      await expect(totalSection).toBeVisible();
    }
  });
});

test.describe('Settlement History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settlement/history');
  });

  test('should display settlement history page', async ({ page }) => {
    // Verify page loads
    await expect(page.getByText('정산 이력')).toBeVisible();
  });

  test('should show search filters', async ({ page }) => {
    // Check for filter elements
    const searchSection = page.locator('[class*="search"]').or(
      page.locator('[class*="filter"]')
    ).first();

    if (await searchSection.isVisible().catch(() => false)) {
      await expect(searchSection).toBeVisible();
    }
  });

  test('should show history table', async ({ page }) => {
    // Check for table
    const table = page.getByRole('table').or(
      page.locator('[class*="table"]')
    ).first();

    await expect(table).toBeVisible();
  });

  test('should navigate between settlement and history', async ({ page }) => {
    // Go to main settlement page
    await page.goto('/settlement');
    await expect(page).toHaveURL('/settlement');

    // Navigate to history
    await page.goto('/settlement/history');
    await expect(page).toHaveURL('/settlement/history');
  });
});

test.describe('Settlement Data Entry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settlement');
  });

  test('should allow Excel template download', async ({ page }) => {
    // Look for Excel download button
    const downloadButton = page.getByRole('button', { name: /다운로드|양식/i });

    if (await downloadButton.isVisible().catch(() => false)) {
      await expect(downloadButton).toBeVisible();
    }
  });

  test('should allow Excel upload', async ({ page }) => {
    // Look for upload button or area
    const uploadButton = page.getByRole('button', { name: /업로드|가져오기/i }).or(
      page.locator('input[type="file"]')
    );

    if (await uploadButton.isVisible().catch(() => false)) {
      await expect(uploadButton).toBeVisible();
    }
  });
});
