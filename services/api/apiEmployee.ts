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

export const fetchEmployees = async (token: string | null) => {
  const employees = await apiFetch<Employee[]>("/employees", "GET", token);
  return employees.map((employee) => ({
    ...employee,
    education_background: employee.education_backgrounds || [],
  }));
};

export const fetchUsers = (token: string | null) =>
  apiFetch<User[]>("/users-doesnt-have-employee", "GET", token);

export const fetchDepartments = (token: string | null) =>
  apiFetch<Department[]>("/departments", "GET", token);

export const fetchDesignations = (token: string | null) =>
  apiFetch<Designation[]>("/designations", "GET", token);

export const fetchEmployee = async (id: number, token: string | null) => {
  const response = await apiFetch<any>(`/employees/${id}`, "GET", token);
  return {
    ...response.employee,
    education_background: response.employee.educationBackgrounds || [],
  } as Employee;
};

export const createEmployee = async (
  data: Partial<Employee>,
  token: string | null
): Promise<Employee> => {
  // Normalize array fields to ensure they are arrays
  const normalizedData = {
    ...data,
    dependents:
      data.dependents !== undefined
        ? Array.isArray(data.dependents)
          ? data.dependents
          : data.dependents
            ? [data.dependents]
            : []
        : [],
    education_background:
      data.education_backgrounds !== undefined
        ? Array.isArray(data.education_backgrounds)
          ? data.education_backgrounds
          : data.education_backgrounds
            ? [data.education_backgrounds]
            : []
        : [],
    documents:
      data.documents !== undefined
        ? Array.isArray(data.documents)
          ? data.documents
          : data.documents
            ? [data.documents]
            : []
        : [],
  };

  // If there are files in documents, we would need FormData (not implemented here since no files in current payload)
  const hasFiles = normalizedData.documents?.some(
    (doc) => doc.file instanceof File
  );
  if (hasFiles) {
    throw new Error(
      "File uploads are not supported in this implementation. Use FormData if needed."
    );
  }

  const response = await apiFetch<any>(
    "/employees",
    "POST",
    token,
    normalizedData,
    false // Send as JSON, not multipart
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
  // Normalize array fields to ensure they are arrays
  const normalizedData = {
    ...data,
    dependents:
      data.dependents !== undefined
        ? Array.isArray(data.dependents)
          ? data.dependents
          : data.dependents
            ? [data.dependents]
            : []
        : [],
    education_background:
      data.education_backgrounds !== undefined
        ? Array.isArray(data.education_backgrounds)
          ? data.education_backgrounds
          : data.education_backgrounds
            ? [data.education_backgrounds]
            : []
        : [],
    documents:
      data.documents !== undefined
        ? Array.isArray(data.documents)
          ? data.documents
          : data.documents
            ? [data.documents]
            : []
        : [],
  };

  // If there are files in documents, we would need FormData (not implemented here since no files in current payload)
  const hasFiles = normalizedData.documents?.some(
    (doc) => doc.file instanceof File
  );
  if (hasFiles) {
    throw new Error(
      "File uploads are not supported in this implementation. Use FormData if needed."
    );
  }

  return apiFetch<Employee>(
    `/employees/${id}`,
    "PUT",
    token,
    normalizedData,
    false
  );
};

export const deleteEmployee = (id: number, token: string | null) =>
  apiFetch<void>(`/employees/${id}`, "DELETE", token);

export const deleteEducationBackground = (id: number, token: string | null) =>
  apiFetch<void>(`/education-backgrounds/${id}`, "DELETE", token);
