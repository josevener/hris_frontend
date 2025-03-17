import { Employee } from "@/types/employee";

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

export interface Payroll {
  id: number;
  employee_id: number;
  salary_id: number;
  pay_date: string;
  start_date?: string;
  end_date?: string;
  status: "pending" | "processed" | "paid";
  total_earnings?: number;
  total_deductions?: number;
  net_salary?: number;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  salary?: Salary;
  payroll_items?: PayrollItem[];
}

export interface PayrollItem {
  id: number;
  payroll_id?: number | null;
  employee_id?: number | null;
  scope: "specific" | "global";
  type: "earning" | "deduction" | "contribution";
  category: string;
  amount: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  payroll?: Payroll;
}

export interface PayrollCycle {
  id: number;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  pay_date: string; // YYYY-MM-DD format
  created_at?: string;
  updated_at?: string;
}

export interface PayrollConfig {
  id: number;
  start_year_month: string; // YYYY-MM
  first_start_day: number;
  first_end_day: number;
  second_start_day: number;
  second_end_day: number;
  pay_date_offset: number;
  cycles: PayrollCycle[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export type SortKey = "id" | "pay_date" | "status" | "employee.user.lastname";
