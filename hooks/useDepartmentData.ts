import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Department } from "@/types/employee";
import { fetchDepartments } from "@/services/api/apiDepartment";
import { useAuth } from "@/lib/AuthContext";

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
}

interface UseDepartmentData {
  departments: Department[];
  loading: boolean;
  error: string | null;
  setDepartments: Dispatch<SetStateAction<Department[]>>;
}

export const useDepartmentData = (): UseDepartmentData => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all departments (single page since total is 4)
        const departmentResponse: PaginatedResponse<Department> =
          await fetchDepartments(token, 1, 100);
        setDepartments(departmentResponse.data);
      } catch (err) {
        setError("Failed to load department data. Please try again.");
        toast.error("Failed to load department data");
        console.error("Error fetching department data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();

    // For server-side pagination, modify to fetch one page at a time:
    /*
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const departmentResponse = await fetchDepartments(token, 1, 10);
        setDepartments(departmentResponse.data);
      } catch (err) {
        setError("Failed to load department data. Please try again.");
        toast.error("Failed to load department data");
        console.error("Error fetching department data:", err);
      } finally {
        setLoading(false);
      }
    };
    */
  }, [token]);

  return {
    departments,
    loading,
    error,
    setDepartments,
  };
};
