import { Page, Locator, expect } from '@playwright/test';

export class StudioPage {
  readonly page: Page;
  readonly editor: Locator;
  readonly preview: Locator;
  readonly terraformPanel: Locator;
  readonly statusBar: Locator;
  readonly downloadButton: Locator;
  readonly shareButton: Locator;
  readonly fileTree: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editor = page.locator('[data-testid="code-editor"] .cm-editor').locator('visible=true');
    this.preview = page.locator('[class*="preview"]').first();
    this.terraformPanel = page.locator('[class*="terraform"]').first();
    this.statusBar = page.locator('[data-testid="status-bar"]');
    this.downloadButton = page.getByRole('button', { name: /download/i });
    this.shareButton = page.getByRole('button', { name: /share/i });
    this.fileTree = page.locator('[class*="file-tree"]');
  }

  async goto() {
    await this.page.goto('/studio');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoWithCode(code: string) {
    const encoded = Buffer.from(code).toString('base64');
    await this.page.goto(`/studio?code=${encodeURIComponent(encoded)}`);
    await this.page.waitForLoadState('networkidle');
  }

  async typeInEditor(text: string) {
    await this.editor.click();
    await this.page.keyboard.type(text, { delay: 10 });
  }

  async clearEditor() {
    await this.editor.click();
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifier}+a`);
    await this.page.keyboard.press('Backspace');
  }

  async setEditorContent(code: string) {
    await this.clearEditor();
    await this.typeInEditor(code);
  }

  async getEditorContent(): Promise<string> {
    return await this.editor.evaluate((el) => {
      const content = el.querySelector('.cm-content');
      return content?.textContent || '';
    });
  }

  async getResourceCount(): Promise<number> {
    const text = await this.statusBar.innerText();
    const match = text.match(/(\d+)\s*resource/) || text.match(/^(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getErrorCount(): Promise<number> {
    const text = await this.statusBar.innerText();
    const match = text.match(/(\d+)\s*error/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async clickDownload() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadButton.click();
    return downloadPromise;
  }

  async clickShare() {
    await this.shareButton.click();
  }

  async waitForShareCopied() {
    await expect(this.page.getByText(/copied/i)).toBeVisible();
  }

  async selectExample(exampleName: string) {
    const exampleButton = this.page.getByRole('button', { name: new RegExp(exampleName, 'i') });
    await exampleButton.click();
  }

  async switchToTab(tab: 'preview' | 'terraform') {
    const tabButton = this.page.getByRole('button', { name: new RegExp(tab, 'i') });
    if (await tabButton.isVisible()) {
      await tabButton.click();
    }
  }

  async isMobileView(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return (viewport?.width || 0) < 768;
  }

  async clickMobileTab(tab: 'code' | 'preview' | 'terraform') {
    const tabButton = this.page.locator(`button:has-text("${tab}")`).first();
    await tabButton.click();
  }
}
