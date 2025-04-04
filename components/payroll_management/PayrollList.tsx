"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import PayrollForm from "./PayrollForm";
import { Payroll, SortKey } from "@/types/payroll";
import { usePayrollData } from "@/hooks/usePayrollData";
import { PayrollTable } from "./PayrollTable";
import { useAuth } from "@/lib/AuthContext";
import { UserRole } from "@/types/employee";
import { createPayroll, updatePayroll } from "@/services/api/apiPayroll";

const PayrollList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { payrolls, employees, salaries, payrollItems, payrollCycles, loading: dataLoading, error, setPayrolls } = usePayrollData();
  const { token } = useAuth();
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
  const itemsPerPage = 10;

  const isLoading = dataLoading || isAdding || isUpdating;

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
    return true;
  };

  const handleAddPayroll = async () => {
    setIsAdding(true);
    try {
      if (!validatePayroll(newPayroll)) return;

      const salary = salaries.find((s) => s.employee_id === newPayroll.employee_id);
      const payload: Partial<Payroll> = {
        ...newPayroll,
        salary_id: salary?.id || 0,
      };
      const addedPayroll = await createPayroll(payload);

      const enrichedPayroll = {
        ...addedPayroll,
        employee: employees.find((e) => e.id === addedPayroll.employee_id),
        payroll_cycle: payrollCycles.find((c) => c.id === addedPayroll.payroll_cycles_id),
        salary: salaries.find((s) => s.id === addedPayroll.salary_id),
        payroll_items: addedPayroll.payroll_items || [],
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
      };
      const updatedPayroll = await updatePayroll(selectedPayroll.id, payload);
      console.log("Updated payrolls:", updatedPayroll);
      // Merge updatedPayroll with existing enriched data to preserve fields not returned by API
      const enrichedPayroll = {
        ...selectedPayroll, // Preserve existing enriched fields
        ...updatedPayroll,  // Overwrite with updated fields
        employee: employees.find((e) => e.id === updatedPayroll.employee_id) || selectedPayroll.employee,
        payroll_cycle: payrollCycles.find((c) => c.id === updatedPayroll.payroll_cycles_id) || selectedPayroll.payroll_cycle,
        salary: salaries.find((s) => s.id === updatedPayroll.salary_id) || selectedPayroll.salary,
        payroll_items: updatedPayroll.payroll_items !== undefined ? updatedPayroll.payroll_items : selectedPayroll.payroll_items || [],
      };
        
      setPayrolls((prev) => {
        const newPayrolls = prev.map((p) => (p.id === updatedPayroll.id ? enrichedPayroll : p));
        return [...newPayrolls]; // Ensure a new array reference
      });

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

  const handlePayrollChange = (updatedPayroll: Partial<Payroll>) => {
    setSelectedPayroll((prev) => (prev ? { ...prev, ...updatedPayroll } : null));
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

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Payroll Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search payrolls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={() => setIsAddModalOpen(true)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add Payroll
            </Button>
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
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-foreground dark:text-foreground">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <PayrollForm
          payroll={newPayroll}
          employees={employees}
          salaries={salaries}
          payrollItems={payrollItems}
          payrollCycles={payrollCycles}
          onChange={setNewPayroll}
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
            payroll={selectedPayroll}
            employees={employees}
            salaries={salaries}
            payrollItems={payrollItems}
            payrollCycles={payrollCycles}
            onChange={handlePayrollChange}
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
    </div>
  );
};

export default PayrollList;