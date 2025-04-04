import { getCookie } from "@/lib/auth";
import { Payroll, PayrollItem } from "@/types/payroll";

const BASE_URL = "http://127.0.0.1:8000/api";

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
  // apiFetch<Payroll>("/payroll", "POST", data);
  apiFetch<{ message: string; payroll: Payroll }>(
    "/payroll",
    "POST",
    data
  ).then((response) => {
    const payroll = response.payroll;
    if (!payroll.id) {
      console.warn("Backend returned a payroll without an ID:", payroll);
    }
    return response.payroll;
  });

export const updatePayroll = (id: number, data: Partial<Payroll>) =>
  apiFetch<Payroll>(`/payroll/${id}`, "PUT", data);

export const deletePayroll = (id: number) =>
  apiFetch<void>(`/payroll/${id}`, "DELETE");
