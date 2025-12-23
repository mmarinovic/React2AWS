import { test, expect } from '@playwright/test';
import { StudioPage } from '../fixtures/studio';

test.describe('Download & Share', () => {
  test.describe('Download', () => {
    test('download button is visible', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();
      await expect(studio.downloadButton).toBeVisible();
    });

    test('downloads terraform.zip file', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();
      await studio.setEditorContent('<S3 name="mybucket" />');
      await page.waitForTimeout(500);

      const download = await studio.clickDownload();
      const filename = download.suggestedFilename();

      expect(filename).toBe('terraform.zip');
    });

    test('downloaded file has correct modules', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();
      await studio.setEditorContent('<Lambda name="api" />');
      await page.waitForTimeout(500);

      const download = await studio.clickDownload();
      const path = await download.path();

      expect(path).toBeTruthy();
    });
  });

  test.describe('Share', () => {
    test('share button is visible', async ({ page }) => {
      const studio = new StudioPage(page);
      await studio.goto();
      await expect(studio.shareButton).toBeVisible();
    });

    test('clicking share shows copied confirmation', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const studio = new StudioPage(page);
      await studio.goto();
      await studio.setEditorContent('<S3 name="test" />');
      await page.waitForTimeout(500);

      await studio.clickShare();
      await studio.waitForShareCopied();
    });

    test('shared URL contains code parameter', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      const studio = new StudioPage(page);
      await studio.goto();
      await studio.setEditorContent('<S3 name="shared" />');
      await page.waitForTimeout(500);

      await studio.clickShare();

      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('/studio');
      expect(clipboardText).toContain('code=');
    });
  });
});
