import { Payroll } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PayrollActionsProps {
  payroll: Payroll;
  onView: (payroll: Payroll) => void;
}

const PayrollActions: React.FC<PayrollActionsProps> = ({ payroll, onView }) => (
  <Button
    onClick={() => onView(payroll)}
    className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
  >
    <Eye className="h-4 w-4" /> View
  </Button>
);

export default PayrollActions;