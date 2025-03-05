import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Employee } from "@/types/salary";
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
  payrolls,
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
        {/* Payroll Select */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="payroll" className="text-sm font-medium">Payroll *</Label>
          <Select
            onValueChange={(value) => onChange({ ...payrollItem, payroll_id: Number(value) })}
            value={payrollItem.payroll_id ? payrollItem.payroll_id.toString() : ""}
            disabled={isEditMode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a payroll" />
            </SelectTrigger>
            <SelectContent>
              {payrolls.length > 0 ? (
                payrolls.map((payroll) => (
                  <SelectItem key={payroll.id} value={payroll.id.toString()}>
                    {getFullName(payroll.employee!)} - {payroll.pay_date}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No payrolls available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Employee Select */}
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

        {/* Type */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="type" className="text-sm font-medium">Type *</Label>
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

        {/* Category */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
          <Input
            id="category"
            value={payrollItem.category || ""}
            onChange={(e) => onChange({ ...payrollItem, category: e.target.value })}
            className="w-full"
          />
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