import { useState, useEffect } from "react";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "@/services/api/apiUser";
import { User } from "@/types/employee";
import { toast } from "sonner";

export const useUserData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await fetchUsers();
        console.log("Fetched users:", userData);
        setUsers(userData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data.");
        toast.error(err.message || "Failed to fetch user data.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addUser = async (user: Partial<User>) => {
    try {
      const newUser = await createUser(user);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      setError(err.message || "Failed to add user.");
      toast.error(err.message || "Failed to add user.");
      console.error("Error adding user:", err);
      throw err;
    }
  };

  const editUser = async (id: number, user: Partial<User>) => {
    try {
      const updatedUser = await updateUser(id, user);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
    } catch (err: any) {
      setError(err.message || "Failed to edit user.");
      toast.error(err.message || "Failed to edit user.");
      console.error("Error editing user:", err);
    }
  };

  const removeUser = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to remove user.");
      toast.error(err.message || "Failed to remove user.");
      console.error("Error removing user:", err);
    }
  };

  return {
    users,
    loading,
    error,
    setUsers,
    addUser,
    editUser,
    removeUser,
  };
};
