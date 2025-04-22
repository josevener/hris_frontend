import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Payslip } from "@/types/payslip";
import { format } from "date-fns";

interface PayslipFormProps {
  payslip: Payslip;
  onCancel: () => void;
}

const PayslipForm: React.FC<PayslipFormProps> = ({ payslip, onCancel }) => {
  console.log("PayslipForm payslip:", payslip);

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return numValue.toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getFullName = () =>
    payslip.employee?.user
      ? `${payslip.employee.user.firstname} ${payslip.employee.user.middlename ? payslip.employee.user.middlename[0] + "." : ""} ${payslip.employee.user.lastname}`.trim()
      : `Employee #${payslip.employee_id}`;

  const getPayrollPeriod = () =>
    payslip.payroll_cycle
      ? `${format(new Date(payslip.payroll_cycle.start_date), "MMMM dd")} - ${format(new Date(payslip.payroll_cycle.end_date), "MMMM dd, yyyy")}`
      : "N/A";

  return (
    <DialogContent className="sm:max-w-[800px] w-[80vw] bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-foreground">Payslip Details</DialogTitle>
        <DialogDescription className="text-muted-foreground dark:text-gray-300">
          View the details of the payslip.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 grid-cols-6">
        <div className="col-span-3 flex flex-col gap-2">
          <Label htmlFor="employee" className="text-foreground dark:text-foreground">Employee</Label>
          <Input
            id="employee"
            value={getFullName()}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-3 flex flex-col gap-2">
          <Label htmlFor="payroll_period" className="text-foreground dark:text-foreground">Payroll Period</Label>
          <Input
            id="payroll_period"
            value={getPayrollPeriod()}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="issued_date" className="text-foreground dark:text-foreground">Issued Date</Label>
          <Input
            id="issued_date"
            value={payslip.issued_date ? format(new Date(payslip.issued_date), "MMMM dd, yyyy") : "N/A"}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="payment_method" className="text-foreground dark:text-foreground">Payment Method</Label>
          <Input
            id="payment_method"
            value={payslip.payment_method || "N/A"}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="basic_salary" className="text-foreground dark:text-foreground">Basic Salary</Label>
          <Input
            id="basic_salary"
            value={payslip.salary ? formatCurrency(payslip.salary.basic_salary) : "N/A"}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="earnings" className="text-foreground dark:text-foreground">Total Earnings</Label>
          <Input
            id="earnings"
            value={formatCurrency(payslip.earnings)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="deductions" className="text-foreground dark:text-foreground">Total Deductions</Label>
          <Input
            id="deductions"
            value={formatCurrency(payslip.deductions)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="gross_salary" className="text-foreground dark:text-foreground">Gross Salary</Label>
          <Input
            id="gross_salary"
            value={formatCurrency(payslip.gross_salary)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="net_salary" className="text-foreground dark:text-foreground">Net Salary</Label>
          <Input
            id="net_salary"
            value={formatCurrency(payslip.net_salary)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PayslipForm;