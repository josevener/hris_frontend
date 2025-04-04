"use client";

import { useMemo } from "react";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Edit as EditIcon } from "lucide-react";
import { Employee, UserRole } from "@/types/employee";
import { Salary, Payroll, PayrollItem, PayrollCycle } from "@/types/payroll";
import { format } from "date-fns";

interface PayrollFormProps {
  payroll: Partial<Payroll>;
  employees: Employee[];
  salaries: Salary[];
  payrollItems: PayrollItem[];
  payrollCycles: PayrollCycle[];
  onChange: (updatedPayroll: Partial<Payroll>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  userRole: UserRole;
  isEditMode?: boolean;
  isEditable?: boolean;
  setIsEditable?: (value: boolean) => void;
}

const formatCurrency = (value: number | undefined | null): string => {
  return (value ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: value && value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const PayrollForm: React.FC<PayrollFormProps> = ({
  payroll,
  employees,
  salaries,
  payrollItems,
  payrollCycles,
  onChange,
  onSave,
  onCancel,
  isSaving,
  userRole,
  isEditMode = false,
  isEditable = false,
  setIsEditable,
}) => {
  const getFullName = (emp: Employee) =>
    emp.user
      ? `${emp.user.firstname} ${emp.user.middlename ? emp.user.middlename[0] + "." : ""} ${emp.user.lastname}`.trim()
      : `Employee #${emp.id}`;

  const calculatedTotals = useMemo(() => {
    const employeeSalary = salaries.find((s) => s.employee_id === payroll.employee_id) || payroll.salary;
    const basicSalary = employeeSalary?.basic_salary || 0;

    const itemsForPayroll = payroll.id
      ? payrollItems.filter((item) => item.payroll_id === payroll.id)
      : [];

    const earningsItems = itemsForPayroll.filter((item) => item.type === "earning");
    const deductionsItems = itemsForPayroll.filter((item) => item.type === "deduction");
    const contributionsItems = itemsForPayroll.filter((item) => item.type === "contribution");

    const totalEarnings = earningsItems.reduce((sum, item) => sum + Number(item.amount), basicSalary);
    const totalDeductions = deductionsItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalContributions = contributionsItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const netSalary = totalEarnings - totalDeductions - totalContributions;

    return {
      basic_salary: basicSalary,
      total_earnings: totalEarnings - basicSalary,
      total_deductions: totalDeductions,
      total_contributions: totalContributions,
      net_salary: netSalary,
      earningsItems,
      deductionsItems,
      contributionsItems,
    };
  }, [payroll.employee_id, payroll.id, salaries, payrollItems]);

  const payrollCycleOptions = useMemo(() => {
    return payrollCycles.map((cycle) => ({
      id: cycle.id.toString(),
      value: `${format(new Date(cycle.start_date), "MMM dd, yyyy")} - ${format(new Date(cycle.end_date), "MMM dd, yyyy")}`,
    }));
  }, [payrollCycles]);

  const selectedCycle = payrollCycles.find((cycle) => cycle.id === payroll.payroll_cycles_id) || payroll.payroll_cycle;
  const payrollPeriod = selectedCycle
    ? `${format(new Date(selectedCycle.start_date), "MMM dd, yyyy")} - ${format(new Date(selectedCycle.end_date), "MMM dd, yyyy")}`
    : "N/A";
  const payDate = selectedCycle ? format(new Date(selectedCycle.pay_date), "MMMM dd, yyyy") : "N/A";

  const handleEditClick = () => {
    if (setIsEditable) {
      setIsEditable(true);
    }
  };

  return (
    <DialogContent className="sm:max-w-[800px] w-[80vw] bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-foreground">
          {isEditMode ? "View/Edit Payroll" : "Add New Payroll"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground dark:text-gray-300">
          {isEditMode ? "View or update the payroll details." : "Enter the details for the new payroll."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 grid-cols-6">
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="employee_id" className="text-foreground dark:text-foreground">Employee *</Label>
          {isEditMode ? (
            <Input
              id="edit-employee_id"
              value={getFullName(employees.find((e) => e.id === payroll.employee_id) || { id: payroll.employee_id } as Employee)}
              disabled
              className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
            />
          ) : (
            <Select
              value={payroll.employee_id?.toString() || ""}
              onValueChange={(value) => {
                const employeeId = parseInt(value) || 0;
                const salary = salaries.find((s) => s.employee_id === employeeId);
                onChange({ ...payroll, employee_id: employeeId, salary_id: salary?.id });
              }}
            >
              <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {getFullName(emp)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="payroll_cycles_id" className="text-foreground dark:text-foreground">Payroll Period *</Label>
          {isEditMode && !isEditable ? (
            <Input
              id="edit-payroll_cycles_id"
              value={payrollPeriod}
              disabled
              className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
            />
          ) : (
            <Select
              value={payroll.payroll_cycles_id?.toString() || ""}
              onValueChange={(value) => onChange({ ...payroll, payroll_cycles_id: parseInt(value) || 0 })}
              disabled={!isEditable && isEditMode}
            >
              <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                <SelectValue placeholder="Select Payroll Cycle" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
                {payrollCycleOptions.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id}>
                    {cycle.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="pay_date" className="text-foreground dark:text-foreground">Pay Date</Label>
          <Input
            id="pay_date"
            value={payDate}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="status" className="text-foreground dark:text-foreground">Status *</Label>
          <Select
            value={payroll.status || "pending"}
            onValueChange={(value) => onChange({ ...payroll, status: value as Payroll["status"] })}
            disabled={!isEditable && isEditMode}
          >
            <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 dark:text-foreground dark:border-gray-600">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="basic_salary" className="text-foreground dark:text-foreground">Basic Salary</Label>
          <Input
            id="basic_salary"
            value={formatCurrency(calculatedTotals.basic_salary)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="total_earnings" className="text-foreground dark:text-foreground">Additional Earnings</Label>
          <Input
            id="total_earnings"
            value={formatCurrency(calculatedTotals.total_earnings)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="total_deductions" className="text-foreground dark:text-foreground">Total Deductions</Label>
          <Input
            id="total_deductions"
            value={formatCurrency(calculatedTotals.total_deductions)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="total_contributions" className="text-foreground dark:text-foreground">Total Contributions</Label>
          <Input
            id="total_contributions"
            value={formatCurrency(calculatedTotals.total_contributions)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label htmlFor="net_salary" className="text-foreground dark:text-foreground">Net Salary</Label>
          <Input
            id="net_salary"
            value={formatCurrency(calculatedTotals.net_salary)}
            disabled
            className="bg-gray-100 dark:bg-gray-600 dark:text-foreground dark:border-gray-500 font-semibold"
          />
        </div>
        {calculatedTotals.earningsItems.length > 0 && (
          <div className="col-span-6 flex flex-col gap-2">
            <Label className="text-foreground dark:text-foreground">Earnings Breakdown</Label>
            <div className="grid grid-cols-2 gap-2">
              {calculatedTotals.earningsItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-foreground dark:text-foreground">
                  <span>{item.category || "Unnamed Earning"}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {calculatedTotals.deductionsItems.length > 0 && (
          <div className="col-span-6 flex flex-col gap-2">
            <Label className="text-foreground dark:text-foreground">Deductions Breakdown</Label>
            <div className="grid grid-cols-2 gap-2">
              {calculatedTotals.deductionsItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-foreground dark:text-foreground">
                  <span>{item.category || "Unnamed Deduction"}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {calculatedTotals.contributionsItems.length > 0 && (
          <div className="col-span-6 flex flex-col gap-2">
            <Label className="text-foreground dark:text-foreground">Contributions Breakdown</Label>
            <div className="grid grid-cols-2 gap-2">
              {calculatedTotals.contributionsItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-foreground dark:text-foreground">
                  <span>{item.category || "Unnamed Contribution"}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <DialogFooter className="flex justify-between gap-2">
        {isEditMode && !isEditable && (
          <Button
            onClick={handleEditClick}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" /> Edit
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          {(isEditMode ? isEditable : true) && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};

export default PayrollForm;