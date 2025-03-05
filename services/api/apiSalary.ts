import { fetchEmployees } from "./apiEmployee";
import { Employee, Salary } from "@/types/salary";

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

// Fetch all salaries
export const fetchSalaries = () => apiFetch<Salary[]>("/salary", "GET");

export const fetchEmployeesDoesntHaveSalary = () =>
  apiFetch<Employee[]>("/employees-doesnt-have-salary", "GET");

// Fetch a single salary by ID
export const fetchSalary = (id: number) =>
  apiFetch<Salary>(`/salary/${id}`, "GET");

// Create a new salary
export const createSalary = (data: Partial<Salary>) =>
  apiFetch<Salary>("/salary", "POST", data);

// Update an existing salary
export const updateSalary = (id: number, data: Partial<Salary>) =>
  apiFetch<Salary>(`/salary/${id}`, "PUT", data);

// Delete a salary
export const deleteSalary = (id: number) =>
  apiFetch<void>(`/salary/${id}`, "DELETE");
