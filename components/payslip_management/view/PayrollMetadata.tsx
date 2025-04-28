import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Payslip } from "@/types/payslip";
import { format } from "date-fns";

interface PayrollMetadataProps {
  payslip: Payslip;
}

export const PayrollMetadata: React.FC<PayrollMetadataProps> = ({ payslip }) => {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
              <TableHead className="py-2 px-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700">PAY DATE</TableHead>
              <TableHead className="py-2 px-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700">PAY TYPE</TableHead>
              <TableHead className="py-2 px-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700">PERIOD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300">
                {payslip.payroll_cycle?.pay_date
                  ? format(new Date(payslip.payroll_cycle.pay_date), "dd/MM/yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300">
                {payslip.salary?.pay_period || "N/A"}
              </TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300">
                {payslip.payroll_cycle
                  ? `${format(new Date(payslip.payroll_cycle.start_date), "MMM dd")} - ${format(new Date(payslip.payroll_cycle.end_date), "MMM dd")}`
                  : "N/A"}
              </TableCell>
            </TableRow>
            <TableRow className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700">
              <TableHead className="py-2 px-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700">PAYROLL #</TableHead>
              <TableHead className="py-2 px-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700">SSS NUMBER</TableHead>
              <TableHead className="py-2 px-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700">TIN</TableHead>
            </TableRow>
            <TableRow className="bg-gray-100 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300">{payslip.id}</TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300">{payslip.employee?.sss_id ?? 'N/A'}</TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300">{payslip.employee?.tin ?? 'N/A'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="mt-2 text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Payment Method: </span>
          {payslip.payment_method || "N/A"}
        </div>
      </CardContent>
    </Card>
  );
};