import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Designation, Department } from "@/types/employee";
import {
  fetchDesignations,
  fetchDepartments,
} from "@/services/api/apiDesignation";
import { useAuth } from "@/lib/AuthContext";

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
}

interface UseDesignationData {
  designations: Designation[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  setDesignations: Dispatch<SetStateAction<Designation[]>>;
}

export const useDesignationData = (): UseDesignationData => {
  const { token } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all designations across pages for client-side pagination
        let allDesignations: Designation[] = [];
        let page = 1;
        let lastPage = 1;
        do {
          const designationResponse: PaginatedResponse<Designation> =
            await fetchDesignations(token, page, 7);
          allDesignations = [...allDesignations, ...designationResponse.data];
          lastPage = designationResponse.last_page;
          page++;
        } while (page <= lastPage);

        // Fetch all departments (single page since total is 4)
        const departmentResponse: PaginatedResponse<Department> =
          await fetchDepartments(token, 1, 7);
        const allDepartments = departmentResponse.data;

        setDesignations(allDesignations);
        setDepartments(allDepartments);
      } catch (err: any) {
        setError("Failed to load designation data. Please try again.");
        toast.error(err.message || "Failed to load designation data");
        // console.error("Error fetching designation data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  return {
    designations,
    departments,
    loading,
    error,
    setDesignations,
  };
};
