import { getCookie } from "@/lib/auth";
import {
  GeneratePayslipsResponse,
  Payroll,
  PayrollItem,
} from "@/types/payroll";
import { Employee } from "@/types/employee";

const BASE_URL = process.env.$NEXT_PUBLIC_API_URL;

const getAuthToken = () => getCookie("auth_token");

const apiFetch = async <T>(
  endpoint: string,
  method: string,
  body?: any
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Error Response:", errorData);
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }
  return response.json();
};

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const fetchPayrolls = (page: number = 1, perPage: number = 10) =>
  apiFetch<PaginatedResponse<Payroll>>(
    `/payroll?page=${page}&per_page=${perPage}`,
    "GET"
  );

export const fetchPayrollItemsByPayrollId = (payrollId?: number) =>
  apiFetch<PayrollItem[]>(
    payrollId ? `/payroll/${payrollId}/items` : "/payroll-items",
    "GET"
  );

export const createPayroll = (data: Partial<Payroll>) =>
  apiFetch<{ message: string; payroll: Payroll }>(
    "/payroll",
    "POST",
    data
  ).then((response) => response.payroll);

export const updatePayroll = (id: number, data: Partial<Payroll>) =>
  apiFetch<{ message: string; payroll: Payroll }>(
    "/payroll/" + id,
    "PUT",
    data
  ).then((response) => response.payroll);

export const deletePayroll = (id: number) =>
  apiFetch<void>(`/payroll/${id}`, "DELETE");

export const generatePayslips = (payrollIds: number[]) =>
  apiFetch<GeneratePayslipsResponse>("/payroll/generate-payslips", "POST", {
    payroll_ids: payrollIds,
  });

export const previewPayroll = (employeeId: number, payrollCycleId: number) =>
  apiFetch<{
    basic_salary: number;
    total_earnings: number;
    total_deductions: number;
    net_salary: number;
    gross_salary: number;
    payroll_items: PayrollItem[];
  }>(
    `/payroll/preview?employee_id=${employeeId}&payroll_cycles_id=${payrollCycleId}`,
    "GET"
  );

export const fetchEmployeesWithSalaries = () =>
  apiFetch<Employee[]>("/payroll/employees-with-salaries", "GET");
