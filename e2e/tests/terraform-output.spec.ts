import { test, expect } from '@playwright/test';
import { StudioPage } from '../fixtures/studio';

test.describe('Terraform Output', () => {
  test('generates terraform files for valid input', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="mybucket" />');
    await studio.switchToTab('terraform');

    await page.waitForTimeout(500);

    const hasModules = await page.getByText(/modules/i).isVisible();
    const hasMainTf = await page.getByText('main.tf').isVisible();

    expect(hasModules || hasMainTf).toBe(true);
  });

  test('shows S3 module for S3 resource', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="assets" />');
    await studio.switchToTab('terraform');

    await page.waitForTimeout(500);
    const terraformOutput = page.locator('[data-testid="terraform-output"]');
    await expect(terraformOutput.getByRole('button', { name: 's3' })).toBeVisible();
  });

  test('shows Lambda module for Lambda resource', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<Lambda name="api" />');
    await studio.switchToTab('terraform');

    await page.waitForTimeout(500);
    const terraformOutput = page.locator('[data-testid="terraform-output"]');
    await expect(terraformOutput.getByRole('button', { name: 'lambda' })).toBeVisible();
  });

  test('shows VPC module for VPC resource', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<VPC name="main" />');
    await studio.switchToTab('terraform');

    await page.waitForTimeout(500);
    const terraformOutput = page.locator('[data-testid="terraform-output"]');
    await expect(terraformOutput.getByRole('button', { name: 'vpc' })).toBeVisible();
  });

  test('shows root-level terraform files', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="bucket" />');
    await studio.switchToTab('terraform');

    await page.waitForTimeout(500);

    await expect(page.getByText('main.tf').first()).toBeVisible();
    await expect(page.getByText('variables.tf').first()).toBeVisible();
    await expect(page.getByText('outputs.tf').first()).toBeVisible();
  });

  test('shows README.md', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="bucket" />');
    await studio.switchToTab('terraform');

    await page.waitForTimeout(500);
    await expect(page.getByText('README.md').first()).toBeVisible();
  });

  test('generates multiple modules for multiple resources', async ({ page }) => {
    const studio = new StudioPage(page);
    await studio.goto();
    await studio.setEditorContent('<S3 name="bucket" /><Lambda name="api" /><DynamoDB name="data" />');
    await studio.switchToTab('terraform');

    await page.waitForTimeout(500);

    const terraformOutput = page.locator('[data-testid="terraform-output"]');
    await expect(terraformOutput.getByRole('button', { name: 's3' })).toBeVisible();
    await expect(terraformOutput.getByRole('button', { name: 'lambda' })).toBeVisible();
    await expect(terraformOutput.getByRole('button', { name: 'dynamodb' })).toBeVisible();
  });
});
