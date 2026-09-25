import { expect, type APIRequestContext } from '@playwright/test';
import type { EmployeeRecord } from '../models/employee';

interface EmployeeApiResponse {
  data: Array<Record<string, unknown>>;
}

interface EmployeeDetailResponse {
  data: Record<string, unknown>;
}

export class OrangeHrmApi {
  constructor(private readonly request: APIRequestContext) {}

  async findByEmployeeId(employeeId: string): Promise<EmployeeRecord | undefined> {
    const response = await this.request.get('/web/index.php/api/v2/pim/employees', {
      params: { limit: 200 }
    });
    expect(response.ok(), `Employee API lookup should succeed for ${employeeId}`).toBeTruthy();
    const body = (await response.json()) as EmployeeApiResponse;
    const employee = body.data.find((item) => item.employeeId === employeeId);
    if (!employee) {
      return undefined;
    }

    const jobResponse = await this.request.get(
      `/web/index.php/api/v2/pim/employees/${employee.empNumber}/job-details`
    );
    expect(jobResponse.ok(), `Job API lookup should succeed for ${employeeId}`).toBeTruthy();
    const jobBody = (await jobResponse.json()) as EmployeeDetailResponse;
    return this.toEmployeeRecord({ ...employee, ...jobBody.data });
  }

  async expectEmployee(employeeId: string, expected: Partial<EmployeeRecord>): Promise<EmployeeRecord> {
    const employee = await this.findByEmployeeId(employeeId);
    expect(employee, `API should contain employee ${employeeId}`).toBeDefined();
    expect(employee).toMatchObject(expected);
    return employee as EmployeeRecord;
  }

  private toEmployeeRecord(employee: Record<string, unknown>): EmployeeRecord {
    return {
      empNumber: Number(employee.empNumber),
      firstName: String(employee.firstName ?? ''),
      lastName: String(employee.lastName ?? ''),
      employeeId: String(employee.employeeId ?? ''),
      jobTitle: this.nestedName(employee.jobTitle),
      employmentStatus: this.nestedName(employee.empStatus ?? employee.employmentStatus)
    };
  }

  private nestedName(value: unknown): string {
    if (typeof value === 'object' && value !== null && 'name' in value) {
      return String((value as { name?: unknown }).name ?? '');
    }
    if (typeof value === 'object' && value !== null && 'title' in value) {
      return String((value as { title?: unknown }).title ?? '');
    }
    return String(value ?? '');
  }
}
