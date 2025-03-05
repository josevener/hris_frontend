import { Employee } from "./employee";
import { Salary } from "./salary";

export interface Payroll {
  id: number;
  employee_id: number;
  salary_id: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  pay_date: string;
  status: "pending" | "processed" | "paid";
  created_at: string;
  updated_at: string;
  employee?: Employee;
  salary?: Salary;
}

export interface PayrollItem {
  id: number;
  payroll_id: number;
  employee_id: number;
  type: "earning" | "deduction" | "contribution";
  category: string;
  amount: number;
  created_at: string;
  updated_at: string;
  payroll?: Payroll; // Optional enriched payroll data
  employee?: Employee; // Optional enriched employee data
}
