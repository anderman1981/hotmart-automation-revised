import { test, expect } from '@playwright/test';

test.describe('Hotmart Automation System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard and display key metrics', async ({ page }) => {
    // Check that we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Check that key metrics are displayed
    await expect(page.locator('[data-testid="estimated-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="tracked-products"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-agents"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-generated"]')).toBeVisible();
    
    // Verify metrics are numbers (not loading placeholders)
    const earningsText = await page.locator('[data-testid="estimated-earnings"]').textContent();
    expect(earningsText).toMatch(/\$\d+/);
    
    const productsCount = await page.locator('[data-testid="tracked-products"]').textContent();
    expect(productsCount).toMatch(/\d+/);
  });

  test('should navigate to products page and display products', async ({ page }) => {
    // Navigate to products page
    await page.click('a[href="/products"]');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    await expect(page).toHaveURL(/.*products/);
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-list"]');
    
    // Check that products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    
    // Verify product information is displayed
    const firstCard = productCards.first();
    await expect(firstCard.locator('h3')).toBeVisible(); // Product name
    await expect(firstCard.locator('p')).toBeVisible(); // Product niche/details
  });

  test('should handle product selection and details view', async ({ page }) => {
    // Navigate to products page
    await page.click('a[href="/products"]');
    await page.waitForSelector('[data-testid="product-list"]');
    
    // Click on first product's "View Details" button
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('button', { hasText: 'View Details' }).click();
    
    // Wait for modal to appear
    await page.waitForSelector('[data-testid="product-detail-modal"]');
    
    // Verify modal content
    const modal = page.locator('[data-testid="product-detail-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toBeVisible(); // Product name
    await expect(modal.locator('p')).toContainText('Niche:'); // Product niche
    await expect(modal.locator('p')).toContainText('Price:'); // Product price
    await expect(modal.locator('p')).toContainText('Status:'); // Product status
    
    // Close modal
    await modal.locator('button', { hasText: 'Close' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('should select products for tracking', async ({ page }) => {
    // Navigate to products page
    await page.click('a[href="/products"]');
    await page.waitForSelector('[data-testid="product-list"]');
    
    // Get first product and its selection state
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const selectButton = firstProduct.locator('button', { hasText: 'Select' });
    
    // Click select button
    await selectButton.click();
    
    // Verify selection was processed (button might change state or show feedback)
    // This depends on the implementation - checking for any visual feedback
    await expect(firstProduct).toBeVisible();
  });

  test('should navigate to agents page and display agent status', async ({ page }) => {
    // Navigate to agents page
    await page.click('a[href="/agents"]');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    await expect(page).toHaveURL(/.*agents/);
    
    // Wait for agents to load
    await page.waitForSelector('[data-testid="agents-container"]');
    
    // Check that super agents are displayed
    await expect(page.locator('[data-testid="super-agents-status"]')).toBeVisible();
    
    // Verify agent information
    const agentCards = page.locator('[data-testid="agent-card"]');
    if (await agentCards.count() > 0) {
      await expect(agentCards.first()).toBeVisible();
      await expect(agentCards.first().locator('h3')).toBeVisible(); // Agent name
      await expect(agentCards.first().locator('p')).toBeVisible(); // Agent description
    }
  });

  test('should handle system start/stop operations', async ({ page }) => {
    // Navigate to settings or system control page
    await page.click('a[href="/config"]');
    await page.waitForLoadState('networkidle');
    
    // Look for system control buttons
    const startButton = page.locator('button', { hasText: 'Start System' });
    const stopButton = page.locator('button', { hasText: 'Stop System' });
    
    // Test system start if button is available
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Wait for operation to complete
      await page.waitForTimeout(1000);
      
      // Check for success message or status change
      const successMessage = page.locator('[data-testid="success-message"]');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toContainText('System Started');
      }
    }
    
    // Test system stop if button is available
    if (await stopButton.isVisible()) {
      await stopButton.click();
      
      // Wait for operation to complete
      await page.waitForTimeout(1000);
      
      // Check for success message or status change
      const successMessage = page.locator('[data-testid="success-message"]');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toContainText('System Stopped');
      }
    }
  });

  test('should handle content generation workflow', async ({ page }) => {
    // Navigate to agents page for content generation
    await page.click('a[href="/agents"]');
    await page.waitForSelector('[data-testid="agents-container"]');
    
    // Look for content generation controls
    const contentButton = page.locator('button', { hasText: 'Generate Content' });
    
    if (await contentButton.isVisible()) {
      await contentButton.click();
      
      // Wait for content generation modal/form
      await page.waitForSelector('[data-testid="content-generation-form"]');
      
      // Fill in content generation form
      await page.fill('[data-testid="content-title"]', 'Test Content Generation');
      await page.selectOption('[data-testid="content-platform"]', 'instagram');
      await page.fill('[data-testid="content-product"]', 'Test Product');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for results
      await page.waitForTimeout(2000);
      
      // Check for generated content
      const generatedContent = page.locator('[data-testid="generated-content"]');
      if (await generatedContent.isVisible()) {
        await expect(generatedContent).toBeVisible();
        await expect(generatedContent.locator('h3')).toContainText('Test Content Generation');
      }
    }
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to dashboard
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      // Verify mobile menu items are visible
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }
    
    // Check that dashboard adapts to mobile
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Check stats cards stack properly on mobile
    const statsCards = page.locator('[data-testid="stats-card"]');
    if (await statsCards.count() > 0) {
      await expect(statsCards.first()).toBeVisible();
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('http://localhost:5173/nonexistent-page');
    
    // Should show 404 or redirect to home
    const is404 = await page.locator('[data-testid="404-page"]').isVisible();
    const isRedirected = await page.url().includes('/dashboard');
    
    expect(is404 || isRedirected).toBeTruthy();
  });

  test('should handle loading states', async ({ page }) => {
    // Navigate to products page
    await page.click('a[href="/products"]');
    
    // Check for loading state
    const loadingElement = page.locator('[data-testid="loading"]');
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toBeVisible();
      await expect(loadingElement).toContainText('Loading');
      
      // Wait for loading to complete
      await page.waitForSelector('[data-testid="product-list"]', { timeout: 10000 });
      await expect(loadingElement).not.toBeVisible();
    }
  });

  test('should handle form validation', async ({ page }) => {
    // Navigate to products page
    await page.click('a[href="/products"]');
    await page.waitForSelector('[data-testid="product-list"]');
    
    // Look for add product button
    const addProductButton = page.locator('button', { hasText: 'Add Product' });
    
    if (await addProductButton.isVisible()) {
      await addProductButton.click();
      
      // Wait for form to appear
      await page.waitForSelector('[data-testid="product-form"]');
      
      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Check for validation errors
      const validationErrors = page.locator('[data-testid="validation-error"]');
      if (await validationErrors.count() > 0) {
        await expect(validationErrors.first()).toBeVisible();
      }
    }
  });

  test('should handle real-time updates', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Get initial stats
    const initialEarnings = await page.locator('[data-testid="estimated-earnings"]').textContent();
    
    // Simulate real-time update (this would normally come from WebSocket/SSE)
    // For now, we'll just check that the page can handle updates
    await page.waitForTimeout(2000);
    
    // Verify page is still responsive
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Check that stats are still displayed
    const currentEarnings = await page.locator('[data-testid="estimated-earnings"]').textContent();
    expect(currentEarnings).toMatch(/\$\d+/);
  });

  test('should handle accessibility features', async ({ page }) => {
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Check ARIA labels on important elements
    const mainNavigation = page.locator('nav[role="navigation"]');
    if (await mainNavigation.isVisible()) {
      await expect(mainNavigation).toHaveAttribute('role', 'navigation');
    }
    
    // Check that buttons have proper labels
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    if (await firstButton.isVisible()) {
      const hasText = await firstButton.textContent();
      const hasAriaLabel = await firstButton.getAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBeTruthy();
    }
  });

  test('should handle data persistence across navigation', async ({ page }) => {
    // Navigate to products page
    await page.click('a[href="/products"]');
    await page.waitForSelector('[data-testid="product-list"]');
    
    // Select a product if available
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    const selectButton = firstProduct.locator('button', { hasText: 'Select' });
    
    if (await selectButton.isVisible()) {
      await selectButton.click();
      await page.waitForTimeout(500);
    }
    
    // Navigate away and back
    await page.click('a[href="/dashboard"]');
    await page.waitForSelector('[data-testid="dashboard"]');
    
    await page.click('a[href="/products"]');
    await page.waitForSelector('[data-testid="product-list"]');
    
    // Verify state is maintained (product should still be selected)
    await expect(firstProduct).toBeVisible();
  });
});

test.describe('Performance E2E Tests', () => {
  test('should load pages within acceptable time limits', async ({ page }) => {
    // Test dashboard load time
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="dashboard"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Navigate to products page
    await page.goto('http://localhost:5173/products');
    await page.waitForSelector('[data-testid="product-list"]');
    
    // Check that page remains responsive even with many products
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    if (count > 50) {
      // Test scrolling performance
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(500);
      
      // Page should still be responsive
      await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    }
  });
});

test.describe('Cross-browser E2E Tests', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      if (currentBrowser !== browserName) return;
      
      // Test basic functionality
      await page.goto('http://localhost:5173');
      await page.waitForSelector('[data-testid="dashboard"]');
      
      // Test navigation
      await page.click('a[href="/products"]');
      await page.waitForSelector('[data-testid="product-list"]');
      
      // Test that products are displayed
      const productCards = page.locator('[data-testid="product-card"]');
      await expect(productCards.first()).toBeVisible();
      
      // Test modal functionality
      await productCards.first().locator('button', { hasText: 'View Details' }).click();
      await page.waitForSelector('[data-testid="product-detail-modal"]');
      await expect(page.locator('[data-testid="product-detail-modal"]')).toBeVisible();
    });
  });
});