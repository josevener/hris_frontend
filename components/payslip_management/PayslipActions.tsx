import { Button } from "@/components/ui/button";
import { Payslip } from "@/types/payslip";
import { Eye } from "lucide-react";
import Link from "next/link";

interface PayslipActionsProps {
  payslip: Payslip;
}

const PayslipActions: React.FC<PayslipActionsProps> = ({ payslip }) => {
  const viewUrl = `/view/${payslip.id}`;
  console.log("PayslipActions: Navigating to", viewUrl);

  return (
    <Link href={viewUrl} target="_blank">
      <Button
        className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
      >
        <Eye className="h-4 w-4" /> View
      </Button>
    </Link>
  );
};

export default PayslipActions;