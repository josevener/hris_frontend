import { useState, useEffect } from "react";
import {
  createPayrollItem,
  deletePayrollItem,
  fetchPayrollItems,
  updatePayrollItem,
} from "@/services/api/apiPayrollItem";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { fetchPayrollCycles } from "@/services/api/apiPayrollCycle";
import { toast } from "sonner";
import { PayrollItem, PayrollCycle } from "@/types/payroll";
import { Employee } from "@/types/salary";
import { getCookie } from "@/lib/auth";

export const usePayrollItemData = () => {
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getCookie("auth_token");
      setToken(authToken);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const [payrollItemData, employeeData, payrollCycleData] =
          await Promise.all([
            fetchPayrollItems(),
            fetchEmployees(token),
            fetchPayrollCycles(),
          ]);

        console.log("Fetched payroll items:", payrollItemData);
        console.log("Fetched employees:", employeeData);
        console.log("Fetched payroll cycles:", payrollCycleData);

        const enrichedPayrollItems = payrollItemData.map((item) => ({
          ...item,
          employee: Array.isArray(employeeData)
            ? employeeData.find((emp) => emp.id === item.employee_id)
            : undefined,
        }));

        setPayrollItems(enrichedPayrollItems);
        setEmployees(Array.isArray(employeeData) ? employeeData : []);
        setPayrollCycles(payrollCycleData.cycles || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payroll item data.");
        toast.error(err.message || "Failed to fetch payroll item data.");
        console.error("Error fetching payroll item data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const addPayrollItem = async (payrollItem: Partial<PayrollItem>) => {
    if (!token) throw new Error("No authentication token available");
    try {
      const payload = {
        employee_id:
          payrollItem.scope === "global" ? null : payrollItem.employee_id,
        payroll_cycles_id: payrollItem.payroll_cycles_id,
        scope: payrollItem.scope,
        type: payrollItem.type,
        category: payrollItem.category,
        amount: payrollItem.amount,
      };
      const newPayrollItem = await createPayrollItem(payload);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees(token);
      const payrollCycleData = await fetchPayrollCycles();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: Array.isArray(employeeData)
          ? employeeData.find((emp) => emp.id === item.employee_id)
          : undefined,
      }));
      setPayrollItems(enrichedPayrollItems);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setPayrollCycles(payrollCycleData.cycles || []);
      return newPayrollItem;
    } catch (err: any) {
      setError(err.message || "Failed to add payroll item.");
      toast.error(err.message || "Failed to add payroll item.");
      throw err;
    }
  };

  const editPayrollItem = async (
    id: number,
    payrollItem: Partial<PayrollItem>
  ) => {
    if (!token) throw new Error("No authentication token available");
    try {
      const payload = {
        employee_id:
          payrollItem.scope === "global" ? null : payrollItem.employee_id,
        payroll_cycles_id: payrollItem.payroll_cycles_id,
        scope: payrollItem.scope,
        type: payrollItem.type,
        category: payrollItem.category,
        amount: payrollItem.amount,
      };
      await updatePayrollItem(id, payload);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees(token);
      const payrollCycleData = await fetchPayrollCycles();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: Array.isArray(employeeData)
          ? employeeData.find((emp) => emp.id === item.employee_id)
          : undefined,
      }));
      setPayrollItems(enrichedPayrollItems);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setPayrollCycles(payrollCycleData.cycles || []);
    } catch (err: any) {
      setError(err.message || "Failed to edit payroll item.");
      toast.error(err.message || "Failed to edit payroll item.");
      throw err;
    }
  };

  const removePayrollItem = async (id: number) => {
    if (!token) throw new Error("No authentication token available");
    try {
      await deletePayrollItem(id);
      const updatedPayrollItems = await fetchPayrollItems();
      const employeeData = await fetchEmployees(token);
      const payrollCycleData = await fetchPayrollCycles();
      const enrichedPayrollItems = updatedPayrollItems.map((item) => ({
        ...item,
        employee: Array.isArray(employeeData)
          ? employeeData.find((emp) => emp.id === item.employee_id)
          : undefined,
      }));
      setPayrollItems(enrichedPayrollItems);
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setPayrollCycles(payrollCycleData.cycles || []);
    } catch (err: any) {
      setError(err.message || "Failed to remove payroll item.");
      toast.error(err.message || "Failed to remove payroll item.");
      throw err;
    }
  };

  return {
    payrollItems,
    employees,
    payrollCycles,
    loading,
    error,
    setPayrollItems,
    addPayrollItem,
    editPayrollItem,
    removePayrollItem,
  };
};
