import { Holiday } from "@/types/department";

const BASE_URL = "http://127.0.0.1:8000/api";

interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
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
    const errorData = await response.text(); // Use text() to avoid JSON parse errors
    const error = new Error(
      errorData
        ? JSON.parse(errorData).message
        : `HTTP error! Status: ${response.status}`
    );
    (error as any).response = errorData ? JSON.parse(errorData) : {};
    (error as any).status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T; // Handle 204 No Content
  }

  return response.json();
};

export const fetchHolidays = async (
  token: string | null,
  page: number = 1,
  perPage: number = 10
) => {
  const response = await apiFetch<PaginatedResponse<Holiday>>(
    `/holidays?page=${page}&per_page=${perPage}`,
    "GET",
    token
  );
  return response;
};

export const fetchHoliday = async (id: number, token: string | null) => {
  const response = await apiFetch<{ holiday: Holiday }>(
    `/holidays/${id}`,
    "GET",
    token
  );
  return response.holiday;
};

export const createHoliday = async (
  data: Partial<Holiday>,
  token: string | null
): Promise<Holiday> => {
  const response = await apiFetch<{ holiday: Holiday }>(
    "/holidays",
    "POST",
    token,
    data
  );
  return response.holiday;
};

export const updateHoliday = async (
  id: number,
  data: Partial<Holiday>,
  token: string | null
): Promise<Holiday> => {
  const response = await apiFetch<{ holiday: Holiday }>(
    `/holidays/${id}`,
    "PUT",
    token,
    data
  );
  return response.holiday;
};

export const deleteHoliday = (id: number, token: string | null) =>
  apiFetch<void>(`/holidays/${id}`, "DELETE", token);
