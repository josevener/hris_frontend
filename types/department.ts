export interface Department {
  id: number;
  department: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: number;
  designation: string;
  department_id: number;
  department?: Department;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = "Employee" | "HR" | "Admin";

export type SortKey =
  | "id"
  | "department" // For Department
  | "designation"
  | "department_id"
  | "department.department"; // For Designation
