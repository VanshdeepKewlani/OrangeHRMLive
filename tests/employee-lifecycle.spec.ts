import { expect, test } from '@playwright/test';
import { OrangeHrmApi } from '../src/api/OrangeHrmApi';
import { LoginPage } from '../src/pages/LoginPage';
import { PimPage } from '../src/pages/PimPage';
import { createProfilePicture } from '../src/utils/profilePicture';
import { loadEmployeeData } from '../src/utils/testData';

const username = process.env.ORANGEHRM_USERNAME ?? 'Admin';
const password = process.env.ORANGEHRM_PASSWORD ?? 'admin123';

test.describe('Employee lifecycle management', () => {
  test('creates, edits, validates, deletes, and logs out an employee', async ({ page }) => {
    const employee = await loadEmployeeData();
    const picturePath = await createProfilePicture();
    const loginPage = new LoginPage(page);
    const pimPage = new PimPage(page);
    const api = new OrangeHrmApi(page.request);

    await test.step('Login', async () => {
      await loginPage.goto();
      await loginPage.login(username, password);
    });

    await test.step('Add employee with data-driven input and profile picture', async () => {
      await pimPage.open();
      await pimPage.openAddEmployee();
      await pimPage.addEmployee(employee, picturePath);
      await pimPage.open();
      await pimPage.searchByEmployeeId(employee.employeeId);
    });

    const createdEmployee = await test.step('Cross-check created employee through API', async () => {
      return api.expectEmployee(employee.employeeId, {
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId
      });
    });

    await test.step('Edit job title and employment status', async () => {
      await pimPage.openEmployee(employee.employeeId);
      await pimPage.editJobDetails(employee.jobTitle, employee.employmentStatus);
      await pimPage.expectJobDetails(employee.jobTitle, employee.employmentStatus);
    });

    await test.step('Cross-check updated employee through API', async () => {
      await api.expectEmployee(employee.employeeId, {
        empNumber: createdEmployee.empNumber,
        jobTitle: employee.jobTitle,
        employmentStatus: employee.employmentStatus
      });
    });

    await test.step('Delete employee and verify UI and API removal', async () => {
      await pimPage.deleteEmployee(employee.employeeId);
      await pimPage.expectEmployeeAbsent(employee.employeeId);
      expect(await api.findByEmployeeId(employee.employeeId), 'Deleted employee must be absent from API').toBeUndefined();
    });

    await test.step('Logout and verify session invalidation', async () => {
      await pimPage.logout();
      await loginPage.expectLoggedOut();
      await page.goto('/web/index.php/dashboard/index');
      await expect(page).toHaveURL(/auth\/login/);
    });
  });
});
