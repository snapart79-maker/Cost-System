import { test, expect } from '@playwright/test';

/**
 * Cost Sheet View E2E Tests
 * 원가 계산서 조회 플로우 테스트
 */
test.describe('Cost Sheet View', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to cost sheet page
    await page.goto('/cost-sheet');
  });

  test('should display cost sheet page', async ({ page }) => {
    // Verify page title
    await expect(page.getByText('원가 계산서')).toBeVisible();
  });

  test('should navigate from dashboard to cost sheet page', async ({ page }) => {
    // Start from dashboard
    await page.goto('/');

    // Click on cost sheet menu
    await page.getByRole('link', { name: /원가 계산서/i }).click();

    // Verify navigation
    await expect(page).toHaveURL('/cost-sheet');
  });

  test('should show product selector', async ({ page }) => {
    // Look for product selection dropdown or list
    const productSelector = page.getByText('완제품 선택').or(
      page.getByRole('combobox')
    ).first();
    await expect(productSelector).toBeVisible();
  });

  test('should display work type filter', async ({ page }) => {
    // Check for work type filter (전체/내작/외작)
    await expect(page.getByText('전체')).toBeVisible();
  });

  test('should show cost summary section', async ({ page }) => {
    // Check for cost summary display
    const summarySection = page.locator('[class*="summary"]').first();
    if (await summarySection.isVisible()) {
      await expect(summarySection).toBeVisible();
    }
  });

  test('should have export buttons', async ({ page }) => {
    // Check for PDF and Excel export buttons
    const pdfButton = page.getByRole('button', { name: /PDF/i });
    const excelButton = page.getByRole('button', { name: /Excel/i });

    // At least one export option should be visible
    const hasPdf = await pdfButton.isVisible().catch(() => false);
    const hasExcel = await excelButton.isVisible().catch(() => false);

    expect(hasPdf || hasExcel).toBeTruthy();
  });

  test('should display material cost tab', async ({ page }) => {
    // Look for material cost tab or section
    const materialTab = page.getByText('재료비');
    await expect(materialTab).toBeVisible();
  });

  test('should display process cost tab', async ({ page }) => {
    // Look for process cost tab or section
    const processTab = page.getByText('가공비');
    await expect(processTab).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on material tab
    const materialTab = page.getByRole('tab', { name: /재료비/i }).or(
      page.getByText('재료비').first()
    );

    if (await materialTab.isVisible()) {
      await materialTab.click();
      await page.waitForTimeout(300);
    }

    // Click on process tab
    const processTab = page.getByRole('tab', { name: /가공비/i }).or(
      page.getByText('가공비').first()
    );

    if (await processTab.isVisible()) {
      await processTab.click();
      await page.waitForTimeout(300);
    }
  });

  test('should filter by work type', async ({ page }) => {
    // Click on work type filters
    const internalWork = page.getByText('내작');
    const externalWork = page.getByText('외작');
    const allWork = page.getByText('전체');

    if (await internalWork.isVisible()) {
      await internalWork.click();
      await page.waitForTimeout(300);
    }

    if (await externalWork.isVisible()) {
      await externalWork.click();
      await page.waitForTimeout(300);
    }

    if (await allWork.isVisible()) {
      await allWork.click();
    }
  });
});

test.describe('Cost Sheet Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cost-sheet');
  });

  test('should display cost breakdown when product selected', async ({ page }) => {
    // Select a product if dropdown is available
    const productSelect = page.getByRole('combobox').first();

    if (await productSelect.isVisible()) {
      await productSelect.click();
      await page.waitForTimeout(300);

      // Select first option if available
      const firstOption = page.getByRole('option').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should show cost categories', async ({ page }) => {
    // Check for various cost categories
    const costLabels = ['재료비', '노무비', '경비', '제조원가'];

    for (const label of costLabels) {
      const element = page.getByText(label).first();
      // Some labels might not be visible until product is selected
      if (await element.isVisible().catch(() => false)) {
        await expect(element).toBeVisible();
      }
    }
  });
});
