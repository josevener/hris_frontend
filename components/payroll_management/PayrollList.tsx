"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { ClipboardCheckIcon, Plus } from "lucide-react";
import PayrollForm from "./PayrollForm";
import { usePayrollData } from "@/hooks/usePayrollData";
import PayrollTable from "./PayrollTable";
import { UserRole } from "@/types/employee";
import { Payroll } from "@/types/payroll";
import DeleteConfirmation from "./PayrollDeleteConfirmation";

const PayrollList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { payrolls, employees, salaries, loading, error, addPayroll, editPayroll, removePayroll } = usePayrollData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [newPayroll, setNewPayroll] = useState<Partial<Payroll>>({
    employee_id: 0,
    salary_id: 0,
    total_earnings: 0,
    total_deductions: 0,
    net_salary: 0,
    pay_date: "",
    status: "pending",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validatePayroll = (payroll: Partial<Payroll>): boolean => {
    if (!payroll.employee_id || payroll.employee_id === 0) {
      toast.error("Employee is required.");
      return false;
    }
    if (!payroll.salary_id || payroll.salary_id === 0) {
      toast.error("Salary is required.");
      return false;
    }
    if (!payroll.total_earnings || payroll.total_earnings < 0) {
      toast.error("Total earnings must be non-negative.");
      return false;
    }
    if (!payroll.total_deductions || payroll.total_deductions < 0) {
      toast.error("Total deductions must be non-negative.");
      return false;
    }
    if (!payroll.net_salary || payroll.net_salary < 0) {
      toast.error("Net salary must be non-negative.");
      return false;
    }
    if (!payroll.pay_date) {
      toast.error("Pay date is required.");
      return false;
    }
    if (!payroll.status) {
      toast.error("Status is required.");
      return false;
    }
    return true;
  };

  const handleAddPayroll = async () => {
    if (!validatePayroll(newPayroll)) return;
    setIsSaving(true);
    try {
      await addPayroll(newPayroll);
      setIsAddModalOpen(false);
      setNewPayroll({
        employee_id: 0,
        salary_id: 0,
        total_earnings: 0,
        total_deductions: 0,
        net_salary: 0,
        pay_date: "",
        status: "pending",
      });
      toast.success("Payroll added successfully");
    } catch (err) {
      toast.error("Failed to add payroll");
      console.error("Add error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePayroll = async () => {
    if (!selectedPayroll || !validatePayroll(selectedPayroll)) return;
    setIsSaving(true);
    try {
      await editPayroll(selectedPayroll.id, selectedPayroll);
      setIsEditModalOpen(false);
      setSelectedPayroll(null);
      toast.success("Payroll updated successfully");
    } catch (err) {
      toast.error("Failed to update payroll");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePayroll = async () => {
    if (!selectedPayroll) return;
    setIsDeleting(true);
    try {
      await removePayroll(selectedPayroll.id);
      setIsDeleteModalOpen(false);
      setSelectedPayroll(null);
      toast.success("Payroll deleted successfully");
    } catch (err) {
      toast.error("Failed to delete payroll");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = (payroll: Payroll) => {
    console.log(`View Profile: ${payroll.employee?.id}`);
    toast.info("View profile functionality to be implemented");
  };

  const handleGeneratePayroll = () => {
    toast.info("Generate Payroll functionality to be implemented");
  };

  const filteredPayrolls = useMemo(() => {
    let result = [...payrolls];
    if (searchTerm) {
      result = result.filter((payroll) =>
        [
          payroll.employee?.user?.lastname || "",
          payroll.employee?.user?.firstname || "",
          String(payroll.total_earnings || ""),
          String(payroll.net_salary || ""),
          payroll.pay_date,
          payroll.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [payrolls, searchTerm]);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search payrolls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(userRole === "HR" || userRole === "Admin") && [
            <Button 
              key="generate-payroll" 
              onClick={handleGeneratePayroll}
              className="border border-gray-700"
            >
              <ClipboardCheckIcon className="mr-2 h-4 w-4" /> Generate Payroll
            </Button>,
            <Button key={'add-payroll'} onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Payroll
            </Button>
          ]}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <PayrollTable
        payrolls={filteredPayrolls}
        loading={loading}
        handleEdit={(payroll) => {
          setSelectedPayroll(payroll);
          setIsEditModalOpen(true);
        }}
        handleDelete={(payroll) => {
          setSelectedPayroll(payroll);
          setIsDeleteModalOpen(true);
        }}
        handleViewProfile={handleViewProfile}
        userRole={userRole}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <PayrollForm
          payroll={newPayroll}
          employees={employees}
          salaries={salaries}
          onChange={setNewPayroll}
          onSave={handleAddPayroll}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isSaving}
        />
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedPayroll && (
          <PayrollForm
            payroll={selectedPayroll}
            employees={employees}
            salaries={salaries}
            onChange={(updatedPayroll) => setSelectedPayroll(updatedPayroll as Payroll)}
            onSave={handleUpdatePayroll}
            onCancel={() => setIsEditModalOpen(false)}
            isSaving={isSaving}
            isEditMode
          />
        )}
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DeleteConfirmation
          onConfirm={handleDeletePayroll}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default PayrollList;