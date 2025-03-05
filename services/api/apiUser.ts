import { User } from "@/types/employee";

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

// Fetch all users
export const fetchUsers = () => apiFetch<User[]>("/users", "GET");

// Fetch a single user by ID
export const fetchUser = (id: number) => apiFetch<User>(`/users/${id}`, "GET");

// Create a new user
export const createUser = (data: Partial<User>) =>
  apiFetch<User>("/users", "POST", data);

// Update an existing user
export const updateUser = (id: number, data: Partial<User>) =>
  apiFetch<User>(`/users/${id}`, "PUT", data);

// Delete a user
export const deleteUser = (id: number) =>
  apiFetch<void>(`/users/${id}`, "DELETE");
