import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Payslip } from "@/types/payslip";

interface EarningsItem {
  desc: string;
  hours: string;
  rate: string;
  current: string;
  ytd: string;
}

interface EarningsTableProps {
  payslip: Payslip;
  earningsItems: EarningsItem[];
  formatCurrency: (value: number | string) => string;
}

export const EarningsTable: React.FC<EarningsTableProps> = ({ payslip, earningsItems, formatCurrency }) => {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-blue-600 text-white rounded-t p-3">
        <CardTitle className="text-sm font-semibold text-center">EARNINGS</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="border border-gray-300">
          <TableHeader>
            <TableRow className="bg-white text-gray-900 dark:text-gray-100 hover:bg-white">
              <TableHead className="py-2 px-3 text-left bg-white hover:bg-white">DESCRIPTION</TableHead>
              <TableHead className="py-2 px-3 text-left bg-white hover:bg-white">HOURS</TableHead>
              <TableHead className="py-2 px-3 text-left bg-white hover:bg-white">RATE</TableHead>
              <TableHead className="py-2 px-3 text-left bg-white hover:bg-white">CURRENT</TableHead>
              <TableHead className="py-2 px-3 text-left bg-white hover:bg-white">YTD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-white hover:bg-white">
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">Basic Pay</TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">40</TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">
                {formatCurrency(payslip.salary?.basic_salary || 0)}
              </TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">
                {formatCurrency(payslip.salary?.basic_salary || 0)}
              </TableCell>
              <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">N/A</TableCell>
            </TableRow>
            {earningsItems.map((item, index) => (
              <TableRow key={index} className="bg-white hover:bg-white">
                <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">{item.desc}</TableCell>
                <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">{item.hours}</TableCell>
                <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">{item.rate}</TableCell>
                <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">{item.current}</TableCell>
                <TableCell className="py-2 px-3 text-gray-700 dark:text-gray-300 bg-white hover:bg-white">{item.ytd}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-white text-gray-900 dark:text-gray-100 font-semibold hover:bg-white">
              <TableCell colSpan={2} className="py-2 px-3 bg-white hover:bg-white"></TableCell>
              <TableCell className="py-2 px-3 bg-white hover:bg-white">GROSS PAY</TableCell>
              <TableCell className="py-2 px-3 text-sm bg-white hover:bg-white">
                {formatCurrency(payslip.gross_salary)}
              </TableCell>
              <TableCell className="py-2 px-3 bg-white hover:bg-white">N/A</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};