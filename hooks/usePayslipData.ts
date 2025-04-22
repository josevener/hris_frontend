import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Payslip } from "@/types/payslip";
import { fetchPayslips } from "@/services/api/apiPayslip";
import { useAuth } from "@/lib/AuthContext";

interface UsePayslipData {
  payslips: Payslip[];
  loading: boolean;
  error: string | null;
  setPayslips: Dispatch<SetStateAction<Payslip[]>>;
}

export const usePayslipData = (): UsePayslipData => {
  const { token, user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const payslipData = await fetchPayslips(token);
        console.log("Raw payslipData:", payslipData);
        console.log("User:", user);
        const filteredPayslips =
          user?.role_name === "Employee"
            ? payslipData.filter((p) => {
                const matches = p.employee_id === user.employee_id;
                console.log(
                  `Payslip ID ${p.id}: employee_id=${p.employee_id}, user.employee_id=${user.employee_id}, matches=${matches}`
                );
                return matches;
              })
            : payslipData;
        console.log("Filtered payslips:", filteredPayslips);
        if (user?.role_name === "Employee" && !user?.employee_id) {
          console.warn(
            "Warning: user.employee_id is undefined for Employee role"
          );
          setError("Unable to filter payslips: user employee ID is missing.");
          toast.error("Cannot display payslips: user configuration error.");
        }
        setPayslips(filteredPayslips);
      } catch (err) {
        setError("Failed to load payslips. Please try again.");
        toast.error("Failed to load payslips");
        console.error("Error fetching payslips:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token, user]);

  return {
    payslips,
    loading,
    error,
    setPayslips,
  };
};
