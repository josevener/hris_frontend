"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Edit as EditIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Employee, UserRole } from "@/types/employee";
import { Payroll, PayrollItem, PayrollCycle, Salary } from "@/types/payroll";
import { format } from "date-fns";
import { previewPayroll, fetchEmployeesWithSalaries } from "@/services/api/apiPayroll";

interface PayrollFormProps {
  payroll: Partial<Payroll>;
  employees: Employee[];
  salaries: Salary[];
  payrollCycles: PayrollCycle[];
  existingPayrolls: Payroll[];
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
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
};

const PayrollForm: React.FC<PayrollFormProps> = ({
  payroll,
  salaries,
  payrollCycles,
  existingPayrolls,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
  isEditable = false,
  setIsEditable,
}) => {
  const [previewData, setPreviewData] = useState<{
    basic_salary: number;
    total_earnings: number;
    total_deductions: number;
    net_salary: number;
    gross_salary: number;
    payroll_items: PayrollItem[];
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [employeesWithSalaries, setEmployeesWithSalaries] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [validationDialog, setValidationDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);
  const [isDeductionsOpen, setIsDeductionsOpen] = useState(false);

  const lastFetched = useRef<{ employee_id: number; payroll_cycles_id: number }>({
    employee_id: 0,
    payroll_cycles_id: 0,
  });

  const getFullName = (emp: Employee | undefined) =>
    emp?.user
      ? `${emp.user.firstname} ${emp.user.middlename ? emp.user.middlename[0] + "." : ""} ${emp.user.lastname}`.trim()
      : emp
        ? `Employee #${emp.id}`
        : "N/A";

  // Sort payroll cycles: non-past-due (end_date >= today) first, then past cycles
  const sortedPayrollCycles = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    return [...payrollCycles].sort((a, b) => {
      const aEndDate = new Date(a.end_date);
      const bEndDate = new Date(b.end_date);
      const aIsActive = aEndDate >= today;
      const bIsActive = bEndDate >= today;

      // Active cycles (end_date >= today) come first
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;

      // Within active/past groups, sort by start_date ascending
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    });
  }, [payrollCycles]);

  const payrollCycleOptions = useMemo(
    () =>
      sortedPayrollCycles.map((cycle) => {
        const endDate = new Date(cycle.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = endDate < today;
        return {
          id: cycle.id.toString(),
          value: `${format(new Date(cycle.start_date), "MMMM dd")} - ${format(
            new Date(cycle.end_date),
            "MMMM dd, yyyy"
          )}${isPast ? " (Past)" : ""}`,
          isPast,
        };
      }),
    [sortedPayrollCycles]
  );

  const selectedCycle = payrollCycles.find((cycle) => cycle.id === payroll.payroll_cycles_id) || payroll.payroll_cycle;
  const payrollPeriod = selectedCycle
    ? `${format(new Date(selectedCycle.start_date), "MMMM dd")} - ${format(new Date(selectedCycle.end_date), "MMMM dd, yyyy")}`
    : "N/A";
  const payDate = selectedCycle?.pay_date
    ? format(new Date(selectedCycle.pay_date), "MMMM dd, yyyy")
    : "N/A";

  const isDuplicate = useMemo(
    () =>
      existingPayrolls.some(
        (p) =>
          p.employee_id === payroll.employee_id &&
          p.payroll_cycles_id === payroll.payroll_cycles_id &&
          (!isEditMode || p.id !== payroll.id)
      ),
    [existingPayrolls, payroll.employee_id, payroll.payroll_cycles_id, isEditMode, payroll.id]
  );

  useEffect(() => {
    const loadEmployeesWithSalaries = async () => {
      setIsLoadingEmployees(true);
      try {
        const fetchedEmployees = await fetchEmployeesWithSalaries();
        setEmployeesWithSalaries(fetchedEmployees);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setErrorDialog({
          open: true,
          message: `Failed to fetch employees: ${error.message || "Unknown error"}`,
        });
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    loadEmployeesWithSalaries();
  }, []);

  const fetchPreviewDebounced = useMemo(
    () =>
      debounce(async (employeeId: number, payrollCycleId: number) => {
        setIsLoadingPreview(true);
        try {
          const data = await previewPayroll(employeeId, payrollCycleId);
          console.log("Preview Data:", data);
          setPreviewData(data);
          onChange({
            ...payroll,
            total_earnings: data.total_earnings,
            total_deductions: data.total_deductions,
            net_salary: data.net_salary,
            gross_salary: data.gross_salary,
            payroll_items: data.payroll_items,
          });
          lastFetched.current = { employee_id: employeeId, payroll_cycles_id: payrollCycleId };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error("Preview Error:", error);
          setErrorDialog({
            open: true,
            message: `Failed to fetch preview: ${error.message || "Unknown error"}`,
          });
          setPreviewData(null);
        } finally {
          setIsLoadingPreview(false);
        }
      }, 300),
    [onChange, payroll]
  );

  useEffect(() => {
    if (!payroll.employee_id || !payroll.payroll_cycles_id) return;

    const employeeId = payroll.employee_id;
    const payrollCycleId = payroll.payroll_cycles_id;

    if (
      employeeId === lastFetched.current.employee_id &&
      payrollCycleId === lastFetched.current.payroll_cycles_id
    ) return;

    fetchPreviewDebounced(employeeId, payrollCycleId);
  }, [payroll.employee_id, payroll.payroll_cycles_id, fetchPreviewDebounced]);

  const handleEditClick = () => {
    if (setIsEditable) setIsEditable(true);
  };

  const handleSave = () => {
    if (isDuplicate) {
      setValidationDialog({
        open: true,
        message: "A payroll record already exists for this employee and payroll cycle.",
      });
      return;
    }
    if (!payroll.employee_id || !payroll.payroll_cycles_id || !payroll.status) {
      setValidationDialog({
        open: true,
        message: "Employee, Payroll Cycle, and Status are required.",
      });
      return;
    }
    onSave();
  };

  const displayData = previewData || payroll;
  const basicSalary = displayData?.basic_salary ?? payroll.salary?.basic_salary ?? null;
  const totalEarnings = displayData?.total_earnings ?? payroll.total_earnings ?? null;
  const totalDeductions = displayData?.total_deductions ?? payroll.total_deductions ?? null;
  const netSalary = displayData?.net_salary ?? payroll.net_salary ?? null;
  const grossSalary = displayData?.gross_salary ?? payroll.net_salary ?? null;
  const earningsItems = displayData?.payroll_items?.filter((item) => item.type === "earning") || [];
  const deductionItems = displayData?.payroll_items?.filter((item) => ["deduction", "contribution"].includes(item.type)) || [];

  console.log("Display Data Payroll Items:", displayData?.payroll_items);
  console.log("Earnings Items:", earningsItems);
  console.log("Deduction Items:", deductionItems);

  const editableEmployees = useMemo(() => {
    if (isEditMode && payroll.employee && !employeesWithSalaries.some((e) => e.id === payroll.employee_id)) {
      return [...employeesWithSalaries, payroll.employee];
    }
    return employeesWithSalaries;
  }, [isEditMode, payroll.employee, payroll.employee_id, employeesWithSalaries]);

  return (
    <>
      <DialogContent className="sm:max-w-[800px] w-[80vw] max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "View/Edit Payroll" : "Add New Payroll"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "View or update payroll details." : "Enter details for a new payroll."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-4 py-4 grid-cols-6 px-6">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="employee_id">Employee *</Label>
              {isEditMode && !isEditable ? (
                <Input
                  id="employee_id"
                  value={getFullName(employeesWithSalaries.find((e) => e.id === payroll.employee_id) || payroll.employee)}
                  disabled
                  className="bg-gray-100 dark:bg-gray-600"
                />
              ) : (
                <Select
                  value={payroll.employee_id?.toString() || ""}
                  onValueChange={(value) => {
                    const employeeId = parseInt(value) || 0;
                    const salary = salaries.find((s) => s.employee_id === employeeId);
                    onChange({ ...payroll, employee_id: employeeId, salary_id: salary?.id });
                  }}
                  disabled={isLoadingEmployees}
                >
                  <SelectTrigger className="dark:bg-gray-700">
                    <SelectValue placeholder={isLoadingEmployees ? "Loading..." : "Select Employee"} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {editableEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {getFullName(emp)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="payroll_cycles_id">Payroll Period *</Label>
              {isEditMode && !isEditable ? (
                <Input
                  id="payroll_cycles_id"
                  value={payrollPeriod}
                  disabled
                  className="bg-gray-100 dark:bg-gray-600"
                />
              ) : (
                <Select
                  value={payroll.payroll_cycles_id?.toString() || ""}
                  onValueChange={(value) =>
                    onChange({ ...payroll, payroll_cycles_id: parseInt(value) || 0 })
                  }
                >
                  <SelectTrigger className="dark:bg-gray-700">
                    <SelectValue placeholder="Select Payroll Cycle" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {payrollCycleOptions.map((cycle) => (
                      <SelectItem
                        key={cycle.id}
                        value={cycle.id}
                        className={cycle.isPast ? "text-gray-500 dark:text-gray-400" : ""}
                      >
                        {cycle.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="pay_date">Pay Date</Label>
              <Input
                id="pay_date"
                value={payDate}
                disabled
                className="bg-gray-100 dark:bg-gray-600"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={payroll.status || ""}
                onValueChange={(value) => onChange({ ...payroll, status: value as Payroll["status"] })}
                disabled={isEditMode && !isEditable}
              >
                <SelectTrigger className="dark:bg-gray-700">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label>Basic Salary</Label>
              <Input
                value={isLoadingPreview ? "Loading..." : formatCurrency(basicSalary)}
                disabled
                className="bg-gray-100 dark:bg-gray-600"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label>Total Earnings</Label>
              <Input
                value={isLoadingPreview ? "Loading..." : formatCurrency(totalEarnings)}
                disabled
                className="bg-gray-100 dark:bg-gray-600"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label>Total Deductions</Label>
              <Input
                value={isLoadingPreview ? "Loading..." : formatCurrency(totalDeductions)}
                disabled
                className="bg-gray-100 dark:bg-gray-600"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label>Gross Salary</Label>
              <Input
                value={isLoadingPreview ? "Loading..." : formatCurrency(grossSalary)}
                disabled
                className="bg-gray-100 dark:bg-gray-600 font-semibold"
              />
            </div>
            
            <div className="col-span-2 flex flex-col gap-2">
              <Label>Net Salary</Label>
              <Input
                value={isLoadingPreview ? "Loading..." : formatCurrency(netSalary)}
                disabled
                className="bg-gray-100 dark:bg-gray-600 text-4xl font-bold"
              />
            </div>

            {[
              { label: "Earnings Breakdown", items: earningsItems, isOpen: isEarningsOpen, setIsOpen: setIsEarningsOpen },
              { label: "Deductions Breakdown", items: deductionItems, isOpen: isDeductionsOpen, setIsOpen: setIsDeductionsOpen },
            ].map(({ label, items, isOpen, setIsOpen }) => (
              <div key={label} className="col-span-6 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex justify-between items-center w-full p-2 dark:bg-gray-700"
                >
                  <Label>{label}</Label>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {(isOpen || !isEditMode) && (
                  <div className="flex flex-col gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <div className="font-medium text-sm border-b pb-1 flex">
                      <div className="w-1/2">Category</div>
                      <div className="w-1/2 text-right">Amount</div>
                    </div>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <div key={item.id || `${item.category}-${item.amount}`} className="flex text-sm py-1 border-b last:border-none">
                          <div className="w-1/2">{item.category || "Unnamed"}</div>
                          <div className="w-1/2 text-right">{formatCurrency(Number(item.amount))}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isLoadingPreview ? "Loading items..." : "No items available"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2 px-6 py-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          {isEditMode && !isEditable && (
            <Button onClick={handleEditClick} className="flex gap-2 dark:bg-gray-700">
              <EditIcon className="h-4 w-4" /> Edit
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving} className="dark:bg-gray-700">
              Cancel
            </Button>
            {(isEditMode ? isEditable : true) && (
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoadingPreview || isLoadingEmployees}
                className="dark:bg-gray-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 dark:text-foreground">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{errorDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setErrorDialog({ open: false, message: "" })}
              className="dark:bg-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={validationDialog.open} onOpenChange={(open) => setValidationDialog({ ...validationDialog, open })}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 dark:text-foreground">
          <DialogHeader>
            <DialogTitle>
              <p className="text-red-600">Warning error!</p>
            </DialogTitle>
            <DialogDescription>{validationDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setValidationDialog({ open: false, message: "" })}
              className="dark:bg-gray-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PayrollForm;