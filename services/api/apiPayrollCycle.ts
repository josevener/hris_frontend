import { getCookie } from "@/lib/auth";
import { PayrollCycle } from "@/types/payroll";

const BASE_URL = "http://127.0.0.1:8000/api";

const getAuthToken = () => {
  return getCookie("auth_token");
};

export const apiFetch = async <T>(
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

interface PaginatedPayrollCycleResponse {
  cycles: PayrollCycle[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const fetchPayrollCycles = (page: number = 1, perPage: number = 10) =>
  apiFetch<PaginatedPayrollCycleResponse>(
    `/payroll-cycles?page=${page}&per_page=${perPage}`,
    "GET"
  );

export const fetchFuturePayrollCycles = (
  page: number = 1,
  perPage: number = 10
) =>
  apiFetch<PaginatedPayrollCycleResponse>(
    `/future-payroll-cycles?page=${page}&per_page=${perPage}`,
    "GET"
  );

export const fetchPayrollCycleById = (cycleId: number) =>
  apiFetch<PayrollCycle>(`/payroll-cycles/${cycleId}`, "GET");

// export const createPayrollCycle = (data: Partial<PayrollCycle>) =>
//   apiFetch<PayrollCycle>("/payroll-cycles", "POST", data);

// export const updatePayrollCycle = (id: number, data: Partial<PayrollCycle>) =>
//   apiFetch<PayrollCycle>(`/payroll-cycles/${id}`, "PUT", data);

// export const deletePayrollCycle = (id: number) =>
//   apiFetch<void>(`/payroll-cycles/${id}`, "DELETE");
