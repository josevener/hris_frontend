import { Employee, User, Department, Designation } from "../../types/employee";

const BASE_URL = "http://127.0.0.1:8000/api";

const apiFetch = async <T>(
  endpoint: string,
  method: string,
  token: string | null,
  body?: any,
  isMultipart: boolean = false
): Promise<T> => {
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials: "include",
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
  const formData = new FormData();

  // Append non-file fields
  for (const [key, value] of Object.entries(data)) {
    if (
      key === "dependents" ||
      key === "education_background" ||
      key === "documents"
    ) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  }

  // Append document files
  if (data.documents && Array.isArray(data.documents)) {
    data.documents.forEach((doc, index) => {
      if (doc.file instanceof File) {
        formData.append(`documents[${index}][file]`, doc.file);
        formData.append(`documents[${index}][type]`, doc.type);
      }
    });
  }

  const response = await apiFetch<any>(
    "/employees",
    "POST",
    token,
    formData,
    true
  );
  if (!response.employee) {
    throw new Error("Invalid server response: 'employee' object missing");
  }

  return response.employee;
};

export const updateEmployee = async (
  id: number,
  data: Partial<Employee>,
  token: string | null
): Promise<Employee> => {
  const formData = new FormData();

  // Append non-file fields
  for (const [key, value] of Object.entries(data)) {
    if (
      key === "dependents" ||
      key === "education_background" ||
      key === "documents"
    ) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  }

  // Append document files
  if (data.documents && Array.isArray(data.documents)) {
    data.documents.forEach((doc, index) => {
      if (doc.file instanceof File) {
        formData.append(`documents[${index}][file]`, doc.file);
        formData.append(`documents[${index}][type]`, doc.type);
      }
    });
  }

  return apiFetch<Employee>(`/employees/${id}`, "PUT", token, formData, true);
};

export const deleteEmployee = (id: number, token: string | null) =>
  apiFetch<void>(`/employees/${id}`, "DELETE", token);
