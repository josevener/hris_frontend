import { useState, useEffect } from "react";
import {
  createPayroll,
  deletePayroll,
  fetchPayrolls,
  updatePayroll,
} from "@/services/api/apiPayroll";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { fetchSalaries } from "@/services/api/apiSalary";
import { Employee, Salary } from "@/types/salary";
import { toast } from "sonner";
import { Payroll } from "@/types/payroll";

export const usePayrollData = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [payrollData, employeeData, salaryData] = await Promise.all([
          fetchPayrolls(),
          fetchEmployees(),
          fetchSalaries(),
        ]);

        console.log("Fetched payrolls:", payrollData);
        console.log("Fetched employees:", employeeData);
        console.log("Fetched salaries:", salaryData);

        // Enrich payrolls with employee and salary data
        const enrichedPayrolls = payrollData.map((payroll) => ({
          ...payroll,
          employee: employeeData.find((emp) => emp.id === payroll.employee_id),
          salary: salaryData.find((sal) => sal.id === payroll.salary_id),
        }));

        setPayrolls(enrichedPayrolls);
        setEmployees(employeeData);
        setSalaries(salaryData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payroll data.");
        toast.error(err.message || "Failed to fetch payroll data.");
        console.error("Error fetching payroll data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addPayroll = async (payroll: Partial<Payroll>) => {
    try {
      const newPayroll = await createPayroll(payroll);
      const updatedPayrolls = await fetchPayrolls();
      const employeeData = await fetchEmployees();
      const salaryData = await fetchSalaries();
      const enrichedPayrolls = updatedPayrolls.map((p) => ({
        ...p,
        employee: employeeData.find((emp) => emp.id === p.employee_id),
        salary: salaryData.find((sal) => sal.id === p.salary_id),
      }));
      setPayrolls(enrichedPayrolls);
      return newPayroll;
    } catch (err: any) {
      setError(err.message || "Failed to add payroll.");
      toast.error(err.message || "Failed to add payroll.");
      console.error("Error adding payroll:", err);
      throw err;
    }
  };

  const editPayroll = async (id: number, payroll: Partial<Payroll>) => {
    try {
      await updatePayroll(id, payroll);
      const updatedPayrolls = await fetchPayrolls();
      const employeeData = await fetchEmployees();
      const salaryData = await fetchSalaries();
      const enrichedPayrolls = updatedPayrolls.map((p) => ({
        ...p,
        employee: employeeData.find((emp) => emp.id === p.employee_id),
        salary: salaryData.find((sal) => sal.id === p.salary_id),
      }));
      setPayrolls(enrichedPayrolls);
    } catch (err: any) {
      setError(err.message || "Failed to edit payroll.");
      toast.error(err.message || "Failed to edit payroll.");
      console.error("Error editing payroll:", err);
    }
  };

  const removePayroll = async (id: number) => {
    try {
      await deletePayroll(id);
      const updatedPayrolls = await fetchPayrolls();
      const employeeData = await fetchEmployees();
      const salaryData = await fetchSalaries();
      const enrichedPayrolls = updatedPayrolls.map((p) => ({
        ...p,
        employee: employeeData.find((emp) => emp.id === p.employee_id),
        salary: salaryData.find((sal) => sal.id === p.salary_id),
      }));
      setPayrolls(enrichedPayrolls);
    } catch (err: any) {
      setError(err.message || "Failed to remove payroll.");
      toast.error(err.message || "Failed to remove payroll.");
      console.error("Error removing payroll:", err);
    }
  };

  return {
    payrolls,
    employees,
    salaries,
    loading,
    error,
    setPayrolls,
    addPayroll,
    editPayroll,
    removePayroll,
  };
};
