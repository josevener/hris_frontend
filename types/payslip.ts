export type PayslipSortKey =
  | "employee.user.lastname"
  | "payroll_cycle.pay_date"
  | "gross_salary"
  | "net_salary"
  | "issued_date";

export interface Payslip {
  id: number;
  payroll_id: number;
  payroll_cycles_id: number;
  employee_id: number;
  salary_id: number | null;
  earnings: number;
  deductions: number;
  gross_salary: number;
  net_salary: number;
  issued_date: string | null;
  payment_method: string | null;
  employee?: {
    id: number;
    company_id_number: string;
    address?: string | null;
    sss_id?: string | null;
    philhealth_id?: string | null;
    pagibig_id?: string | null;
    tin?: string | null;
    tax?: string | null;
    user?: {
      firstname: string;
      middlename?: string | null;
      lastname: string;
      email?: string | null;
      phone_number?: string | null;
    };
  };
  payroll_cycle?: {
    id: number;
    start_date: string;
    end_date: string;
    pay_date: string;
  };
  salary?: {
    id: number;
    basic_salary: number;
    pay_period: string;
  };
  created_at?: string;
  updated_at?: string;
}
