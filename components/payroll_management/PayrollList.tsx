"use client";

import { useState, useMemo } from "react";
import { usePayrollData } from "@/hooks/usePayrollData";
import { Payroll, SortKey } from "@/types/payroll";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PayrollForm from "@/components/payroll_management/PayrollForm";
import PayrollTable from "@/components/payroll_management/PayrollTable";
import DeleteConfirmation from "@/components/payroll_management/PayrollDeleteConfirmation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Employee, UserRole } from "@/types/employee";
import PayrollDetails from "./PayrollDetails";

const PayrollList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const {
    payrolls,
    employees,
    salaries,
    payrollItems,
    loading,
    error,
    currentPage,
    lastPage,
    perPage,
    fetchPayrolls,
    addPayroll,
    editPayroll,
    removePayroll,
  } = usePayrollData();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // New state for view dialog
  const [selectedPayroll, setSelectedPayroll] = useState<Partial<Payroll> | null>(null);
  const [payrollToDelete, setPayrollToDelete] = useState<Payroll | null>(null);
  const [payrollToView, setPayrollToView] = useState<Payroll | null>(null); // New state for viewing payroll
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);

  const handleAddPayroll = () => {
    setSelectedPayroll({ status: "pending" });
    setIsAddDialogOpen(true);
  };

  const handleEditPayroll = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsAddDialogOpen(true);
  };

  const handleDeletePayroll = (payroll: Payroll) => {
    setPayrollToDelete(payroll);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!payrollToDelete) return;

    setIsDeleting(true);
    try {
      await removePayroll(payrollToDelete.id!);
      toast.success("Payroll deleted successfully");
      fetchPayrolls(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete payroll");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setPayrollToDelete(null);
    }
  };

  const handleViewPayroll = (payroll: Payroll) => {
    toast.info(`Viewing payroll for employee ID ${payroll.employee_id}`);
    console.log("View payroll:", payroll);
    setPayrollToView(payroll);
    setIsViewDialogOpen(true);
  };

  const handleSavePayroll = async () => {
    if (!selectedPayroll) return;

    setIsSaving(true);
    try {
      if (selectedPayroll.id) {
        await editPayroll(selectedPayroll.id, selectedPayroll);
        toast.success("Payroll updated successfully");
      } else {
        await addPayroll(selectedPayroll);
        toast.success("Payroll added successfully");
      }
      setIsAddDialogOpen(false);
      fetchPayrolls(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to save payroll");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (updatedPayroll: Partial<Payroll>) => {
    setSelectedPayroll(updatedPayroll);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    fetchPayrolls(page);
  };

  const filteredPayrolls = useMemo(() => {
    let result = [...payrolls];

    if (searchTerm) {
      result = result.filter((payroll) => {
        const employee: Employee | undefined = employees.find((emp) => emp.id === payroll.employee_id);
        const fullName = employee?.user
          ? `${employee.user.firstname} ${employee.user.middlename ? employee.user.middlename[0] + "." : ""} ${employee.user.lastname}`.trim()
          : "";
        return (
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payroll.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter((payroll) => payroll.status === statusFilter);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number | undefined;
        let bValue: string | number | undefined;

        if (sortConfig.key === "employee.user.lastname") {
          const aEmployee = employees.find((emp) => emp.id === a.employee_id);
          const bEmployee = employees.find((emp) => emp.id === b.employee_id);
          aValue = aEmployee?.user?.lastname || "";
          bValue = bEmployee?.user?.lastname || "";
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [payrolls, employees, searchTerm, statusFilter, sortConfig]);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-gray-100">
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Payroll List</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search payrolls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={handleAddPayroll} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Payroll
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin dark:text-white" />
        </div>
      )}
      {error && <p className="text-red-500 mb-4 dark:text-red-400">{error}</p>}
      {!loading && !error && (
        <PayrollTable
          payrolls={filteredPayrolls}
          payrollItems={payrollItems}
          loading={loading}
          handleEdit={handleEditPayroll}
          handleDelete={handleDeletePayroll}
          handleViewPayroll={handleViewPayroll}
          userRole={userRole}
          sortConfig={sortConfig}
          handleSort={handleSort}
          itemsPerPage={perPage}
        />
      )}

      {lastPage > 1 && (
        <div className="mt-4 flex items-center gap-2 text-foreground dark:text-gray-200">
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {lastPage}</span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.min(currentPage + 1, lastPage))}
            disabled={currentPage === lastPage}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit Payroll Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPayroll?.id ? "Edit Payroll" : "Add Payroll"}</DialogTitle>
            <DialogDescription>
              {selectedPayroll?.id
                ? "Modify the payroll details below."
                : "Fill in the details to add a new payroll."}
            </DialogDescription>
          </DialogHeader>
          {selectedPayroll && (
            <PayrollForm
              payroll={selectedPayroll}
              employees={employees}
              salaries={salaries}
              payrollItems={payrollItems}
              onChange={handleFormChange}
              onSave={handleSavePayroll}
              onCancel={() => setIsAddDialogOpen(false)}
              isSaving={isSaving}
              isEditMode={!!selectedPayroll.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        {payrollToDelete && (
          <DeleteConfirmation
            onConfirm={confirmDelete}
            onCancel={() => setIsDeleteDialogOpen(false)}
            isDeleting={isDeleting}
          />
        )}
      </Dialog>

      {/* View Payroll Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <PayrollDetails 
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          payroll={payrollToView}
          userRole={userRole}
          onDelete={handleDeletePayroll}
          onEdit={handleEditPayroll}
        />
      </Dialog>
    </div>
  );
};

export default PayrollList;