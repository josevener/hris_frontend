"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import DesignationForm from "./DesignationForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { Designation, UserRole, SortKey } from "@/types/employee";
import { useDesignationData } from "@/hooks/useDesignationData";
import { DesignationTable } from "./DesignationTable";
import { useAuth } from "@/lib/AuthContext";
import { createDesignation, updateDesignation, deleteDesignation, fetchDesignation } from "@/services/api/apiDesignation";

const DesignationList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { designations, departments, loading, error, setDesignations } = useDesignationData();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [newDesignation, setNewDesignation] = useState<Partial<Designation>>({
    designation: "",
    department_id: 0,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 5;

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
      const { detail } = event as CustomEvent<Designation>;
      setSelectedDesignation(detail);
      setIsDeleteModalOpen(true);
    };
    window.addEventListener("openDeleteModal", handleOpenDeleteModal);
    return () => window.removeEventListener("openDeleteModal", handleOpenDeleteModal);
  }, []);

  const validateDesignation = (designation: Partial<Designation>): boolean => {
    if (!designation.designation || designation.designation.trim() === "") {
      toast.error("Designation name is required.");
      return false;
    }
    if (designation.designation.length > 255) {
      toast.error("Designation name must not exceed 255 characters.");
      return false;
    }
    if (!designation.department_id || designation.department_id === 0) {
      toast.error("Department is required.");
      return false;
    }
    return true;
  };

  const handleAddDesignation = async () => {
    setIsAdding(true);
    try {
      if (!validateDesignation(newDesignation)) return;

      const addedDesignation = await createDesignation(newDesignation, token);
      setDesignations((prev) => [...prev, addedDesignation]);
      setIsAddDialogOpen(false);
      setNewDesignation({ designation: "", department_id: 0 });
      toast.success("Designation added successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to add designation");
      console.error("Add error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateDesignation = async () => {
    if (!selectedDesignation) return;

    setIsUpdating(true);
    try {
      if (!validateDesignation(selectedDesignation)) return;

      const updatedDesignation = await updateDesignation(selectedDesignation.id, selectedDesignation, token);
      setDesignations((prev) =>
        prev.map((des) => (des.id === updatedDesignation.id ? updatedDesignation : des))
      );
      setIsViewDialogOpen(false);
      setSelectedDesignation(null);
      setIsEditable(false);
      toast.success("Designation updated successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to update designation");
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDesignation = async () => {
    if (!selectedDesignation) return;

    setIsDeleting(true);
    try {
      await deleteDesignation(selectedDesignation.id, token);
      setDesignations((prev) => prev.filter((des) => des.id !== selectedDesignation.id));
      setIsDeleteModalOpen(false);
      setSelectedDesignation(null);
      toast.success("Designation deleted successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to delete designation");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = async (designation: Designation) => {
    try {
      const fullDesignationData = await fetchDesignation(designation.id, token);
      setSelectedDesignation(fullDesignationData);
      setIsViewDialogOpen(true);
      setIsEditable(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Failed to load designation details");
      console.error("View designation error:", err);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedDesignations = useMemo(() => {
    let result = designations ? [...designations] : [];

    if (searchTerm) {
      result = result.filter((des) =>
        [des.designation, departments.find((dept) => dept.id === des.department_id)?.department || ""]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case "department.department":
            aValue = departments.find((dept) => dept.id === a.department_id)?.department || "";
            bValue = departments.find((dept) => dept.id === b.department_id)?.department || "";
            break;
          case "id":
          case "designation":
          case "department_id":
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
            break;
          default:
            return 0; // Handle unexpected keys
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
  }, [designations, departments, searchTerm, sortConfig]);

  const paginatedDesignations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDesignations.slice(start, start + itemsPerPage);
  }, [filteredAndSortedDesignations, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedDesignations.length / itemsPerPage);

  return (
    <div className="flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Designations</h1>
        <div className="flex gap-4">
          <Input
            ref={searchInputRef}
            placeholder="Search designations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Designation
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

      <DesignationTable
        designations={paginatedDesignations}
        departments={departments}
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
        <DesignationForm
          designation={newDesignation}
          departments={departments}
          onChange={setNewDesignation}
          onSave={handleAddDesignation}
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
            setSelectedDesignation(null);
          }
        }}
      >
        {selectedDesignation && (
          <DesignationForm
            designation={selectedDesignation}
            departments={departments}
            onChange={(updated) => setSelectedDesignation(updated as Designation)}
            onSave={handleUpdateDesignation}
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
          onConfirm={handleDeleteDesignation}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default DesignationList;