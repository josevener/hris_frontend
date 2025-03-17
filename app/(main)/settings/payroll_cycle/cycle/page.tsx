import { PayrollCycleCreate } from "@/components/payroll_cycle_management/PayrollCycleCreate";
import { PayrollCycleList } from "@/components/payroll_cycle_management/PayrollCycleList";

export default function PayrollCyclePage() {
  return (
    <div className="p-6">
      <PayrollCycleCreate />
      <PayrollCycleList />
    </div>
  );
}