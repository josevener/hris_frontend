import { Designation, Department } from "../../types/employee";

const BASE_URL = "http://127.0.0.1:8000/api";

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

export const fetchDesignations = async (
  token: string | null,
  page: number = 1,
  perPage: number = 7
): Promise<PaginatedResponse<Designation>> => {
  const response = await apiFetch<{
    designations: PaginatedResponse<Designation>;
  }>(`/designations?page=${page}&per_page=${perPage}`, "GET", token);
  return response.designations;
};

export const fetchDesignation = async (
  id: number,
  token: string | null
): Promise<Designation> => {
  const response = await apiFetch<{ designation: Designation }>(
    `/designations/${id}`,
    "GET",
    token
  );
  return response.designation;
};

export const fetchDepartments = async (
  token: string | null,
  page: number = 1,
  perPage: number = 7
): Promise<PaginatedResponse<Department>> => {
  const response = await apiFetch<{
    departments: PaginatedResponse<Department>;
  }>(`/departments?page=${page}&per_page=${perPage}`, "GET", token);
  return response.departments;
};

export const createDesignation = async (
  data: Partial<Designation>,
  token: string | null
): Promise<Designation> => {
  const response = await apiFetch<{ designation: Designation }>(
    "/designations",
    "POST",
    token,
    data
  );
  return response.designation;
};

export const updateDesignation = async (
  id: number,
  data: Partial<Designation>,
  token: string | null
): Promise<Designation> => {
  const response = await apiFetch<{ designation: Designation }>(
    `/designations/${id}`,
    "PUT",
    token,
    data
  );
  return response.designation;
};

export const deleteDesignation = async (
  id: number,
  token: string | null
): Promise<void> => {
  await apiFetch<{ message: string }>(`/designations/${id}`, "DELETE", token);
};
