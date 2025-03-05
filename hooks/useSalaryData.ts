import { useState, useEffect } from "react";
import {
  createSalary,
  deleteSalary,
  fetchSalaries,
  updateSalary,
} from "@/services/api/apiSalary";
import { fetchEmployees } from "@/services/api/apiEmployee"; // Use all employees
import { Employee, Salary } from "@/types/salary";
import { toast } from "sonner";

export const useSalaryData = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [salaryData, employeeData] = await Promise.all([
          fetchSalaries(),
          fetchEmployees(), // Fetch all employees
        ]);

        console.log("Fetched salaries:", salaryData);
        console.log("Fetched employees:", employeeData);

        // Enrich salaries with employee data
        const enrichedSalaries = salaryData.map((salary) => ({
          ...salary,
          employee: employeeData.find((emp) => emp.id === salary.employee_id),
        }));

        setSalaries(enrichedSalaries);
        setEmployees(
          employeeData.filter(
            (emp) => !enrichedSalaries.some((sal) => sal.employee_id === emp.id)
          )
        );
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
        toast.error(err.message || "Failed to fetch data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addSalary = async (salary: Partial<Salary>) => {
    try {
      const newSalary = await createSalary(salary);
      const updatedSalaries = await fetchSalaries(); // Refresh full list
      const employeeData = await fetchEmployees();
      const enrichedSalaries = updatedSalaries.map((sal) => ({
        ...sal,
        employee: employeeData.find((emp) => emp.id === sal.employee_id),
      }));
      setSalaries(enrichedSalaries);
      setEmployees(
        employeeData.filter(
          (emp) => !enrichedSalaries.some((sal) => sal.employee_id === emp.id)
        )
      );
      return newSalary; // Return for use in SalaryList
    } catch (err: any) {
      setError(err.message || "Failed to add salary.");
      toast.error(err.message || "Failed to add salary.");
      console.error("Error adding salary:", err);
      throw err;
    }
  };

  const editSalary = async (id: number, salary: Partial<Salary>) => {
    try {
      await updateSalary(id, salary);
      const updatedSalaries = await fetchSalaries();
      const employeeData = await fetchEmployees();
      const enrichedSalaries = updatedSalaries.map((sal) => ({
        ...sal,
        employee: employeeData.find((emp) => emp.id === sal.employee_id),
      }));
      setSalaries(enrichedSalaries);
      setEmployees(
        employeeData.filter(
          (emp) => !enrichedSalaries.some((sal) => sal.employee_id === emp.id)
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to edit salary.");
      toast.error(err.message || "Failed to edit salary.");
      console.error("Error editing salary:", err);
    }
  };

  const removeSalary = async (id: number) => {
    try {
      await deleteSalary(id);
      const updatedSalaries = await fetchSalaries();
      const employeeData = await fetchEmployees();
      const enrichedSalaries = updatedSalaries.map((sal) => ({
        ...sal,
        employee: employeeData.find((emp) => emp.id === sal.employee_id),
      }));
      setSalaries(enrichedSalaries);
      setEmployees(
        employeeData.filter(
          (emp) => !enrichedSalaries.some((sal) => sal.employee_id === emp.id)
        )
      );
    } catch (err: any) {
      setError(err.message || "Failed to remove salary.");
      toast.error(err.message || "Failed to remove salary.");
      console.error("Error removing salary:", err);
    }
  };

  return {
    salaries,
    employees,
    loading,
    error,
    setSalaries,
    addSalary,
    editSalary,
    removeSalary,
  };
};
