import { Employee } from "@/types/employee";
import { Shift, DaySchedule } from "../../types/shift";

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
    (error as any).status = response.status;
    throw error;
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T; // No content to parse, return undefined
  }

  return response.json();
};

// Fetch all shifts
export const fetchShifts = async (token: string | null): Promise<Shift[]> => {
  const response = await apiFetch<any>("/shifts", "GET", token);
  return response.shifts.map((shift: any) => ({
    ...shift,
    schedule_settings: shift.schedule_settings || [],
  }));
};

// Fetch a single shift by ID
export const fetchShift = async (
  id: number,
  token: string | null
): Promise<Shift> => {
  const response = await apiFetch<any>(`/shifts/${id}`, "GET", token);
  return {
    ...response.shift,
    schedule_settings: response.shift.schedule_settings || [],
  };
};

// Create a new shift
export const createShift = async (
  data: Partial<Shift>,
  token: string | null
): Promise<Shift> => {
  const normalizedData = {
    ...data,
    schedule_settings: data.schedule_settings || [],
  };

  console.log("Create Shift Payload:", normalizedData);

  const response = await apiFetch<any>(
    "/shifts",
    "POST",
    token,
    normalizedData,
    false
  );

  if (!response.shift) {
    throw new Error("Invalid server response: 'shift' object missing");
  }
  return response.shift;
};

// Update an existing shift
export const updateShift = async (
  id: number,
  data: Partial<Shift>,
  token: string | null
): Promise<Shift> => {
  const normalizedData = {
    ...data,
    schedule_settings: data.schedule_settings || [],
  };

  console.log("Update Shift Payload:", normalizedData);

  const response = await apiFetch<any>(
    `/shifts/${id}`,
    "PUT",
    token,
    normalizedData,
    false
  );

  if (!response.shift) {
    throw new Error("Invalid server response: 'shift' object missing");
  }
  return response.shift;
};

// Delete a shift
export const deleteShift = (id: number, token: string | null): Promise<void> =>
  apiFetch<void>(`/shifts/${id}`, "DELETE", token);

export const fetchEmployeesDoesntHaveShift = async (
  token: string | null
): Promise<Employee[]> => {
  const response = await apiFetch<{ employees: Employee[] }>(
    "/employees-doesnt-have-shift",
    "GET",
    token
  );
  const employees = response.employees || []; // Fallback to empty array if undefined
  if (!Array.isArray(employees)) {
    throw new Error("Invalid API response: 'employees' is not an array");
  }
  return employees.map((employee) => ({
    ...employee,
    education_background: employee.education_backgrounds || [],
  }));
};
