import React from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Salary } from "@/types/salary";
import { UserRole } from "@/types/employee";
import { PenBoxIcon } from "lucide-react";

interface SalaryDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  salary: Salary | null;
  userRole: UserRole;
  onEdit?: (salary: Salary) => void;
  onDelete?: (salary: Salary) => void;
}

const SalaryDetails: React.FC<SalaryDetailsProps> = ({
  onOpenChange,
  salary,
  userRole,
  onEdit,
}) => {
  const formatCurrency = (amount: number | undefined) =>
    (amount ?? 0).toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date: string | undefined) =>
    date
      ? new Date(date).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

  return (
    <DialogContent className="max-w-xl w-full p-6 bg-white dark:bg-gray-800 rounded-lg">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Salary Details
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400">
          Detailed salary information for the selected employee.
        </DialogDescription>
      </DialogHeader>

      {salary && (
        <Card className="w-full border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg">
          <CardContent className="space-y-4 p-6 text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Employee No:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {salary.employee?.user?.company_id_number || "N/A"}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Employee Name:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {[salary.employee?.user?.firstname, salary.employee?.user?.middlename, salary.employee?.user?.lastname, salary.employee?.user?.extension]
                    .filter(Boolean)
                    .join(" ") || "N/A"}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Basic Salary:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(salary.basic_salary)}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Pay Period:</span>
                <span className="text-gray-900 dark:text-gray-100 capitalize">
                  {salary.pay_period || "N/A"}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">Start Date:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatDate(salary.start_date)}
                </span>
              </div>

              {/* <div className="flex items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300 w-40">End Date:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatDate(salary.end_date?.toString())}
                </span>
              </div> */}
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
            {/* {(userRole === "HR" || userRole === "Admin") && onDelete && (
              <Button
                onClick={() => {
                  onDelete(salary);
                  onOpenChange(false);
                }}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )} */}
            {(userRole === "HR" || userRole === "Admin") && onEdit && (
              <Button
                onClick={() => {
                  onEdit(salary);
                  onOpenChange(false);
                }}
                variant="default"
                className="bg-primary hover:bg-gray-700 text-white dark:bg-secondary dark:hover:bg-gray-900"
              >
                <PenBoxIcon className="h-4 w-4 mr-2" /> Edit Salary
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </DialogContent>
  );
};

export default SalaryDetails;