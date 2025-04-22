import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Employee } from "@/types/employee";
import { Salary, Payroll, PayrollCycle } from "@/types/payroll";
import { useAuth } from "@/lib/AuthContext";
import { fetchPayrolls } from "@/services/api/apiPayroll";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { fetchSalaries } from "@/services/api/apiSalary";
import { fetchPayrollCycles } from "@/services/api/apiPayrollCycle";

interface UsePayrollData {
  payrolls: Payroll[];
  employees: Employee[];
  salaries: Salary[];
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
            fetchPayrollCycles(1, 25),
          ]);

        const enrichedPayrolls = payrollResponse.data.map((payroll) => ({
          ...payroll,
          payroll_cycle: (cycleData.cycles || cycleData).find(
            (cycle) => cycle.id === payroll.payroll_cycles_id
          ),
        }));

        setPayrolls(enrichedPayrolls);
        setEmployees(employeeData);
        setSalaries(salaryData);
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
    payrollCycles,
    loading,
    error,
    setPayrolls,
  };
};
