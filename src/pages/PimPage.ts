import { expect, type Locator, type Page } from '@playwright/test';
import type { EmployeeData } from '../models/employee';

export class PimPage {
  constructor(private readonly page: Page) {}

  private async gotoRoute(route: string, expectedUrl: RegExp, waitForForm = false): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await this.page.goto(route, { waitUntil: 'domcontentloaded' });
        break;
      } catch (error) {
        if (expectedUrl.test(this.page.url())) {
          break;
        }
        if (attempt === 1) {
          throw error;
        }
      }
    }
    await this.page.waitForURL(expectedUrl, { timeout: 20_000 });
    if (waitForForm) {
      const form = this.page.locator('form');
      try {
        await expect(form).toBeVisible({ timeout: 10_000 });
      } catch {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await expect(form).toBeVisible({ timeout: 20_000 });
      }
    }
  }

  private get firstName() {
    return this.page.locator('form input').nth(1);
  }

  private get lastName() {
    return this.page.locator('form input').nth(3);
  }

  private get employeeId() {
    return this.page.locator('form input').nth(4);
  }

  private get employeeIdFilter() {
    return this.page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input');
  }

  async open(): Promise<void> {
    await this.gotoRoute('/web/index.php/pim/viewEmployeeList', /\/pim\/viewEmployeeList/);
  }

  async openAddEmployee(): Promise<void> {
    await this.gotoRoute('/web/index.php/pim/addEmployee', /\/pim\/addEmployee/, true);
  }

  async addEmployee(employee: EmployeeData, picturePath: string): Promise<void> {
    await this.firstName.fill(employee.firstName);
    await this.lastName.fill(employee.lastName);
    await this.employeeId.fill(employee.employeeId);
    await this.page.locator('input[type="file"]').setInputFiles(picturePath);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForURL(/\/pim\/viewPersonalDetails/, { timeout: 20_000 });
  }

  async searchByEmployeeId(employeeId: string): Promise<void> {
    await this.gotoRoute('/web/index.php/pim/viewEmployeeList', /\/pim\/viewEmployeeList/);
    await this.employeeIdFilter.fill(employeeId);
    await this.page.getByRole('button', { name: 'Search' }).click();
    await expect(this.row(employeeId)).toBeVisible();
  }

  private row(employeeId: string): Locator {
    return this.page.locator('.oxd-table-card').filter({ hasText: employeeId });
  }

  async openEmployee(employeeId: string): Promise<void> {
    await this.row(employeeId).locator('button').first().click();
    await this.page.waitForURL(/\/pim\/viewPersonalDetails/, { timeout: 20_000 });
  }

  async editJobDetails(jobTitle: string, employmentStatus: string): Promise<void> {
    const empNumber = await this.page.url().match(/empNumber\/(\d+)/)?.[1];
    if (!empNumber) {
      throw new Error('Employee number was not present in the employee details URL');
    }
    await this.gotoRoute(`/web/index.php/pim/viewJobDetails/empNumber/${empNumber}`, /\/pim\/viewJobDetails/, true);
    const selects = this.page.locator('.oxd-select-text');
    await selects.nth(0).click();
    await this.page.getByRole('option', { name: jobTitle, exact: true }).click();
    await selects.nth(4).click();
    await this.page.getByRole('option', { name: employmentStatus, exact: true }).click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(selects.nth(0)).toContainText(jobTitle);
    await expect(selects.nth(4)).toContainText(employmentStatus);
  }

  async expectJobDetails(jobTitle: string, employmentStatus: string): Promise<void> {
    await expect(this.page.getByText(jobTitle, { exact: true })).toBeVisible();
    await expect(this.page.getByText(employmentStatus, { exact: true })).toBeVisible();
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    await this.gotoRoute('/web/index.php/pim/viewEmployeeList', /\/pim\/viewEmployeeList/);
    await this.employeeIdFilter.fill(employeeId);
    await this.page.getByRole('button', { name: 'Search' }).click();
    const employeeRow = this.row(employeeId);
    await employeeRow.locator('input[type="checkbox"]').check({ force: true });
    await this.page.getByRole('button', { name: 'Delete Selected' }).click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await expect(this.row(employeeId)).toHaveCount(0);
  }

  async expectEmployeeAbsent(employeeId: string): Promise<void> {
    await this.employeeIdFilter.fill(employeeId);
    await this.page.getByRole('button', { name: 'Search' }).click();
    await expect(this.page.getByText('No Records Found', { exact: false })).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('banner').getByText(/user account/i).click();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}
