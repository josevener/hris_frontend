"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import DepartmentForm from "./DepartmentForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { Department, UserRole, SortKey } from "@/types/employee";
import { useDepartmentData } from "@/hooks/useDepartmentData";
import { DepartmentTable } from "./DepartmentTable";
import { useAuth } from "@/lib/AuthContext";
import { createDepartment, updateDepartment, deleteDepartment, fetchDepartment } from "@/services/api/apiDepartment";

const DepartmentList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { departments, loading, error, setDepartments } = useDepartmentData();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    department: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const isLoading = loading || isAdding || isUpdating || isDeleting;

  // Ref for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus the search input when the component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Listen for delete modal open event
  useEffect(() => {
    const handleOpenDeleteModal = (event: Event) => {
      const { detail } = event as CustomEvent<Department>;
      setSelectedDepartment(detail);
      setIsDeleteModalOpen(true);
    };
    window.addEventListener("openDeleteModal", handleOpenDeleteModal);
    return () => window.removeEventListener("openDeleteModal", handleOpenDeleteModal);
  }, []);

  const validateDepartment = (department: Partial<Department>): boolean => {
    if (!department.department || department.department.trim() === "") {
      toast.error("Department name is required.");
      return false;
    }
    if (department.department.length > 255) {
      toast.error("Department name must not exceed 255 characters.");
      return false;
    }
    return true;
  };

  const handleAddDepartment = async () => {
    setIsAdding(true);
    try {
      if (!validateDepartment(newDepartment)) return;

      const addedDepartment = await createDepartment(newDepartment, token);
      console.log("Added department:", addedDepartment);
      setDepartments((prev) => {
        console.log("Current departments:", prev);
        return [...prev, addedDepartment];
      });
      setIsAddDialogOpen(false);
      setNewDepartment({ department: "" });
      toast.success("Department added successfully");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to add department");
      console.error("Add error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment) return;

    setIsUpdating(true);
    try {
      if (!validateDepartment(selectedDepartment)) return;

      const updatedDepartment = await updateDepartment(selectedDepartment.id, selectedDepartment, token);
      setDepartments((prev) =>
        prev.map((dept) => (dept.id === updatedDepartment.id ? updatedDepartment : dept))
      );
      setIsViewDialogOpen(false);
      setSelectedDepartment(null);
      setIsEditable(false);
      toast.success("Department updated successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to update department");
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    setIsDeleting(true);
    try {
      await deleteDepartment(selectedDepartment.id, token);
      setDepartments((prev) => prev.filter((dept) => dept.id !== selectedDepartment.id));
      setIsDeleteModalOpen(false);
      setSelectedDepartment(null);
      toast.success("Department deleted successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = async (department: Department) => {
    try {
      const fullDepartmentData = await fetchDepartment(department.id, token);
      console.log("Fetched department:", fullDepartmentData);
      setSelectedDepartment(fullDepartmentData);
      setIsViewDialogOpen(true);
      setIsEditable(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Failed to load department details");
      console.error("View department error:", err);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedDepartments = useMemo(() => {
    let result = departments ? [...departments] : [];

    if (searchTerm) {
      result = result.filter((dept) =>
        dept.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case "id":
          case "department":
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
            break;
          default:
            return 0; // Handle unexpected keys (e.g., designation, department_id, department.department)
        }

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return result;
  }, [departments, searchTerm, sortConfig]);

  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDepartments.slice(start, start + itemsPerPage);
  }, [filteredAndSortedDepartments, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedDepartments.length / itemsPerPage);

  return (
    <div className="flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Departments</h1>
        <div className="flex gap-4">
          <Input
            ref={searchInputRef}
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Department
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

      <DepartmentTable
        departments={paginatedDepartments}
        loading={isLoading}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleViewProfile={handleViewProfile}
        userRole={userRole}
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DepartmentForm
          department={newDepartment}
          onChange={setNewDepartment}
          onSave={handleAddDepartment}
          onCancel={() => setIsAddDialogOpen(false)}
          isSaving={isAdding}
          userRole={userRole}
        />
      </Dialog>

      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setIsEditable(false);
            setSelectedDepartment(null);
          }
        }}
      >
        {selectedDepartment && (
          <DepartmentForm
            department={selectedDepartment}
            onChange={(updated) => setSelectedDepartment(updated as Department)}
            onSave={handleUpdateDepartment}
            onCancel={() => setIsViewDialogOpen(false)}
            isSaving={isUpdating}
            userRole={userRole}
            isEditMode
            isEditable={isEditable}
            setIsEditable={setIsEditable}
          />
        )}
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DeleteConfirmation
          onConfirm={handleDeleteDepartment}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default DepartmentList;