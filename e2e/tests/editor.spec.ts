import { test, expect } from '@playwright/test';
import { StudioPage } from '../fixtures/studio';

test.describe('Editor', () => {
  test('renders editor on load', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await expect(studio.editor).toBeVisible();
  });

  test('accepts JSX input', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.typeInEditor('<S3 name="mybucket" />');

    const content = await studio.getEditorContent();
    expect(content).toContain('S3');
  });

  test('shows resource count when valid JSX entered', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="bucket" />');

    await page.waitForTimeout(500);
    const count = await studio.getResourceCount();
    expect(count).toBe(1);
  });

  test('updates resource count for multiple resources', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="bucket1" /><Lambda name="api" />');

    await page.waitForTimeout(500);
    const count = await studio.getResourceCount();
    expect(count).toBe(2);
  });

  test('handles nested resources', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    const code = `<VPC name="main">
  <Lambda name="api" />
  <RDS name="db" />
</VPC>`;
    await studio.setEditorContent(code);

    await page.waitForTimeout(500);
    const count = await studio.getResourceCount();
    expect(count).toBe(3);
  });

  test('clears content when editor is cleared', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="bucket" />');
    await studio.clearEditor();

    const content = await studio.getEditorContent();
    expect(content).toBe('');
  });
});
