import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get username() {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  private get password() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
    await this.page.waitForURL(/\/dashboard\/index/, { timeout: 20_000, waitUntil: 'commit' });
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
  }
}
