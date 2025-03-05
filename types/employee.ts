// export interface User {
//   id: number;
//   lastname: string;
//   firstname: string;
//   middlename: string;
//   extension: string;
//   role_name: string;
//   email: string;
//   profile_image: string;
//   phone_number: string;
//   company_id_number: string;
// }

export interface User {
  id: number;
  lastname: string;
  firstname: string;
  middlename: string;
  extension: string;
  email: string;
  company_id_number: string;
  role_name: string;
  profile_image?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  password?: string;
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

export interface Employee {
  id: number;
  company_id_number: string;
  birthdate: string | null;
  reports_to: string | null;
  gender: string | null;
  user_id: number;
  department_id: number;
  designation_id: number;
  status: "Active" | "On Leave" | "Resigned" | "Terminated";
  created_at: string;
  isActive: number;
  resignation_date?: string;
  user?: User;
  department?: Department;
  designation?: Designation;
}

export type SortKey =
  | keyof Employee
  | "user.lastname"
  | "department.department"
  | "designation.designation";

export type SortValue = string | number | undefined;

export type UserRole = "Employee" | "HR" | "Admin";
