import { Employee, User, Department, Designation } from "../../types/employee";

const BASE_URL = "http://127.0.0.1:8000/api";

const apiFetch = async <T>(
  endpoint: string,
  method: string,
  token: string | null, // Token from useAuth
  body?: any
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // Only add if token exists
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials: "include", // Match your axios withCredentials: true
  });

  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
    (error as any).response = errorData;
    throw error;
  }

  return response.json();
};

export const fetchEmployees = (token: string | null) =>
  apiFetch<Employee[]>("/employees", "GET", token);

export const fetchUsers = (token: string | null) =>
  apiFetch<User[]>("/users-doesnt-have-employee", "GET", token);

export const fetchDepartments = (token: string | null) =>
  apiFetch<Department[]>("/departments", "GET", token);

export const fetchDesignations = (token: string | null) =>
  apiFetch<Designation[]>("/designations", "GET", token);

export const fetchEmployee = (id: number, token: string | null) =>
  apiFetch<Employee>(`/employees/${id}`, "GET", token);

export const createEmployee = async (
  data: Partial<Employee>,
  token: string | null
): Promise<Employee> => {
  const response = await apiFetch<any>("/employees", "POST", token, data);
  console.log("Raw API response from createEmployee:", response);

  if (!response.employee) {
    throw new Error("Invalid server response: 'employee' object missing");
  }

  const employeeData = response.employee;
  console.log("Extracted employee data:", employeeData);

  if (!employeeData.id) {
    throw new Error("Employee ID missing in employee data");
  }

  return employeeData;
};

export const updateEmployee = (
  id: number,
  data: Partial<Employee>,
  token: string | null
) => apiFetch<Employee>(`/employees/${id}`, "PUT", token, data);

export const deleteEmployee = (id: number, token: string | null) =>
  apiFetch<void>(`/employees/${id}`, "DELETE", token);
