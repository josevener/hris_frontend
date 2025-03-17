"use client";

import { useState, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Employee } from "@/types/employee";
import { Salary } from "@/types/salary";
import { Payroll, PayrollItem } from "@/types/payroll";
import { format } from "date-fns";

interface PayrollFormProps {
  payroll: Partial<Payroll>;
  employees: Employee[];
  salaries: Salary[];
  payrollItems: PayrollItem[];
  onChange: (updatedPayroll: Partial<Payroll>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
}

interface LocalPayroll extends Partial<Payroll> {
  selectedPeriod?: string;
}

const PayrollForm: React.FC<PayrollFormProps> = ({
  payroll,
  employees,
  salaries,
  payrollItems,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
}) => {
  const [localPayroll, setLocalPayroll] = useState<LocalPayroll>(payroll);

  const getFullName = (employee: Employee): string => {
    const user = employee.user;
    return user
      ? `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim()
      : `Employee #${employee.id}`;
  };

  const currentEmployeeName = () => {
    if (localPayroll.employee) return getFullName(localPayroll.employee);
    const employee = employees.find((emp) => emp.id === localPayroll.employee_id);
    return employee ? getFullName(employee) : `Employee #${localPayroll.employee_id || "Unknown"}`;
  };

  // Compute unique payroll periods from all PayrollItems
  const payrollPeriods = useMemo(() => {
    console.log("All Payroll Items for Periods:", payrollItems);
    const periods = new Set<string>();
    payrollItems.forEach((item) => {
      if (item.start_date && item.end_date) {
        const period = `${format(new Date(item.start_date), "MMM dd, yyyy")} to ${format(new Date(item.end_date), "MMM dd, yyyy")}`;
        periods.add(period);
      } else {
        console.warn(`PayrollItem ID ${item.id} missing start_date or end_date:`, item);
      }
    });

    const periodOptions = Array.from(periods).map((period, index) => ({
      id: index.toString(),
      value: period,
    }));
    console.log("Computed Periods:", periodOptions);
    return periodOptions;
  }, [payrollItems]);

  const calculatedTotals = useMemo(() => {
    console.log("Selected Employee ID:", localPayroll.employee_id);
    console.log("Selected Period:", localPayroll.selectedPeriod);
    const employeeSalary = salaries.find((s) => s.employee_id === localPayroll.employee_id);
    const basicSalary = employeeSalary?.basic_salary || 0;

    // Filter items by selected period, including both specific and global scope
    const itemsForPeriod = localPayroll.selectedPeriod
      ? payrollItems.filter((item) => {
          if (item.start_date && item.end_date) {
            const period = `${format(new Date(item.start_date), "MMM dd, yyyy")} to ${format(new Date(item.end_date), "MMM dd, yyyy")}`;
            // Include items for this employee (specific) or global items (employee_id: null, scope: "global")
            return period === localPayroll.selectedPeriod && 
                   (item.employee_id === localPayroll.employee_id || item.scope === "global");
          }
          return false;
        })
      : [];

    console.log("Items for Period (specific + global):", itemsForPeriod);

    const earningsItems = itemsForPeriod.filter((item) => item.type === "earning");
    const deductionsItems = itemsForPeriod.filter((item) => item.type === "deduction");

    console.log("Earnings Items:", earningsItems);
    console.log("Deductions Items:", deductionsItems);

    const totalEarnings = earningsItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalDeductions = deductionsItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const netSalary = (Number(basicSalary) + totalEarnings) - totalDeductions;

    console.log("Calculated Totals:", { basicSalary, totalEarnings, totalDeductions, netSalary });

    return {
      basic_salary: basicSalary,
      total_earnings: totalEarnings,
      total_deductions: totalDeductions,
      net_salary: netSalary,
    };
  }, [localPayroll.employee_id, localPayroll.selectedPeriod, salaries, payrollItems]);

  const handleEmployeeChange = (value: string) => {
    const employeeId = Number(value);
    const employeeSalary = salaries.find((s) => s.employee_id === employeeId);
    setLocalPayroll((prev) => ({
      ...prev,
      employee_id: employeeId,
      salary_id: employeeSalary?.id || 0,
    }));
  };

  const handlePeriodChange = (value: string) => {
    setLocalPayroll((prev) => ({
      ...prev,
      selectedPeriod: value,
    }));
  };

  const handleSave = () => {
    if (
      !localPayroll.employee_id ||
      !localPayroll.pay_date?.trim() ||
      !localPayroll.pay_date.toString().trim() || 
      !localPayroll.status?.trim() ||
      !localPayroll.salary_id
    ) {
      toast.error("All fields are required, including a valid employee with a salary!");
      return;
    }
    const pay = new Date(localPayroll.pay_date);
    if (isNaN(pay.getTime())) {
      toast.error("Invalid pay date format!");
      return;
    }
    const { selectedPeriod, ...payload } = localPayroll;
    payload.total_earnings = calculatedTotals.total_earnings;
    payload.total_deductions = calculatedTotals.total_deductions;
    payload.net_salary = calculatedTotals.net_salary;

    console.log("Saving payload:", payload);
    onChange(payload);
    onSave();
  };

  return (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEditMode ? "Edit Payroll" : "Add New Payroll"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Modify the payroll details below."
            : "Fill in the details to create a new payroll. Add items to adjust earnings and deductions."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {/* Employee */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="employee" className="text-sm font-medium">Employee *</Label>
          <Select
            onValueChange={handleEmployeeChange}
            value={localPayroll.employee_id ? localPayroll.employee_id.toString() : ""}
            disabled={isEditMode}
          >
            <SelectTrigger className="w-full">
              {isEditMode ? <span>{currentEmployeeName()}</span> : <SelectValue placeholder="Choose an employee" />}
            </SelectTrigger>
            <SelectContent>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {getFullName(employee)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No employees available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Payroll Period Selection */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="payroll_period" className="text-sm font-medium">Payroll Period</Label>
          <Select
            onValueChange={handlePeriodChange}
            value={localPayroll.selectedPeriod || ""}
            disabled={payrollPeriods.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={payrollPeriods.length > 0 ? "Select a period" : "No periods available"} />
            </SelectTrigger>
            <SelectContent>
              {payrollPeriods.length > 0 ? (
                payrollPeriods.map((period) => (
                  <SelectItem key={period.id} value={period.value}>
                    {period.value}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No payroll items with periods</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Pay Date and Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="pay_date" className="text-sm font-medium">Pay Date *</Label>
            <Input
              id="pay_date"
              type="date"
              value={localPayroll.pay_date || ""}
              onChange={(e) => setLocalPayroll((prev) => ({ ...prev, pay_date: e.target.value }))}
              className="w-full"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
            <Select
              onValueChange={(value) => setLocalPayroll((prev) => ({ ...prev, status: value as Payroll["status"] }))}
              value={localPayroll.status || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Earnings and Deductions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="total_earnings" className="text-sm font-medium">Total Earnings</Label>
            <Input
              id="total_earnings"
              type="number"
              value={calculatedTotals.total_earnings || 0}
              className="w-full bg-gray-100"
              disabled
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="total_deductions" className="text-sm font-medium">Total Deductions</Label>
            <Input
              id="total_deductions"
              type="number"
              value={calculatedTotals.total_deductions || 0}
              className="w-full bg-gray-100"
              disabled
            />
          </div>
        </div>

         {/* Basic and Net */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="basic_salary" className="text-sm font-medium">Basic Salary</Label>
            <Input
              id="basic_salary"
              type="number"
              value={calculatedTotals.basic_salary || 0}
              className="w-full bg-gray-100"
              disabled
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="net_salary" className="text-sm font-medium">Net Salary</Label>
            <Input
              id="net_salary"
              type="number"
              value={calculatedTotals.net_salary || 0}
              className="w-full bg-gray-100"
              disabled
            />
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="px-4 py-2 text-sm">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm flex items-center"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PayrollForm;