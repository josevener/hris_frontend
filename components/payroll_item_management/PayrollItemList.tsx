"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import PayrollItemForm from "./PayrollItemForm";
import { usePayrollItemData } from "@/hooks/usePayrollItemData";
import PayrollItemTable from "./PayrollItemTable";
import { UserRole } from "@/types/employee";
import { PayrollItem } from "@/types/payroll";
import DeleteConfirmation from "./DeleteConfirmation";

const PayrollItemList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { payrollItems, employees, payrolls, loading, error, addPayrollItem, editPayrollItem, removePayrollItem } = usePayrollItemData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayrollItem, setSelectedPayrollItem] = useState<PayrollItem | null>(null);
  const [newPayrollItem, setNewPayrollItem] = useState<Partial<PayrollItem>>({
    scope: "specific",
    employee_id: undefined,
    start_date: "",
    end_date: "",
    type: "earning",
    category: "",
    amount: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validatePayrollItem = (item: Partial<PayrollItem>): boolean => {
    if (!item.scope) {
      toast.error("Scope is required.");
      return false;
    }
    if (item.scope === "specific" && (!item.employee_id || item.employee_id === 0)) {
      toast.error("Employee is required for specific scope.");
      return false;
    }
    if (!item.start_date) {
      toast.error("Start date is required.");
      return false;
    }
    if (!item.end_date) {
      toast.error("End date is required.");
      return false;
    }
    if (item.start_date && item.end_date && new Date(item.start_date) > new Date(item.end_date)) {
      toast.error("Start date must be before end date.");
      return false;
    }
    if (!item.type) {
      toast.error("Type is required.");
      return false;
    }
    if (!item.category) {
      toast.error("Category is required.");
      return false;
    }
    if (!item.amount || item.amount < 0) {
      toast.error("Amount must be non-negative.");
      return false;
    }
    return true;
  };

  const handleAddPayrollItem = async () => {
    if (!validatePayrollItem(newPayrollItem)) return;
    setIsSaving(true);
    try {
      await addPayrollItem(newPayrollItem);
      setIsAddModalOpen(false);
      setNewPayrollItem({
        scope: "specific",
        employee_id: undefined,
        start_date: "",
        end_date: "",
        type: "earning",
        category: "",
        amount: 0,
      });
      toast.success("Payroll item added successfully");
    } catch (err) {
      toast.error("Failed to add payroll item");
      console.error("Add error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePayrollItem = async () => {
    if (!selectedPayrollItem || !validatePayrollItem(selectedPayrollItem)) return;
    setIsSaving(true);
    try {
      await editPayrollItem(selectedPayrollItem.id, selectedPayrollItem);
      setIsEditModalOpen(false);
      setSelectedPayrollItem(null);
      toast.success("Payroll item updated successfully");
    } catch (err) {
      toast.error("Failed to update payroll item");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayrollItem = async () => {
    if (!selectedPayrollItem) return;
    setIsDeleting(true);
    try {
      await removePayrollItem(selectedPayrollItem.id);
      setIsDeleteModalOpen(false);
      setSelectedPayrollItem(null);
      toast.success("Payroll item deleted successfully");
    } catch (err) {
      toast.error("Failed to delete payroll item");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = (payrollItem: PayrollItem) => {
    console.log(`View Profile: ${payrollItem.employee?.id}`);
    toast.info("View profile functionality to be implemented");
  };

  const filteredPayrollItems = useMemo(() => {
    let result = [...payrollItems];
    if (searchTerm) {
      result = result.filter((item) =>
        [
          item.employee?.user?.lastname || "",
          item.employee?.user?.firstname || "",
          item.type,
          item.category,
          String(item.amount || ""),
          item.start_date || "",
          item.end_date || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [payrollItems, searchTerm]);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Payroll Items</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search payroll items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Payroll Item
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <PayrollItemTable
        payrollItems={filteredPayrollItems}
        loading={loading}
        handleEdit={(item) => {
          setSelectedPayrollItem(item);
          setIsEditModalOpen(true);
        }}
        handleDelete={(item) => {
          setSelectedPayrollItem(item);
          setIsDeleteModalOpen(true);
        }}
        handleViewProfile={handleViewProfile}
        userRole={userRole}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <PayrollItemForm
          payrollItem={newPayrollItem}
          employees={employees}
          payrolls={payrolls}
          onChange={setNewPayrollItem}
          onSave={handleAddPayrollItem}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isSaving}
        />
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedPayrollItem && (
          <PayrollItemForm
            payrollItem={selectedPayrollItem}
            employees={employees}
            payrolls={payrolls}
            onChange={(updatedItem) => setSelectedPayrollItem(updatedItem as PayrollItem)}
            onSave={handleUpdatePayrollItem}
            onCancel={() => setIsEditModalOpen(false)}
            isSaving={isSaving}
            isEditMode
          />
        )}
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DeleteConfirmation
          onConfirm={handleDeletePayrollItem}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default PayrollItemList;