import { Employee } from "@/types/employee";
import { Payslip } from "./payslip";

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
  payroll_cycles_id: number;
  status: "pending" | "processed" | "paid";
  basic_salary?: number;
  total_earnings?: number;
  total_deductions?: number;
  net_salary?: number;
  gross_salary?: number;
  created_at: string;
  updated_at: string;
  salary?: Salary;
  employee?: Employee;
  payroll_items?: PayrollItem[];
  payroll_cycle?: PayrollCycle;
}

export interface PayrollItem {
  id: number;
  payroll_id?: number | null;
  payroll_cycles_id?: number | null;
  employee_id?: number | null;
  scope: "specific" | "global";
  type: "earning" | "deduction" | "contribution";
  category: string;
  amount: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  payroll?: Payroll;
}

export interface GeneratePayslipsResponse {
  payslips: Payslip[];
  pdfUrls: string[];
}

export interface PayrollCycle {
  id: number;
  start_date: string;
  end_date: string;
  pay_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface PayrollConfig {
  id: number;
  start_year_month: string;
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
