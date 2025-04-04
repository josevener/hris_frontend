import { PayrollConfigList } from "@/components/payroll_configuration/PayrollConfigList";
import { PayrollCycleList } from "@/components/payroll_cycle/PayrollCycleList";

export default function PayrollCyclePage() {
  return (
    <div className="container mx-auto px-6 py-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payroll Configurations
        </h2>
        <PayrollConfigList />
      </section>
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payroll Cycles
        </h2>
        <PayrollCycleList />
      </section>
    </div>
  );
}