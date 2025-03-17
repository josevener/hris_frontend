import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Employee } from "@/types/employee";
import { Payroll, PayrollItem } from "@/types/payroll";

interface PayrollItemFormProps {
  payrollItem: Partial<PayrollItem>;
  employees: Employee[];
  payrolls: Payroll[];
  onChange: (updatedPayrollItem: Partial<PayrollItem>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
}

const PayrollItemForm: React.FC<PayrollItemFormProps> = ({
  payrollItem,
  employees,
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
    if (payrollItem.employee) return getFullName(payrollItem.employee);
    const employee = employees.find((emp) => emp.id === payrollItem.employee_id);
    return employee ? getFullName(employee) : `Employee #${payrollItem.employee_id || "Unknown"}`;
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEditMode ? "Edit Payroll Item" : "Add New Payroll Item"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-3">
        {/* Scope */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="scope" className="text-sm font-medium">Scope *</Label>
          <Select
            onValueChange={(value) =>
              onChange({
                ...payrollItem,
                scope: value as "specific" | "global",
                employee_id: value === "global" ? undefined : payrollItem.employee_id,
              })
            }
            value={payrollItem.scope || ""}
            disabled={isEditMode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="specific">Specific Employee</SelectItem>
              <SelectItem value="global">All Employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employee Select (only if scope is specific) */}
        {payrollItem.scope === "specific" && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="employee" className="text-sm font-medium">Employee *</Label>
            <Select
              onValueChange={(value) => onChange({ ...payrollItem, employee_id: Number(value) })}
              value={payrollItem.employee_id ? payrollItem.employee_id.toString() : ""}
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
        )}

        {/* Start and End Date on One Line */}
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Payroll Period *</Label>
          <div className="flex flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="start_date" className="sr-only">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                placeholder="Start Date"
                value={payrollItem.start_date || ""}
                onChange={(e) => onChange({ ...payrollItem, start_date: e.target.value })}
                className="w-full"
                disabled={isEditMode}
              />
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400">to</span>
            </div>
            <div className="flex-1">
              <Label htmlFor="end_date" className="sr-only">End Date</Label>
              <Input
                id="end_date"
                type="date"
                placeholder="End Date"
                value={payrollItem.end_date || ""}
                onChange={(e) => onChange({ ...payrollItem, end_date: e.target.value })}
                className="w-full"
                disabled={isEditMode}
              />
            </div>
          </div>
        </div>

        {/* Type and Category on One Line */}
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Details *</Label>
          <div className="flex flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="type" className="sr-only">Type</Label>
              <Select
                onValueChange={(value) => onChange({ ...payrollItem, type: value as PayrollItem["type"] })}
                value={payrollItem.type || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earning">Earning</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                  <SelectItem value="contribution">Contribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="category" className="sr-only">Category</Label>
              <Input
                id="category"
                placeholder="Category"
                value={payrollItem.category || ""}
                onChange={(e) => onChange({ ...payrollItem, category: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
          <Input
            id="amount"
            type="number"
            value={payrollItem.amount || ""}
            onChange={(e) => onChange({ ...payrollItem, amount: parseFloat(e.target.value) || 0 })}
            className="w-full"
            min="0"
            step="0.01"
          />
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

export default PayrollItemForm;