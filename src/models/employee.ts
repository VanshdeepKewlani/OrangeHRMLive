export interface EmployeeData {
  firstName: string;
  lastName: string;
  employeeId: string;
  jobTitle: string;
  employmentStatus: string;
}

export interface EmployeeRecord extends EmployeeData {
  empNumber: number;
}
