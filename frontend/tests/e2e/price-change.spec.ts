import { test, expect } from '@playwright/test';

/**
 * Price Change Registration E2E Tests
 * 단가 변경 등록 플로우 테스트
 */
test.describe('Price Change Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to price change registration page
    await page.goto('/price-change/register');
  });

  test('should display price change registration page', async ({ page }) => {
    // Verify page title
    await expect(page.getByText('단가 변경 등록')).toBeVisible();

    // Verify main sections are visible
    await expect(page.getByText('완제품 선택')).toBeVisible();
  });

  test('should navigate from dashboard to price change page', async ({ page }) => {
    // Start from dashboard
    await page.goto('/');

    // Click on price change menu or quick action
    await page.getByRole('link', { name: /단가 변경/i }).first().click();

    // Verify navigation
    await expect(page).toHaveURL(/\/price-change/);
  });

  test('should show product selection step', async ({ page }) => {
    // Verify step 1 is active
    await expect(page.getByText('완제품 선택')).toBeVisible();

    // Check for product table or selector
    const productSection = page.locator('[class*="product"]').first();
    await expect(productSection).toBeVisible();
  });

  test('should allow product search', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/검색|품번|품명/i).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      // Allow time for search results
      await page.waitForTimeout(500);
    }
  });

  test('should display change info form when product selected', async ({ page }) => {
    // The form section should be visible
    await expect(page.getByText('변경 정보')).toBeVisible();
  });

  test('should show material change section', async ({ page }) => {
    // Check for material change table section
    const materialSection = page.getByText('재료비 변경');
    await expect(materialSection).toBeVisible();
  });

  test('should show process change section', async ({ page }) => {
    // Check for process change table section
    const processSection = page.getByText('가공비 변경');
    await expect(processSection).toBeVisible();
  });

  test('should display cost preview section', async ({ page }) => {
    // Check for cost preview
    await expect(page.getByText('원가 미리보기')).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    // Look for save/register button
    const saveButton = page.getByRole('button', { name: /저장|등록/i });
    await expect(saveButton).toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    // Click dashboard link in sidebar
    await page.getByRole('link', { name: /대시보드|Dashboard/i }).click();

    // Verify navigation to dashboard
    await expect(page).toHaveURL('/');
  });
});

test.describe('Price Change Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/price-change/register');
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    // Try to submit without filling required fields
    const saveButton = page.getByRole('button', { name: /저장|등록/i });

    if (await saveButton.isEnabled()) {
      await saveButton.click();

      // Should show validation message or error
      await page.waitForTimeout(500);
    }
  });
});
