import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Employee, Salary } from "@/types/salary";
import { Payroll } from "@/types/payroll";

interface PayrollFormProps {
  payroll: Partial<Payroll>;
  employees: Employee[];
  salaries: Salary[];
  onChange: (updatedPayroll: Partial<Payroll>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
}

const PayrollForm: React.FC<PayrollFormProps> = ({
  payroll,
  employees,
  salaries,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
}) => {
  const getFullName = (employee: Employee): string => {
    const user = employee.user;
    return user
      ? `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim()
      : `Employee #${employee.id}`;
  };

  const currentEmployeeName = () => {
    if (payroll.employee) return getFullName(payroll.employee);
    const employee = employees.find((emp) => emp.id === payroll.employee_id);
    return employee ? getFullName(employee) : `Employee #${payroll.employee_id || "Unknown"}`;
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEditMode ? "Edit Payroll" : "Add New Payroll"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-3">
        {/* Employee Select */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="employee" className="text-sm font-medium">Employee *</Label>
          <Select
            onValueChange={(value) => onChange({ ...payroll, employee_id: Number(value) })}
            value={payroll.employee_id ? payroll.employee_id.toString() : ""}
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

        {/* Salary Select */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="salary" className="text-sm font-medium">Basic Salary *</Label>
          <Select
            onValueChange={(value) => onChange({ ...payroll, salary_id: Number(value) })}
            value={payroll.salary_id ? payroll.salary_id.toString() : ""}
            disabled={isEditMode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a salary" />
            </SelectTrigger>
            <SelectContent>
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <SelectItem key={salary.id} value={salary.id.toString()}>
                    {getFullName(salary.employee!)} - {salary.basic_salary.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No salaries available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Earnings */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="total_earnings" className="text-sm font-medium">Total Earnings *</Label>
            <Input
              id="total_earnings"
              type="number"
              value={payroll.total_earnings || ""}
              onChange={(e) => onChange({ ...payroll, total_earnings: parseFloat(e.target.value) || 0 })}
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>

          {/* Total Deductions */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="total_deductions" className="text-sm font-medium">Total Deductions *</Label>
            <Input
              id="total_deductions"
              type="number"
              value={payroll.total_deductions || ""}
              onChange={(e) => onChange({ ...payroll, total_deductions: parseFloat(e.target.value) || 0 })}
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>

          {/* Net Salary */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="net_salary" className="text-sm font-medium">Net Salary *</Label>
            <Input
              id="net_salary"
              type="number"
              value={payroll.net_salary || ""}
              onChange={(e) => onChange({ ...payroll, net_salary: parseFloat(e.target.value) || 0 })}
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>

          {/* Pay Date */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="pay_date" className="text-sm font-medium">Pay Date *</Label>
            <Input
              id="pay_date"
              type="date"
              value={payroll.pay_date || ""}
              onChange={(e) => onChange({ ...payroll, pay_date: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
          <Select
            onValueChange={(value) => onChange({ ...payroll, status: value as Payroll["status"] })}
            value={payroll.status || ""}
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

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="px-4 py-2 text-sm">
          Cancel
        </Button>
        <Button
          onClick={onSave}
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