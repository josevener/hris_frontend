import { Employee, User } from "./employee";
export interface Salary {
  id: number;
  employee_id: number;
  basic_salary: number;
  pay_period: "monthly" | "bi-weekly" | "weekly" | "daily";
  start_date: string;
  end_date?: string | null;
  salary_id?: number | null;
  isActive: number;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface Department {
  id: number;
  department: string;
}

export interface Designation {
  id: number;
  designation: string;
  department_id: number;
}

// export interface Employee {
//   id: number;
//   company_id_number: string;
//   birthdate: string | null;
//   reports_to: string | null;
//   gender: string | null;
//   user_id: number;
//   department_id: number;
//   designation_id: number;
//   status: "Active" | "On Leave" | "Resigned" | "Terminated";
//   created_at: string;
//   isActive: number;
//   resignation_date?: string;
//   user?: User;
//   department?: Department;
//   designation?: Designation;
// }
