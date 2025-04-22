"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import PayrollForm from "./PayrollForm";
import { Payroll, SortKey, GeneratePayslipsResponse } from "@/types/payroll";
import { usePayrollData } from "@/hooks/usePayrollData";
import { PayrollTable } from "./PayrollTable";
import { UserRole } from "@/types/employee";
import { createPayroll, updatePayroll, generatePayslips } from "@/services/api/apiPayroll";

const PayrollList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { payrolls, employees, salaries, payrollCycles, loading: dataLoading, error, setPayrolls } = usePayrollData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [newPayroll, setNewPayroll] = useState<Partial<Payroll>>({
    employee_id: 0,
    payroll_cycles_id: 0,
    status: "pending",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPayslips, setIsGeneratingPayslips] = useState(false);
  const [selectedPayrollIds, setSelectedPayrollIds] = useState<number[]>([]);
  const [isPayslipConfirmOpen, setIsPayslipConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const itemsPerPage = 10;

  const isLoading = dataLoading || isAdding || isUpdating || isGeneratingPayslips;

  const memoizedNewPayroll = useMemo(() => newPayroll, [newPayroll]);
  const memoizedSelectedPayroll = useMemo(() => selectedPayroll, [selectedPayroll]);

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedPayrollIds(selectedIds);
  };

  const handleGeneratePayslips = async () => {
    if (selectedPayrollIds.length === 0) {
      toast.error("No payrolls selected for payslip generation.");
      return;
    }
    setIsPayslipConfirmOpen(true);
  };

  const confirmGeneratePayslips = async () => {
    setIsGeneratingPayslips(true);
    try {
      const response: GeneratePayslipsResponse & { message?: string } = await generatePayslips(selectedPayrollIds);

      // Update payroll statuses locally for successful payslips
      if (Array.isArray(response.payslips)) {
        setPayrolls((prev) =>
          prev.map((p) =>
            selectedPayrollIds.includes(p.id!) &&
            response.payslips.some((slip) => slip.payroll_id === p.id)
              ? { ...p, status: "paid" as Payroll["status"] }
              : p
          )
        );
      }

      // Clear selected payroll IDs
      setSelectedPayrollIds([]);

      // Provide feedback
      const generatedCount = response.payslips?.length || 0;
      const skippedCount = selectedPayrollIds.length - generatedCount;
      if (generatedCount > 0) {
        toast.success(`Payslips generated successfully for ${generatedCount} payroll(s).`);
      }
      if (skippedCount > 0 || response.message) {
        toast.info(
          response.message || `${skippedCount} payroll(s) were skipped (e.g., already paid, duplicates, or invalid data).`
        );
      }
    } catch (err: any) {
      setSelectedPayrollIds([]);
      const errorMessage = err.message || "Failed to generate payslips.";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingPayslips(false);
      setIsPayslipConfirmOpen(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPayrollIds.length === 0) {
      toast.error("No payrolls selected for deletion.");
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      setPayrolls((prev) => prev.filter((p) => !selectedPayrollIds.includes(p.id ?? 0)));
      setSelectedPayrollIds([]);
      toast.success(`Successfully deleted ${selectedPayrollIds.length} payroll records.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete selected payrolls");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  const validatePayroll = (payroll: Partial<Payroll>): boolean => {
    if (!payroll.employee_id || payroll.employee_id === 0) {
      toast.error("Employee is required.");
      return false;
    }
    if (!payroll.payroll_cycles_id || payroll.payroll_cycles_id === 0) {
      toast.error("Payroll cycle is required.");
      return false;
    }
    if (!payroll.status) {
      toast.error("Status is required.");
      return false;
    }
    const isDuplicate = payrolls.some(
      (p) =>
        p.employee_id === payroll.employee_id &&
        p.payroll_cycles_id === payroll.payroll_cycles_id &&
        (!selectedPayroll || p.id !== selectedPayroll.id)
    );
    if (isDuplicate) {
      toast.error("A payroll record already exists for this employee and payroll cycle.");
      return false;
    }
    return true;
  };

  const handleAddPayroll = async () => {
    setIsAdding(true);
    try {
      if (!validatePayroll(newPayroll)) return;

      const salary = salaries.find((s) => s.employee_id === newPayroll.employee_id);
      const payload: Partial<Payroll> = {
        employee_id: newPayroll.employee_id,
        payroll_cycles_id: newPayroll.payroll_cycles_id,
        status: newPayroll.status,
        salary_id: salary?.id,
        total_earnings: newPayroll.total_earnings,
        total_deductions: newPayroll.total_deductions,
        net_salary: newPayroll.net_salary,
        gross_salary: newPayroll.gross_salary,
      };
      const addedPayroll = await createPayroll(payload);

      const enrichedPayroll: Payroll = {
        ...addedPayroll,
        id: addedPayroll.id || 0,
        employee: employees.find((e) => e.id === addedPayroll.employee_id),
        payroll_cycle: payrollCycles.find((c) => c.id === addedPayroll.payroll_cycles_id),
        salary: salaries.find((s) => s.id === addedPayroll.salary_id),
        created_at: addedPayroll.created_at || new Date().toISOString(),
        updated_at: addedPayroll.updated_at || new Date().toISOString(),
      };

      setPayrolls((prev) => [...prev, enrichedPayroll]);
      setIsAddModalOpen(false);
      setNewPayroll({ employee_id: 0, payroll_cycles_id: 0, status: "pending" });
      toast.success("Payroll added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add payroll");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdatePayroll = async () => {
    if (!selectedPayroll) return;

    setIsUpdating(true);
    try {
      if (!validatePayroll(selectedPayroll)) return;

      const payload: Partial<Payroll> = {
        employee_id: selectedPayroll.employee_id,
        payroll_cycles_id: selectedPayroll.payroll_cycles_id,
        status: selectedPayroll.status,
        salary_id: selectedPayroll.salary_id,
        total_earnings: selectedPayroll.total_earnings,
        total_deductions: selectedPayroll.total_deductions,
        net_salary: selectedPayroll.net_salary,
        gross_salary: selectedPayroll.gross_salary,
      };
      const updatedPayroll = await updatePayroll(selectedPayroll.id, payload);

      const enrichedPayroll: Payroll = {
        ...selectedPayroll,
        ...updatedPayroll,
        employee: employees.find((e) => e.id === updatedPayroll.employee_id) || selectedPayroll.employee,
        payroll_cycle: payrollCycles.find((c) => c.id === updatedPayroll.payroll_cycles_id) || selectedPayroll.payroll_cycle,
        salary: salaries.find((s) => s.id === updatedPayroll.salary_id) || selectedPayroll.salary,
      };

      setPayrolls((prev) => prev.map((p) => (p.id === updatedPayroll.id ? enrichedPayroll : p)));
      setIsViewModalOpen(false);
      setSelectedPayroll(null);
      setIsEditable(false);
      toast.success("Payroll updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update payroll");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewPayroll = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsViewModalOpen(true);
    setIsEditable(false);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelectedPayrollChange = (updatedPayroll: Partial<Payroll>) => {
    setSelectedPayroll((prev) => (prev ? { ...prev, ...updatedPayroll } : null));
  };

  const handleNewPayrollChange = (updatedPayroll: Partial<Payroll>) => {
    setNewPayroll((prev) => ({ ...prev, ...updatedPayroll }));
  };

  const filteredAndSortedPayrolls = useMemo(() => {
    let result = [...payrolls];
    if (searchTerm) {
      result = result.filter((p) =>
        [
          p.employee?.user?.lastname,
          p.employee?.user?.firstname,
          p.status,
          p.net_salary?.toString(),
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number | undefined;
        let bValue: string | number | undefined;

        switch (sortConfig.key) {
          case "employee.user.lastname":
            aValue = a.employee?.user?.lastname ?? "";
            bValue = b.employee?.user?.lastname ?? "";
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "id":
            aValue = a.id;
            bValue = b.id;
            break;
          case "pay_date":
            aValue = a.payroll_cycle?.pay_date ?? "";
            bValue = b.payroll_cycle?.pay_date ?? "";
            break;
          default:
            aValue = "";
            bValue = "";
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        const aNum = typeof aValue === "number" ? aValue : 0;
        const bNum = typeof bValue === "number" ? bValue : 0;
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      });
    }
    return result;
  }, [payrolls, searchTerm, sortConfig]);

  const paginatedPayrolls = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPayrolls.slice(start, start + itemsPerPage);
  }, [filteredAndSortedPayrolls, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPayrolls.length / itemsPerPage);

  const selectedPayrollNames = useMemo(() => {
    return payrolls
      .filter((p) => selectedPayrollIds.includes(p.id!))
      .map((p) => p.employee?.user ? `${p.employee.user.firstname} ${p.employee.user.lastname}` : `Employee #${p.employee_id}`)
      .join(", ");
  }, [payrolls, selectedPayrollIds]);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Payroll Management</h1>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search payrolls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <div className="flex gap-2">
              <Button
                onClick={handleGeneratePayslips}
                disabled={selectedPayrollIds.length === 0 || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-white"
              >
                Generate Payslips
              </Button>
              <Button
                onClick={handleDeleteSelected}
                disabled={selectedPayrollIds.length === 0 || isLoading}
                variant="destructive"
                className="dark:bg-red-800 dark:hover:bg-red-700"
              >
                Delete Selected
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                disabled={isLoading}
                className="bg-primary hover:bg-gray-700 text-white dark:bg-secondary dark:hover:bg-gray-700 dark:text-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Payroll
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

      <PayrollTable
        payrolls={paginatedPayrolls}
        loading={isLoading}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleViewPayroll={handleViewPayroll}
        itemsPerPage={itemsPerPage}
        onSelectionChange={handleSelectionChange}
        selectedPayrollIds={selectedPayrollIds}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-foreground dark:text-foreground">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <PayrollForm
          payroll={memoizedNewPayroll}
          employees={employees}
          salaries={salaries}
          payrollCycles={payrollCycles}
          existingPayrolls={payrolls}
          onChange={handleNewPayrollChange}
          onSave={handleAddPayroll}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isAdding}
          userRole={userRole}
        />
      </Dialog>

      <Dialog
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) {
            setIsEditable(false);
            setSelectedPayroll(null);
          }
        }}
      >
        {selectedPayroll && (
          <PayrollForm
            payroll={memoizedSelectedPayroll as Payroll}
            employees={employees}
            salaries={salaries}
            payrollCycles={payrollCycles}
            existingPayrolls={payrolls}
            onChange={handleSelectedPayrollChange}
            onSave={handleUpdatePayroll}
            onCancel={() => setIsViewModalOpen(false)}
            isSaving={isUpdating}
            userRole={userRole}
            isEditMode
            isEditable={isEditable}
            setIsEditable={setIsEditable}
          />
        )}
      </Dialog>

      <AlertDialog open={isPayslipConfirmOpen} onOpenChange={setIsPayslipConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payslip Generation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to generate payslips for {selectedPayrollIds.length} payroll records? This action will create payslips for the following employees: {selectedPayrollNames}. Already paid or duplicate payrolls will be skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGeneratePayslips}>Generate Payslips</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedPayrollIds.length} payroll records for the following employees: {selectedPayrollNames}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PayrollList;