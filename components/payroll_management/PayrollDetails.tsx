import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Payroll } from "@/types/payroll";
import { UserRole } from "@/types/employee";
import { PenBoxIcon, Trash, Trash2, Trash2Icon, TrashIcon } from "lucide-react";

interface PayrollDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: Payroll | null;
  userRole: UserRole;
  onEdit?: (payroll: Payroll) => void; // Optional callback for edit action
  onDelete?: (payroll: Payroll) => void; // Optional callback for delete action
}

const PayrollDetails: React.FC<PayrollDetailsProps> = ({
  onOpenChange,
  payroll,
  userRole,
  onEdit,
  onDelete,
}) => {
  return (
    <DialogContent className="max-w-xl w-full p-6 bg-white dark:bg-gray-800 rounded-lg">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Payroll Details
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">
          Detailed payroll information for the selected employee.
        </DialogDescription>
      </DialogHeader>

      {payroll && (
        <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg">
          <CardContent className="space-y-4 p-6 text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 gap-3">
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
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Pay Date:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {payroll.pay_date
                    ? new Date(payroll.pay_date).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Status:</span>
                <span
                  className={`text-gray-900 dark:text-gray-100 capitalize font-medium ${
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
                  {(payroll.salary?.basic_salary ?? 0).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Total Earnings:</span>
                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                  {(payroll.total_earnings ?? 0).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Total Deductions:</span>
                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                  {(payroll.total_deductions ?? 0).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Net Salary:</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold text-lg">
                  {(payroll.net_salary ?? 0).toLocaleString("en-US", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
                  onOpenChange(false); // Close dialog after delete
                }}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              >
                <Trash2 className="h-4 w-3"/> Delete
              </Button>
            )}
            {(userRole === "HR" || userRole === "Admin") && onEdit && (
              <Button
                onClick={() => {
                  onEdit(payroll);
                  onOpenChange(false);
                }}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                <PenBoxIcon className="h-4 w-3"/> Edit Payroll
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </DialogContent>
  );
};

export default PayrollDetails;