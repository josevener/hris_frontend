import { useState, useEffect } from "react";
import {
  createPayrollItem,
  deletePayrollItem,
  fetchPayrollItems,
  updatePayrollItem,
} from "@/services/api/apiPayrollItem";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { fetchPayrolls } from "@/services/api/apiPayroll";
import { toast } from "sonner";
import { Payroll, PayrollItem } from "@/types/payroll";
import { Employee } from "@/types/salary";

export const usePayrollItemData = () => {
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [payrollItemData, employeeData, payrollData] = await Promise.all([
          fetchPayrollItems(),
          fetchEmployees(),
          fetchPayrolls(),
        ]);

        console.log("Fetched payroll items:", payrollItemData);
        console.log("Fetched employees:", employeeData);
        console.log("Fetched payrolls:", payrollData);

        // Enrich payroll items with employee and payroll data
        const enrichedPayrollItems = payrollItemData.map((item) => ({
          ...item,
          employee: employeeData.find((emp) => emp.id === item.employee_id),
          payroll: payrollData.find((p) => p.id === item.payroll_id),
        }));

        setPayrollItems(enrichedPayrollItems);
        setEmployees(employeeData);
        setPayrolls(payrollData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payroll item data.");
        toast.error(err.message || "Failed to fetch payroll item data.");
        console.error("Error fetching payroll item data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addPayrollItem = async (payrollItem: Partial<PayrollItem>) => {
    try {
      const newPayrollItem = await createPayrollItem(payrollItem);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees();
      const payrollData = await fetchPayrolls();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: employeeData.find((emp) => emp.id === item.employee_id),
        payroll: payrollData.find((p) => p.id === item.payroll_id),
      }));
      setPayrollItems(enrichedPayrollItems);
      return newPayrollItem;
    } catch (err: any) {
      setError(err.message || "Failed to add payroll item.");
      toast.error(err.message || "Failed to add payroll item.");
      console.error("Error adding payroll item:", err);
      throw err;
    }
  };

  const editPayrollItem = async (
    id: number,
    payrollItem: Partial<PayrollItem>
  ) => {
    try {
      await updatePayrollItem(id, payrollItem);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees();
      const payrollData = await fetchPayrolls();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: employeeData.find((emp) => emp.id === item.employee_id),
        payroll: payrollData.find((p) => p.id === item.payroll_id),
      }));
      setPayrollItems(enrichedPayrollItems);
    } catch (err: any) {
      setError(err.message || "Failed to edit payroll item.");
      toast.error(err.message || "Failed to edit payroll item.");
      console.error("Error editing payroll item:", err);
    }
  };

  const removePayrollItem = async (id: number) => {
    try {
      await deletePayrollItem(id);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees();
      const payrollData = await fetchPayrolls();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: employeeData.find((emp) => emp.id === item.employee_id),
        payroll: payrollData.find((p) => p.id === item.payroll_id),
      }));
      setPayrollItems(enrichedPayrollItems);
    } catch (err: any) {
      setError(err.message || "Failed to remove payroll item.");
      toast.error(err.message || "Failed to remove payroll item.");
      console.error("Error removing payroll item:", err);
    }
  };

  return {
    payrollItems,
    employees,
    payrolls,
    loading,
    error,
    setPayrollItems,
    addPayrollItem,
    editPayrollItem,
    removePayrollItem,
  };
};
