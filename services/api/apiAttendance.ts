import { Attendance } from "@/types/attendance";

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

// Fetch all attendances
export const fetchAttendances = () =>
  apiFetch<Attendance[]>("/attendances", "GET");

// Create a new attendance (clock in)
export const createAttendance = (data: Partial<Attendance>) =>
  apiFetch<Attendance>("/attendances", "POST", data);

// Update an existing attendance (clock out)
export const updateAttendance = (id: number, data: Partial<Attendance>) =>
  apiFetch<Attendance>(`/attendances/${id}`, "PUT", data);
