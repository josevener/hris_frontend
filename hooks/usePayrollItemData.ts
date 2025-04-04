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
import { Payroll, PayrollItem, PaginatedResponse } from "@/types/payroll";
import { Employee } from "@/types/salary"; // Assuming Employee is here; adjust if needed
import { getCookie } from "@/lib/auth";

export const usePayrollItemData = () => {
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Fetch token asynchronously on mount
  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getCookie("token");
      setToken(authToken);
    };
    fetchToken();
  }, []);

  // Load data only when token is available
  useEffect(() => {
    const loadData = async () => {
      if (!token) return; // Wait for token

      try {
        setLoading(true);
        setError(null);

        const [payrollItemData, employeeData, payrollData] = await Promise.all([
          fetchPayrollItems(),
          fetchEmployees(token),
          fetchPayrolls(),
        ]);

        console.log("Fetched payroll items:", payrollItemData);
        console.log("Fetched employees:", employeeData);
        console.log("Fetched payrolls:", payrollData);

        const enrichedPayrollItems = payrollItemData.map((item) => ({
          ...item,
          employee: Array.isArray(employeeData)
            ? employeeData.find((emp) => emp.id === item.employee_id)
            : undefined,
          payroll:
            payrollData.data && item.payroll_id
              ? payrollData.data.find((p: Payroll) => p.id === item.payroll_id)
              : undefined,
        }));

        setPayrollItems(enrichedPayrollItems);
        setEmployees(Array.isArray(employeeData) ? employeeData : []);
        setPayrolls(payrollData.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payroll item data.");
        toast.error(err.message || "Failed to fetch payroll item data.");
        console.error("Error fetching payroll item data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]); // Depend on token

  const addPayrollItem = async (payrollItem: Partial<PayrollItem>) => {
    if (!token) throw new Error("No authentication token available");
    try {
      const newPayrollItem = await createPayrollItem(payrollItem);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees(token);
      const payrollData: PaginatedResponse<Payroll> = await fetchPayrolls();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: Array.isArray(employeeData)
          ? employeeData.find((emp) => emp.id === item.employee_id)
          : undefined,
        payroll:
          payrollData.data && item.payroll_id
            ? payrollData.data.find((p: Payroll) => p.id === item.payroll_id)
            : undefined,
      }));
      setPayrollItems(enrichedPayrollItems);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setPayrolls(payrollData.data || []);
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
    if (!token) throw new Error("No authentication token available");
    try {
      await updatePayrollItem(id, payrollItem);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees(token);
      const payrollData: PaginatedResponse<Payroll> = await fetchPayrolls();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: Array.isArray(employeeData)
          ? employeeData.find((emp) => emp.id === item.employee_id)
          : undefined,
        payroll:
          payrollData.data && item.payroll_id
            ? payrollData.data.find((p: Payroll) => p.id === item.payroll_id)
            : undefined,
      }));
      setPayrollItems(enrichedPayrollItems);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setPayrolls(payrollData.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to edit payroll item.");
      toast.error(err.message || "Failed to edit payroll item.");
      console.error("Error editing payroll item:", err);
      throw err;
    }
  };

  const removePayrollItem = async (id: number) => {
    if (!token) throw new Error("No authentication token available");
    try {
      await deletePayrollItem(id);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees(token);
      const payrollData: PaginatedResponse<Payroll> = await fetchPayrolls();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: Array.isArray(employeeData)
          ? employeeData.find((emp) => emp.id === item.employee_id)
          : undefined,
        payroll:
          payrollData.data && item.payroll_id
            ? payrollData.data.find((p: Payroll) => p.id === item.payroll_id)
            : undefined,
      }));
      setPayrollItems(enrichedPayrollItems);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setPayrolls(payrollData.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to remove payroll item.");
      toast.error(err.message || "Failed to remove payroll item.");
      console.error("Error removing payroll item:", err);
      throw err;
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
