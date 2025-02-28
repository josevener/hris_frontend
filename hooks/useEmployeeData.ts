import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import {
  Employee,
  User,
  Department,
  Designation,
  SortKey,
} from "../types/employee";
import {
  fetchEmployees,
  fetchUsers,
  fetchDepartments,
  fetchDesignations,
} from "../services/api";

interface UseEmployeeData {
  employees: Employee[];
  users: User[];
  departments: Department[];
  designations: Designation[];
  loading: boolean;
  error: string | null;
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  setUsers: Dispatch<SetStateAction<User[]>>;
}

export const useEmployeeData = (): UseEmployeeData => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [employeeData, userData, deptData, desigData] = await Promise.all(
          [
            fetchEmployees(),
            fetchUsers(),
            fetchDepartments(),
            fetchDesignations(),
          ]
        );

        setEmployees(employeeData);
        setUsers(userData);
        setDepartments(deptData);
        setDesignations(desigData);
      } catch (err) {
        setError("Failed to load initial data. Please try again.");
        toast.error("Failed to load initial data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    employees,
    users,
    departments,
    designations,
    loading,
    error,
    setEmployees,
    setUsers,
  };
};
