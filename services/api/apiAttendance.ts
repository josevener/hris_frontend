import { Attendance } from "@/types/attendance";
import { getCookie } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiFetch = async <T>(
  endpoint: string,
  method: string,
  body?: any
): Promise<T> => {
  const token = await getCookie("auth_token");
  if (!token) {
    throw new Error("No auth token found");
  }

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

// Fetch all attendances
export const fetchAttendances = () =>
  apiFetch<Attendance[]>("/attendances", "GET");

// Create a new attendance (clock in)
export const createAttendance = (data: Partial<Attendance>) =>
  apiFetch<Attendance>("/attendances", "POST", data);

// Update an existing attendance (clock out)
export const updateAttendance = (id: number, data: Partial<Attendance>) =>
  apiFetch<Attendance>(`/attendances/${id}`, "PUT", data);
