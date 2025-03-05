"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import SalaryForm from "./SalaryForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { Salary } from "@/types/salary";
import { useSalaryData } from "@/hooks/useSalaryData";
import SalaryTable from "./SalaryTable";
import { UserRole } from "@/types/employee"; // Import UserRole type

// Accept userRole as a prop, default to "Employee"
const SalaryList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { salaries, employees, loading, error, addSalary, editSalary, removeSalary } = useSalaryData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [newSalary, setNewSalary] = useState<Partial<Salary>>({
    employee_id: 0,
    basic_salary: 0,
    pay_period: "monthly",
    start_date: "",
    end_date: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validateSalary = (salary: Partial<Salary>): boolean => {
    if (!salary.employee_id || salary.employee_id === 0) {
      toast.error("Employee is required.");
      return false;
    }
    if (!salary.basic_salary || salary.basic_salary <= 0) {
      toast.error("Basic salary must be greater than 0.");
      return false;
    }
    if (!salary.pay_period) {
      toast.error("Pay period is required.");
      return false;
    }
    if (!salary.start_date) {
      toast.error("Start date is required.");
      return false;
    }
    return true;
  };

  const handleAddSalary = async () => {
    if (!validateSalary(newSalary)) return;
    setIsSaving(true);
    try {
      await addSalary(newSalary);
      setIsAddModalOpen(false);
      setNewSalary({
        employee_id: 0,
        basic_salary: 0,
        pay_period: "monthly",
        start_date: "",
        end_date: null,
      });
      toast.success("Salary added successfully");
    } catch (err) {
      toast.error("Failed to add salary");
      console.error("Add error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSalary = async () => {
    if (!selectedSalary || !validateSalary(selectedSalary)) return;
    setIsSaving(true);
    try {
      await editSalary(selectedSalary.id, selectedSalary);
      setIsEditModalOpen(false);
      setSelectedSalary(null);
      toast.success("Salary updated successfully");
    } catch (err) {
      toast.error("Failed to update salary");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSalary = async () => {
    if (!selectedSalary) return;
    setIsDeleting(true);
    try {
      await removeSalary(selectedSalary.id);
      setIsDeleteModalOpen(false);
      setSelectedSalary(null);
      toast.success("Salary deleted successfully");
    } catch (err) {
      toast.error("Failed to delete salary");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleViewProfile = (salary: Salary) => {
      console.log(`View Profile: ${salary.employee?.id}`);
      toast.info("View profile functionality to be implemented");
  };

  const filteredSalaries = useMemo(() => {
    let result = [...salaries];
    if (searchTerm) {
      result = result.filter((salary) =>
        [
          salary.employee?.user?.lastname || "",
          salary.employee?.user?.firstname || "",
          String(salary.basic_salary || ""),
          salary.pay_period,
          salary.start_date,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [salaries, searchTerm]);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Salary Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search salaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(userRole === "HR" || userRole === "Admin") && ( // Only show "Add Salary" for HR/Admin
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Salary
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <SalaryTable
        salaries={filteredSalaries}
        loading={loading}
        handleEdit={(salary) => {
          setSelectedSalary(salary);
          setIsEditModalOpen(true);
        }}
        handleDelete={(salary) => {
          setSelectedSalary(salary);
          setIsDeleteModalOpen(true);
        }}
        handleViewProfile={handleViewProfile}
        userRole={userRole}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <SalaryForm
          salary={newSalary}
          employees={employees}
          onChange={setNewSalary}
          onSave={handleAddSalary}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isSaving}
        />
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedSalary && (
          <SalaryForm
            salary={selectedSalary}
            employees={employees}
            onChange={(updatedSalary) => setSelectedSalary(updatedSalary as Salary)}
            onSave={handleUpdateSalary}
            onCancel={() => setIsEditModalOpen(false)}
            isSaving={isSaving}
            isEditMode
          />
        )}
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DeleteConfirmation
          onConfirm={handleDeleteSalary}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default SalaryList;