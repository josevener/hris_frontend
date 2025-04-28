import { Card, CardContent } from "@/components/ui/card";
import { Payslip } from "@/types/payslip";

interface PayslipFooterProps {
  payslip: Payslip;
}

export const PayslipFooter: React.FC<PayslipFooterProps> = ({ payslip }) => {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 text-gray-600 dark:text-gray-400">
        <div className="text-xs text-center block mt-4">
          <p className="py-1">Disclaimer: This is electronically generated; no signature required.</p>
          <p className="py-1">Copyright BFD Enterprises. All Rights Reserved. BFD Enterprises Highly Confidential.</p>
        </div>
        <div className="text-sm grid grid-cols-2 gap-4 mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If you have any questions about this payslip, please contact{" "}
            {payslip.employee?.user
              ? `${payslip.employee.user.firstname} ${payslip.employee.user.lastname}`
              : `Employee #${payslip.employee_id}`},{" "}
            {payslip.employee?.user?.phone_number || "N/A"},{" "}
            {payslip.employee?.user?.email || "N/A"}
          </p>
          <p className="font-bold text-right">Powered by: BFDE Developers</p>
        </div>
      </CardContent>
    </Card>
  );
};