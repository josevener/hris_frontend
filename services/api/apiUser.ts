import { User } from "@/types/employee";

interface PaginatedResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const fetchUsers = async (
  page: number = 1
): Promise<PaginatedResponse> => {
  const response = await fetch(`http://127.0.0.1:8000/api/users?page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token") || "your-token"}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  const response = await fetch("http://127.0.0.1:8000/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token") || "your-token"}`,
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
};

export const updateUser = async (
  id: number,
  user: Partial<User>
): Promise<User> => {
  const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth_token") || "your-token"}`,
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token") || "your-token"}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete user");
};
