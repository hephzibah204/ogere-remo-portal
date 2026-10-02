import { test, expect } from '@playwright/test';

test.describe('Security Dashboard', () => {
  test('should load the dashboard and verify key elements', async ({ page }) => {
    // Navigate with the preview flag to bypass Coming Soon screen
    await page.goto('/security-dashboard?preview=true');

    // Wait for the dashboard to render completely
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page).toHaveTitle(/Security Command/i);

    // Verify main header exists
    const header = page.locator('text="SECURITY COMMAND"');
    await expect(header).toBeVisible();

    // Verify agency tabs are present
    const policeTab = page.locator('button', { hasText: 'Police' });
    await expect(policeTab).toBeVisible();
    
    // Verify specific sections exist (by checking for known text)
    await expect(page.locator('text="LIVE COMMUNITY BROADCAST"')).toBeVisible();
    await expect(page.locator('text="ANONYMOUS WHISTLEBLOWER TIPS"')).toBeVisible();
    
    // Check if the create incident button works
    const createBtn = page.locator('button', { hasText: 'SOS DISPATCH' });
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await expect(page.locator('text="MANUAL OVERRIDE DISPATCH"')).toBeVisible();
      // Press escape to close
      await page.keyboard.press('Escape');
    }
  });

  test('should load incidents and allow selection', async ({ page }) => {
    // Mock the incidents API response
    await page.route('/api/incidents*', async (route) => {
      const json = {
        incidents: [
          {
            id: 'inc_test_1',
            category: 'Robbery',
            threat_level: 'CODE_RED',
            status: 'open',
            location: 'Testing Location',
            created_at: new Date().toISOString(),
            is_live_tracking: false,
          }
        ]
      };
      await route.fulfill({ json });
    });

    await page.goto('/security-dashboard?preview=true');

    // Wait for the mocked incident to appear
    const incidentCard = page.locator('text="Robbery"').first();
    await expect(incidentCard).toBeVisible();

    // Click it to set active
    await incidentCard.click();

    // Ensure the dispatch controls panel appears
    await expect(page.locator('text="ACTIVE DISPATCH TERMINAL"')).toBeVisible();
  });
});
