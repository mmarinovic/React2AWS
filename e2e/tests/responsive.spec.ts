import { test, expect } from '@playwright/test';
import { StudioPage } from '../fixtures/studio';

test.describe('Responsive Layout', () => {
  test.describe('Desktop', () => {
    test('shows editor panel', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const studio = new StudioPage(page);
      await studio.goto();

      await expect(studio.editor).toBeVisible();
    });

    test('shows status bar with full text', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const studio = new StudioPage(page);
      await studio.goto();
      await studio.setEditorContent('<S3 name="bucket" />');
      await page.waitForTimeout(500);

      await expect(page.locator('[data-testid="status-bar"]').getByText(/resource/i)).toBeVisible();
    });

    test('shows download button with text', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const studio = new StudioPage(page);
      await studio.goto();

      await expect(page.getByText('Download')).toBeVisible();
    });

    test('shows share button with text', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const studio = new StudioPage(page);
      await studio.goto();

      await expect(page.getByText('Share')).toBeVisible();
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('shows mobile tab bar', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();

      const codeTab = page.getByRole('button', { name: /code/i });
      const previewTab = page.getByRole('button', { name: /preview/i });

      expect(await codeTab.isVisible() || await previewTab.isVisible()).toBe(true);
    });

    test('editor is accessible on mobile', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();

      await expect(studio.editor).toBeVisible();
    });

    test('can type in editor on mobile', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();
      await studio.typeInEditor('<S3 name="mobile" />');

      const content = await studio.getEditorContent();
      expect(content).toContain('S3');
    });

    test('status bar shows compact resource count', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();
      await studio.setEditorContent('<S3 name="bucket" />');
      await page.waitForTimeout(500);

      const count = await studio.getResourceCount();
      expect(count).toBe(1);
    });
  });

  test.describe('Tablet', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('shows editor on tablet', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();

      await expect(studio.editor).toBeVisible();
    });

    test('can generate terraform on tablet', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();
      await studio.setEditorContent('<Lambda name="api" />');
      await studio.switchToTab('terraform');
      await page.waitForTimeout(500);

      const terraformOutput = page.locator('[data-testid="terraform-output"]');
      await expect(terraformOutput.getByRole('button', { name: 'lambda' })).toBeVisible();
    });
  });
});
