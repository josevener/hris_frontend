import { Department } from "../../types/employee";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

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
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export const fetchDepartments = async (
  token: string | null,
  page: number = 1,
  perPage: number = 7
) => {
  const response = await apiFetch<{
    departments: PaginatedResponse<Department>;
  }>(`/departments?page=${page}&per_page=${perPage}`, "GET", token);
  return response.departments;
};

export const fetchDepartment = async (id: number, token: string | null) => {
  const response = await apiFetch<{ department: Department }>(
    `/departments/${id}`,
    "GET",
    token
  );
  return response.department;
};

export const createDepartment = async (
  data: Partial<Department>,
  token: string | null
): Promise<Department> => {
  const response = await apiFetch<{ department: Department }>(
    "/departments",
    "POST",
    token,
    data
  );
  return response.department;
};

export const updateDepartment = async (
  id: number,
  data: Partial<Department>,
  token: string | null
): Promise<Department> => {
  const response = await apiFetch<{ department: Department }>(
    `/departments/${id}`,
    "PUT",
    token,
    data
  );
  return response.department;
};

export const deleteDepartment = (id: number, token: string | null) =>
  apiFetch<void>(`/departments/${id}`, "DELETE", token);
