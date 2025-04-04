import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Employee } from "@/types/employee";
import { Salary, Payroll, PayrollItem, PayrollCycle } from "@/types/payroll";
import { useAuth } from "@/lib/AuthContext";
import { fetchPayrolls } from "@/services/api/apiPayroll";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { fetchSalaries } from "@/services/api/apiSalary";
import { fetchPayrollCycles } from "@/services/api/apiPayrollCycle";

interface UsePayrollData {
  payrolls: Payroll[];
  employees: Employee[];
  salaries: Salary[];
  payrollItems: PayrollItem[];
  payrollCycles: PayrollCycle[];
  loading: boolean;
  error: string | null;
  setPayrolls: React.Dispatch<React.SetStateAction<Payroll[]>>;
}

export const usePayrollData = (): UsePayrollData => {
  const { token } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [payrollResponse, employeeData, salaryData, cycleData] =
          await Promise.all([
            fetchPayrolls(1, 10),
            fetchEmployees(token),
            fetchSalaries(),
            fetchPayrollCycles(1, 100),
          ]);

        // Enrich payrolls with payroll_cycle (salary and payroll_items are already included)
        const enrichedPayrolls = payrollResponse.data.map((payroll) => ({
          ...payroll,
          payroll_cycle: (cycleData.cycles || cycleData).find(
            (cycle) => cycle.id === payroll.payroll_cycles_id
          ),
        }));

        setPayrolls(enrichedPayrolls);
        setEmployees(employeeData);
        setSalaries(salaryData);
        setPayrollItems(enrichedPayrolls.flatMap((p) => p.payroll_items || []));
        setPayrollCycles(cycleData.cycles || cycleData);
      } catch (err: any) {
        setError("Failed to load payroll data. Please try again.");
        toast.error("Failed to load payroll data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  return {
    payrolls,
    employees,
    salaries,
    payrollItems,
    payrollCycles,
    loading,
    error,
    setPayrolls,
  };
};
