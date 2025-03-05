import { Employee, User, Department, Designation } from "../../types/employee";

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

export const fetchEmployees = () => apiFetch<Employee[]>("/employees", "GET");

export const fetchUsers = () =>
  apiFetch<User[]>("/users-doesnt-have-employee", "GET");

export const fetchDepartments = () =>
  apiFetch<Department[]>("/departments", "GET");

export const fetchDesignations = () =>
  apiFetch<Designation[]>("/designations", "GET");

export const fetchEmployee = (id: number) =>
  apiFetch<Employee>(`/employees/${id}`, "GET");

export const createEmployee = (data: Partial<Employee>) =>
  apiFetch<Employee>("/employees", "POST", data);

export const updateEmployee = (id: number, data: Partial<Employee>) =>
  apiFetch<Employee>(`/employees/${id}`, "PUT", data);

export const deleteEmployee = (id: number) =>
  apiFetch<void>(`/employees/${id}`, "DELETE");
