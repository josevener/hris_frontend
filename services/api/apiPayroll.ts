import { Payroll } from "@/types/payroll";

const BASE_URL = "http://127.0.0.1:8000/api";

const getAuthToken = () =>
  localStorage.getItem("auth_token") || "your-sanctum-token-here";

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

// Fetch all payrolls
export const fetchPayrolls = () => apiFetch<Payroll[]>("/payroll", "GET");

// Fetch a single payroll by ID
export const fetchPayroll = (id: number) =>
  apiFetch<Payroll>(`/payroll/${id}`, "GET");

// Create a new payroll
export const createPayroll = (data: Partial<Payroll>) =>
  apiFetch<Payroll>("/payroll", "POST", data);

// Update an existing payroll
export const updatePayroll = (id: number, data: Partial<Payroll>) =>
  apiFetch<Payroll>(`/payroll/${id}`, "PUT", data);

// Delete a payroll
export const deletePayroll = (id: number) =>
  apiFetch<void>(`/payroll/${id}`, "DELETE");
