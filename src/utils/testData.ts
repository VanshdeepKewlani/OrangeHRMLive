import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { EmployeeData } from '../models/employee';

export async function loadEmployeeData(): Promise<EmployeeData> {
  const filePath = path.resolve(__dirname, '../../test-data/employee.json');
  const template = JSON.parse(await readFile(filePath, 'utf-8')) as EmployeeData;
  return {
    ...template,
    employeeId: `A${Date.now().toString().slice(-9)}`
  };
}
