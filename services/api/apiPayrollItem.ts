import { getCookie } from "@/lib/auth";
import { PayrollItem } from "@/types/payroll";

const BASE_URL = "http://127.0.0.1:8000/api";

const getAuthToken = () => {
  const token = getCookie("auth_token");
};

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
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }

  return response.json();
};

export const fetchPayrollItemsForActiveConfig = async () => {
  return apiFetch<PayrollItem[]>("/payroll-items?active_config=true", "GET");
};

// Fetch all payroll items
export const fetchPayrollItems = (payroll_cycles_id: number, token: string) =>
  apiFetch<PayrollItem[]>("/payroll-items", "GET");

// Fetch a single payroll item by ID
export const fetchPayrollItem = (id: number) =>
  apiFetch<PayrollItem>(`/payroll-items/${id}`, "GET");

// Create a new payroll item
export const createPayrollItem = (data: Partial<PayrollItem>) =>
  apiFetch<PayrollItem>("/payroll-items", "POST", data);

// Update an existing payroll item
export const updatePayrollItem = (id: number, data: Partial<PayrollItem>) =>
  apiFetch<PayrollItem>(`/payroll-items/${id}`, "PUT", data);

// Delete a payroll item
export const deletePayrollItem = (id: number) =>
  apiFetch<void>(`/payroll-items/${id}`, "DELETE");
