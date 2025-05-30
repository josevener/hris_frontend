import { Employee } from "@/types/employee";
import { Shift, PartialShift } from "../../types/shift";

const BASE_URL = process.env.$NEXT_PUBLIC_API_URL;

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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const fetchShifts = async (token: string | null): Promise<Shift[]> => {
  const response = await apiFetch<any>("/shifts", "GET", token);
  return response.shifts.map((shift: any) => ({
    ...shift,
    employee_ids: Array.isArray(shift.employee_ids) ? shift.employee_ids : [],
    schedule_settings: shift.schedule_settings || [],
    employees: shift.employees || [],
    isGroupSchedule:
      shift.isGroupSchedule ??
      (Array.isArray(shift.employee_ids) && shift.employee_ids.length > 1),
  }));
};

export const createShift = async (
  data: PartialShift,
  token: string | null
): Promise<Shift> => {
  const normalizedData = {
    ...data,
    employee_ids: Array.isArray(data.employee_ids) ? data.employee_ids : [],
    schedule_settings: data.schedule_settings || [],
    isGroupSchedule: data.isGroupSchedule ?? false,
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
  return {
    ...response.shift,
    employee_ids: Array.isArray(response.shift.employee_ids)
      ? response.shift.employee_ids
      : [],
    isGroupSchedule:
      response.shift.isGroupSchedule ??
      (Array.isArray(response.shift.employee_ids) &&
        response.shift.employee_ids.length > 1),
  };
};

export const updateShift = async (
  id: number,
  data: PartialShift,
  token: string | null
): Promise<Shift> => {
  const normalizedData = {
    ...data,
    employee_ids: Array.isArray(data.employee_ids) ? data.employee_ids : [],
    schedule_settings: data.schedule_settings || [],
    isGroupSchedule: data.isGroupSchedule ?? false,
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
  return {
    ...response.shift,
    employee_ids: Array.isArray(response.shift.employee_ids)
      ? response.shift.employee_ids
      : [],
    isGroupSchedule:
      response.shift.isGroupSchedule ??
      (Array.isArray(response.shift.employee_ids) &&
        response.shift.employee_ids.length > 1),
  };
};

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
  const employees = response.employees || [];
  if (!Array.isArray(employees)) {
    throw new Error("Invalid API response: 'employees' is not an array");
  }
  return employees.map((employee) => ({
    ...employee,
    education_background: employee.education_backgrounds || [],
  }));
};
