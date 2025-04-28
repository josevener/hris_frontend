import { getCookie } from "@/lib/auth";
import { Shift } from "@/types/shift";

const BASE_URL = "http://127.0.0.1:8000/api";

const apiFetch = async <T>(
  endpoint: string,
  method: string,
  body?: any
): Promise<T> => {
  const token = getCookie("auth_token");
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

// Fetch all shifts
export const fetchShifts = async (): Promise<Shift[]> => {
  const response = await apiFetch<{ data: Shift[] }>("/shifts", "GET");
  return response.data || []; // Extract the array, default to empty array if undefined
};

// Fetch a single shift by ID
export const fetchShift = async (id: number): Promise<Shift> => {
  const response = await apiFetch<{ shift: Shift }>(`/shifts/${id}`, "GET");
  return response.shift; // Adjust based on the response structure
};

// Create a new shift
export const createShift = async (data: Partial<Shift>): Promise<Shift> => {
  const response = await apiFetch<{ shift: Shift }>("/shifts", "POST", data);
  return response.shift;
};

// Update an existing shift
export const updateShift = async (
  id: number,
  data: Partial<Shift>
): Promise<Shift> => {
  const response = await apiFetch<{ shift: Shift }>(
    `/shifts/${id}`,
    "PUT",
    data
  );
  return response.shift;
};

// Delete a shift
export const deleteShift = (id: number) =>
  apiFetch<void>(`/shifts/${id}`, "DELETE");
