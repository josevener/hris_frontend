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
    className="w-[80px] dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center"
  >
    <Eye className="h-2 w-2" /> View
  </Button>
);

export default PayrollActions;