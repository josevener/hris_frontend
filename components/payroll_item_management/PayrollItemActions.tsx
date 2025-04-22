import { Eye } from "lucide-react";
import { PayrollItem } from "@/types/payroll";
import { Button } from "../ui/button";

interface PayrollItemActionsProps {
  payrollItem: PayrollItem; 
  onView: (payrollItem: PayrollItem) => void;
}

const PayrollItemActions: React.FC<PayrollItemActionsProps> = ({
  payrollItem,
  onView,
}) => (
  <Button
    onClick={() => onView(payrollItem)}
    className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
  >
    <Eye className="h-4 w-4" /> View
  </Button>
);

export default PayrollItemActions;