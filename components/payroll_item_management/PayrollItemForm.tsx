import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit } from "lucide-react";
import { Employee } from "@/types/employee";
import { PayrollItem, PayrollCycle } from "@/types/payroll";
import { format } from "date-fns";

interface PayrollItemFormProps {
  payrollItem: Partial<PayrollItem>;
  employees: Employee[];
  payrollCycles: PayrollCycle[];
  onChange: (updatedPayrollItem: Partial<PayrollItem>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
  isViewMode?: boolean;
  onEditToggle?: () => void;
}

const PayrollItemForm: React.FC<PayrollItemFormProps> = ({
  payrollItem,
  employees,
  payrollCycles,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
  isViewMode = false,
  onEditToggle,
}) => {
  const isReadOnly = !isEditMode && isViewMode;

  const getFullName = (employee: Employee): string => {
    const user = employee.user;
    return user
      ? `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim()
      : `Employee #${employee.id}`;
  };

  const currentEmployeeName = () => {
    if (payrollItem.employee) return getFullName(payrollItem.employee);
    const employee = employees.find((emp) => emp.id === payrollItem.employee_id);
    return employee ? getFullName(employee) : payrollItem.scope === "global" ? "All Employees" : `Employee #${payrollItem.employee_id || "Unknown"}`;
  };

  // Sort payroll cycles: non-past-due (end_date >= today) first, then past cycles
  const sortedPayrollCycles = [...payrollCycles].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aEndDate = new Date(a.end_date);
    const bEndDate = new Date(b.end_date);
    const aIsActive = aEndDate >= today;
    const bIsActive = bEndDate >= today;

    if (aIsActive && !bIsActive) return -1;
    if (!aIsActive && bIsActive) return 1;

    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });

  const formatPayrollPeriod = (cycle: PayrollCycle, isPast: boolean = false): string => {
    if (!cycle.start_date || !cycle.end_date) {
      return "Invalid Period";
    }
    const start = format(new Date(cycle.start_date), "MMM dd, yyyy");
    const end = format(new Date(cycle.end_date), "MMM dd, yyyy");
    return `${start} - ${end}${isPast ? " (Past)" : ""}`;
  };

  const getPayrollPeriodDisplay = () => {
    if (payrollItem.payroll_cycles_id) {
      const cycle = payrollCycles.find((c) => c.id === payrollItem.payroll_cycles_id);
      if (cycle) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = new Date(cycle.end_date) < today;
        return formatPayrollPeriod(cycle, isPast);
      }
    }
    if (payrollItem.start_date && payrollItem.end_date) {
      return `${format(new Date(payrollItem.start_date), "MMM dd, yyyy")} - ${format(new Date(payrollItem.end_date), "MMM dd, yyyy")}`;
    }
    return "Not Assigned";
  };

  const currentPayrollCycleValue = payrollItem.payroll_cycles_id
    ? payrollItem.payroll_cycles_id.toString()
    : payrollCycles.find((cycle) =>
        cycle.start_date === payrollItem.start_date && cycle.end_date === payrollItem.end_date
      )?.id.toString() || "";

  const handlePayrollCycleChange = (value: string) => {
    const selectedCycle = payrollCycles.find((c) => c.id.toString() === value);
    if (selectedCycle) {
      onChange({
        ...payrollItem,
        payroll_cycles_id: selectedCycle.id,
        start_date: selectedCycle.start_date,
        end_date: selectedCycle.end_date,
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isViewMode ? "View Payroll Item" : isEditMode ? "Edit Payroll Item" : "Add New Payroll Item"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-3">
        {/* Scope */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="scope" className="text-sm font-medium">Scope *</Label>
          {isReadOnly ? (
            <Input value={payrollItem.scope || ""} readOnly className="w-full" />
          ) : (
            <Select
              onValueChange={(value) =>
                onChange({
                  ...payrollItem,
                  scope: value as "specific" | "global",
                  employee_id: value === "global" ? undefined : payrollItem.employee_id,
                })
              }
              value={payrollItem.scope || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific">Specific Employee</SelectItem>
                <SelectItem value="global">All Employees</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Employee Select */}
        {payrollItem.scope === "specific" && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="employee" className="text-sm font-medium">Employee *</Label>
            {isReadOnly ? (
              <Input value={currentEmployeeName()} readOnly className="w-full" />
            ) : (
              <Select
                onValueChange={(value) => onChange({ ...payrollItem, employee_id: Number(value) })}
                value={payrollItem.employee_id ? payrollItem.employee_id.toString() : ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an employee" />
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
            )}
          </div>
        )}

        {/* Payroll Period Select */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="payroll_period" className="text-sm font-medium">Payroll Period *</Label>
          {isReadOnly ? (
            <Input value={getPayrollPeriodDisplay()} readOnly className="w-full" />
          ) : (
            <Select
              onValueChange={handlePayrollCycleChange}
              value={currentPayrollCycleValue}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payroll period" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                className="max-h-60 overflow-y-auto"
              >
                {sortedPayrollCycles.length > 0 ? (
                  sortedPayrollCycles.map((cycle) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = new Date(cycle.end_date) < today;
                    return (
                      <SelectItem
                        key={cycle.id}
                        value={cycle.id.toString()}
                        className={isPast ? "text-gray-500 dark:text-gray-400" : ""}
                      >
                        {formatPayrollPeriod(cycle, isPast)}
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="none" disabled>No payroll cycles available</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Type and Category */}
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Details *</Label>
          <div className="flex flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="type" className="sr-only">Type</Label>
              {isReadOnly ? (
                <Input value={payrollItem.type || ""} readOnly className="w-full" />
              ) : (
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
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="category" className="sr-only">Category</Label>
              <Input
                id="category"
                placeholder="Category"
                value={payrollItem.category || ""}
                onChange={(e) => onChange({ ...payrollItem, category: e.target.value })}
                className="w-full"
                readOnly={isReadOnly}
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
            value={payrollItem.amount?.toString() || ""}
            onChange={(e) => onChange({ ...payrollItem, amount: e.target.value })}
            className="w-full"
            min="0"
            step="0.01"
            readOnly={isReadOnly}
          />
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        {isViewMode && onEditToggle && (
          <Button
            variant="outline"
            onClick={onEditToggle}
            className="px-4 py-2 text-sm bg-primary text-white flex items-center hover:bg-gray-800 hover:text-white"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        )}
        <Button variant="outline" onClick={onCancel} className="px-4 py-2 text-sm">
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
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
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default PayrollItemForm;