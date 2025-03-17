"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Payroll, PayrollItem } from "@/types/payroll";
import { Employee } from "@/types/employee";
import { Salary } from "@/types/salary";
import {
  createPayroll,
  deletePayroll,
  fetchPayrolls,
  updatePayroll,
  fetchPayrollItemsByPayrollId,
} from "@/services/api/apiPayroll";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { fetchSalaries } from "@/services/api/apiSalary";

interface PaginatedPayrollData {
  payrolls: Payroll[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export const usePayrollData = () => {
  const [paginatedData, setPaginatedData] = useState<PaginatedPayrollData>({
    payrolls: [],
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async (page: number = 1, perPage: number = 10) => {
    setLoading(true);
    try {
      setError(null);
      const [payrollResponse, employeeData, salaryData, itemsData] =
        await Promise.all([
          fetchPayrolls(page, perPage),
          fetchEmployees(),
          fetchSalaries(),
          fetchPayrollItemsByPayrollId(), // Fetch all items initially
        ]);

      const enrichedPayrolls = payrollResponse.data.map((payroll) => {
        const employeeSalary = salaryData.find(
          (s) => s.employee_id === payroll.employee_id
        );
        const basicSalary = employeeSalary?.basic_salary || 0;
        const itemsForPayroll = itemsData.filter(
          (item) => item.payroll_id === payroll.id
        );
        const totalEarnings = itemsForPayroll
          .filter((item) => item.type === "earning")
          .reduce((sum, item) => sum + item.amount, basicSalary);
        const totalDeductions = itemsForPayroll
          .filter((item) => item.type === "deduction")
          .reduce((sum, item) => sum + item.amount, 0);
        const netSalary = totalEarnings - totalDeductions;

        return {
          ...payroll,
          total_earnings: totalEarnings,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          employee: employeeData.find((emp) => emp.id === payroll.employee_id),
          salary: employeeSalary,
        };
      });

      setPaginatedData({
        payrolls: enrichedPayrolls,
        currentPage: payrollResponse.current_page,
        lastPage: payrollResponse.last_page,
        perPage: payrollResponse.per_page,
        total: payrollResponse.total,
      });
      setEmployees(employeeData);
      setSalaries(salaryData);
      setPayrollItems(itemsData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payroll data");
      toast.error(err.message || "Failed to fetch payroll data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollItemsForPayroll = async (payrollId: number) => {
    try {
      const items = await fetchPayrollItemsByPayrollId(payrollId);
      setPayrollItems((prev) => [
        ...prev.filter((item) => item.payroll_id !== payrollId),
        ...items,
      ]);
      return items;
    } catch (err: any) {
      throw new Error(err.message || "Failed to fetch payroll items");
    }
  };

  const addPayroll = async (payroll: Partial<Payroll>) => {
    try {
      const newPayroll = await createPayroll(payroll);
      const employeeSalary = salaries.find(
        (s) => s.employee_id === newPayroll.employee_id
      );
      const enrichedPayroll = {
        ...newPayroll,
        total_earnings: employeeSalary?.basic_salary || 0, // Initially just basic salary
        total_deductions: 0,
        net_salary: employeeSalary?.basic_salary || 0,
        employee: employees.find((emp) => emp.id === newPayroll.employee_id),
        salary: employeeSalary,
      };
      setPaginatedData((prev) => ({
        ...prev,
        payrolls: [...prev.payrolls, enrichedPayroll],
        total: prev.total + 1,
      }));
      return enrichedPayroll;
    } catch (err: any) {
      throw new Error(err.message || "Failed to add payroll");
    }
  };

  const editPayroll = async (id: number, payroll: Partial<Payroll>) => {
    try {
      const updatedPayroll = await updatePayroll(id, payroll);
      const items = await fetchPayrollItemsForPayroll(id);
      const employeeSalary = salaries.find(
        (s) => s.employee_id === updatedPayroll.employee_id
      );
      const totalEarnings = items
        .filter((item) => item.type === "earning")
        .reduce(
          (sum, item) => sum + item.amount,
          employeeSalary?.basic_salary || 0
        );
      const totalDeductions = items
        .filter((item) => item.type === "deduction")
        .reduce((sum, item) => sum + item.amount, 0);
      const enrichedPayroll = {
        ...updatedPayroll,
        total_earnings: totalEarnings,
        total_deductions: totalDeductions,
        net_salary: totalEarnings - totalDeductions,
        employee: employees.find(
          (emp) => emp.id === updatedPayroll.employee_id
        ),
        salary: employeeSalary,
      };
      setPaginatedData((prev) => ({
        ...prev,
        payrolls: prev.payrolls.map((p) => (p.id === id ? enrichedPayroll : p)),
      }));
    } catch (err: any) {
      throw new Error(err.message || "Failed to update payroll");
    }
  };

  const removePayroll = async (id: number) => {
    try {
      await deletePayroll(id);
      setPaginatedData((prev) => ({
        ...prev,
        payrolls: prev.payrolls.filter((p) => p.id !== id),
        total: prev.total - 1,
      }));
      setPayrollItems((prev) => prev.filter((item) => item.payroll_id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete payroll");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    payrolls: paginatedData.payrolls,
    employees,
    salaries,
    payrollItems,
    loading,
    error,
    currentPage: paginatedData.currentPage,
    lastPage: paginatedData.lastPage,
    perPage: paginatedData.perPage,
    total: paginatedData.total,
    fetchPayrolls: fetchAllData,
    fetchPayrollItemsForPayroll,
    addPayroll,
    editPayroll,
    removePayroll,
  };
};
