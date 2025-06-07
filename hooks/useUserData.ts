import { useState, useEffect } from "react";
import { User } from "@/types/employee";
import { toast } from "sonner";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PaginatedResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Simulated API calls (replace with your actual apiUser.ts implementations)
const fetchUsers = async (page: number = 1): Promise<PaginatedResponse> => {
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

const createUser = async (user: Partial<User>): Promise<User> => {
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

const updateUser = async (id: number, user: Partial<User>): Promise<User> => {
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

const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token") || "your-token"}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete user");
};

export const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 6, // Match your Laravel per_page
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const userData = await fetchUsers(page);
      // console.log("Fetched users:", userData);
      setUsers(userData.data); // Extract the 'data' array
      setPagination({
        current_page: userData.current_page,
        last_page: userData.last_page,
        per_page: userData.per_page,
        total: userData.total,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch user data.");
      toast.error(err.message || "Failed to fetch user data.");
      // console.error("Error fetching user data:", err);
      setUsers([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1); // Initial fetch
  }, []);

  const addUser = async (user: Partial<User>) => {
    try {
      const newUser = await createUser(user);
      await loadUsers(pagination.current_page); // Refresh current page
      return newUser;
    } catch (err: any) {
      setError(err.message || "Failed to add user.");
      toast.error(err.message || "Failed to add user.");
      // console.error("Error adding user:", err);
      throw err;
    }
  };

  const editUser = async (id: number, user: Partial<User>) => {
    try {
      const updatedUser = await updateUser(id, user);
      await loadUsers(pagination.current_page); // Refresh current page
      return updatedUser;
    } catch (err: any) {
      setError(err.message || "Failed to edit user.");
      toast.error(err.message || "Failed to edit user.");
      // console.error("Error editing user:", err);
      throw err;
    }
  };

  const removeUser = async (id: number) => {
    try {
      await deleteUser(id);
      await loadUsers(pagination.current_page); // Refresh current page
    } catch (err: any) {
      setError(err.message || "Failed to remove user.");
      toast.error(err.message || "Failed to remove user.");
      // console.error("Error removing user:", err);
      throw err;
    }
  };

  return {
    users,
    pagination,
    loading,
    error,
    setUsers,
    addUser,
    editUser,
    removeUser,
    fetchUsers: loadUsers, // Expose fetchUsers for page changes
  };
};
