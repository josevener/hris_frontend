import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Payslip } from "@/types/payslip";

interface EmployeeInfoProps {
  payslip: Payslip;
}

export const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ payslip }) => {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-blue-600 text-white rounded-t p-3">
        <CardTitle className="text-sm font-semibold">EMPLOYEE INFORMATION</CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-gray-700 dark:text-gray-300 space-y-1">
        <div className="flex">
          <span className="font-bold w-32">Name:</span>
          <span>
            {payslip.employee?.user
              ? `${payslip.employee.user.firstname} ${payslip.employee.user.middlename ? payslip.employee.user.middlename[0] + "." : ""} ${payslip.employee.user.lastname}`
              : `Employee #${payslip.employee_id}`}
          </span>
        </div>
        <div className="flex">
          <span className="font-bold w-32">Employee ID:</span>
          <span>{payslip.employee?.company_id_number}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-32">Phone Number:</span>
          <span>{payslip.employee?.user?.phone_number || "N/A"}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-32">Email:</span>
          <span>{payslip.employee?.user?.email || "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
};