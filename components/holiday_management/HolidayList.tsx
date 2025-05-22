"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import HolidayForm from "./HolidayForm";
import { Holiday, UserRole, SortKey } from "@/types/department";
import { useHolidayData } from "@/hooks/useHolidayData";
import { HolidayTable } from "./HolidayTable";
import { useAuth } from "@/lib/AuthContext";
import { createHoliday, updateHoliday, deleteHoliday, fetchHoliday } from "@/services/api/apiHoliday";
import DeleteConfirmation from "./DeleteConfirmation";

const HolidayList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { holidays, loading, error, setHolidays } = useHolidayData();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name_holiday: "",
    date_holiday: "",
    type_holiday: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const isLoading = loading || isAdding || isUpdating || isDeleting;

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleOpenDeleteModal = (event: Event) => {
      const { detail } = event as CustomEvent<Holiday>;
      setSelectedHoliday(detail);
      setIsDeleteModalOpen(true);
    };
    window.addEventListener("openDeleteModal", handleOpenDeleteModal);
    return () => window.removeEventListener("openDeleteModal", handleOpenDeleteModal);
  }, []);

  const validateHoliday = (holiday: Partial<Holiday>, isUpdate: boolean = false): boolean => {
    if (!holiday.name_holiday || holiday.name_holiday.trim() === "") {
      toast.error("Holiday name is required.");
      return false;
    }
    if (holiday.name_holiday.length > 255) {
      toast.error("Holiday name must not exceed 255 characters.");
      return false;
    }
    if (!holiday.date_holiday || holiday.date_holiday.trim() === "") {
      toast.error("Holiday date is required.");
      return false;
    }
    if (isNaN(new Date(holiday.date_holiday).getTime())) {
      toast.error("Holiday date must be in YYYY-MM-DD format.");
      return false;
    }
    if (!holiday.type_holiday || holiday.type_holiday.trim() === "") {
      toast.error("Holiday type is required.");
      return false;
    }
    if (!["Regular Holiday", "Special Non-Working Holiday"].includes(holiday.type_holiday)) {
      toast.error("Holiday type must be either Regular Holiday or Special Non-Working Holiday.");
      return false;
    }
    // Check for duplicate date
    const existingHoliday = holidays.find(
      (h) => h.date_holiday === holiday.date_holiday && (!isUpdate || h.id !== holiday.id)
    );
    if (existingHoliday) {
      toast.error("A holiday already exists for this date.");
      return false;
    }
    return true;
  };

  const handleAddHoliday = async () => {
    setIsAdding(true);
    try {
      if (!validateHoliday(newHoliday)) return;

      const addedHoliday = await createHoliday(newHoliday, token);
      console.log("Added holiday:", addedHoliday);
      setHolidays((prev) => {
        console.log("Current holidays:", prev);
        return [...prev, addedHoliday];
      });
      setIsAddDialogOpen(false);
      setNewHoliday({ name_holiday: "", date_holiday: "", type_holiday: "" });
      toast.success("Holiday added successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to add holiday");
      console.error("Add error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateHoliday = async () => {
    if (!selectedHoliday) return;

    setIsUpdating(true);
    try {
      if (!validateHoliday(selectedHoliday, true)) return;

      const updatedHoliday = await updateHoliday(selectedHoliday.id, selectedHoliday, token);
      setHolidays((prev) =>
        prev.map((h) => (h.id === updatedHoliday.id ? updatedHoliday : h))
      );
      setIsViewDialogOpen(false);
      setSelectedHoliday(null);
      setIsEditable(false);
      toast.success("Holiday updated successfully");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to update holiday");
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteHoliday = async () => {
    if (!selectedHoliday) return;

    setIsDeleting(true);
    try {
      console.log("Deleting holiday ID:", selectedHoliday.id);
      await deleteHoliday(selectedHoliday.id, token);
      setHolidays((prev) => prev.filter((h) => h.id !== selectedHoliday.id));
      setIsDeleteModalOpen(false);
      setSelectedHoliday(null);
      toast.success("Holiday deleted successfully");
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Delete error details:", err, "Response:", err.response);
      toast.error(err.message || "Failed to delete holiday");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = async (holiday: Holiday) => {
    try {
      const fullHolidayData = await fetchHoliday(holiday.id, token);
      console.log("Fetched holiday:", fullHolidayData);
      setSelectedHoliday(fullHolidayData);
      setIsViewDialogOpen(true);
      setIsEditable(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Failed to load holiday details");
      console.error("View holiday error:", err);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedHolidays = useMemo(() => {
    let result = holidays ? [...holidays] : [];

    if (searchTerm) {
      result = result.filter((h) =>
        h.name_holiday.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortConfig.key) {
          case "id":
            aValue = a.id;
            bValue = b.id;
            break;
          case "name_holiday":
            aValue = a.name_holiday;
            bValue = b.name_holiday;
            break;
          case "date_holiday":
            aValue = a.date_holiday;
            bValue = b.date_holiday;
            break;
          case "type_holiday":
            aValue = a.type_holiday;
            bValue = b.type_holiday;
            break;
          default:
            return 0;
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
  }, [holidays, searchTerm, sortConfig]);

  const paginatedHolidays = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedHolidays.slice(start, start + itemsPerPage);
  }, [filteredAndSortedHolidays, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedHolidays.length / itemsPerPage);

  return (
    <div className="flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Holidays</h1>
        <div className="flex gap-4">
          <Input
            ref={searchInputRef}
            placeholder="Search holidays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Holiday
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

      <HolidayTable
        holidays={paginatedHolidays}
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
        <HolidayForm
          holiday={newHoliday}
          onChange={setNewHoliday}
          onSave={handleAddHoliday}
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
            setSelectedHoliday(null);
          }
        }}
      >
        {selectedHoliday && (
          <HolidayForm
            holiday={selectedHoliday}
            onChange={(updated) => setSelectedHoliday(updated as Holiday)}
            onSave={handleUpdateHoliday}
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
          onConfirm={handleDeleteHoliday}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default HolidayList;