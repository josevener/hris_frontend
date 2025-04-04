import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Payroll } from "@/types/payroll";
import { UserRole } from "@/types/employee";
import { PenBoxIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface PayrollDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: Payroll | null;
  userRole: UserRole;
  onEdit?: (payroll: Payroll) => void;
  onDelete?: (payroll: Payroll) => void;
}

const formatCurrency = (value: number | undefined | null): string => {
  return (value ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: value && value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date: string | Date | undefined): string => {
  return date
    ? format(new Date(date), "MMMM dd, yyyy")
    : "N/A";
};

const PayrollDetails: React.FC<PayrollDetailsProps> = ({
  onOpenChange,
  payroll,
  userRole,
  onEdit,
  onDelete,
}) => {
  if (!payroll) {
    return (
      <DialogContent className="max-w-xl w-full p-6 bg-white dark:bg-gray-800 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Payroll Details
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            No payroll data available.
          </DialogDescription>
        </DialogHeader>
        <CardFooter className="flex justify-end p-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="text-gray-700 dark:text-gray-200"
          >
            Close
          </Button>
        </CardFooter>
      </DialogContent>
    );
  }

  const payrollPeriod = payroll.payroll_cycle
    ? `${formatDate(payroll.payroll_cycle.start_date)} - ${formatDate(payroll.payroll_cycle.end_date)}`
    : "N/A";

  return (
    <DialogContent className="max-w-2xl w-full p-6 bg-white dark:bg-gray-800 rounded-lg">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Payroll Details
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">
          Detailed payroll information for {payroll.employee?.user?.firstname || "the selected employee"}.
        </DialogDescription>
      </DialogHeader>

      <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg">
        <CardContent className="space-y-4 p-6 text-gray-700 dark:text-gray-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Employee No:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {payroll.employee?.user?.company_id_number || "N/A"}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Employee Name:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {[payroll.employee?.user?.firstname, payroll.employee?.user?.middlename, payroll.employee?.user?.lastname, payroll.employee?.user?.extension]
                  .filter(Boolean)
                  .join(" ") || "N/A"}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Payroll Period:</span>
              <span className="text-gray-900 dark:text-gray-100">{payrollPeriod}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Pay Date:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatDate(payroll.payroll_cycle?.pay_date)}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Status:</span>
              <span
                className={`capitalize font-medium ${
                  payroll.status === "paid"
                    ? "text-green-600 dark:text-green-400"
                    : payroll.status === "pending"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : payroll.status === "processed"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {payroll.status || "N/A"}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Basic Salary:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatCurrency(payroll.salary?.basic_salary)}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Total Earnings:</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {formatCurrency(payroll.total_earnings)}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Total Deductions:</span>
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {formatCurrency(payroll.total_deductions)}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Net Salary:</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold text-lg">
                {formatCurrency(payroll.net_salary)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Close
          </Button>
          {(userRole === "HR" || userRole === "Admin") && onDelete && (
            <Button
              onClick={() => {
                onDelete(payroll);
                onOpenChange(false);
              }}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
          {(userRole === "HR" || userRole === "Admin") && onEdit && (
            <Button
              onClick={() => {
                onEdit(payroll);
                onOpenChange(false);
              }}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2"
            >
              <PenBoxIcon className="h-4 w-4" /> Edit Payroll
            </Button>
          )}
        </CardFooter>
      </Card>
    </DialogContent>
  );
};

export default PayrollDetails;