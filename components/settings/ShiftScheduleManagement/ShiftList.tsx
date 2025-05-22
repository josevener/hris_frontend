"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import ShiftForm from "./ShiftForm";
import { useShiftData } from "@/hooks/useShiftData";
import ShiftTable from "./ShiftTable";
import { UserRole } from "@/types/employee";
import { Shift } from "@/types/shift";
import DeleteConfirmation from "./ShiftDeleteConfirmation";

const ShiftList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { shifts, employees: employeesWithoutShifts, allEmployees, loading, error, addShift, editShift, removeShift } = useShiftData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    employee_ids: [],
    start_date: "",
    end_date: "",
    description: "",
    schedule_settings: [
      { day: "Sunday", is_rest_day: false, hours: "8hrs fixed" },
      { day: "Monday", is_rest_day: false, hours: "8hrs fixed" },
      { day: "Tuesday", is_rest_day: false, hours: "8hrs fixed" },
      { day: "Wednesday", is_rest_day: false, hours: "8hrs fixed" },
      { day: "Thursday", is_rest_day: false, hours: "8hrs fixed" },
      { day: "Friday", is_rest_day: false, hours: "8hrs fixed" },
      { day: "Saturday", is_rest_day: false, hours: "8hrs fixed" },
    ],
    isGroupSchedule: false, // Default to single employee
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const validateShift = (shift: Partial<Shift>): boolean => {
    if (!shift.employee_ids || shift.employee_ids.length === 0) {
      toast.error("At least one employee is required.");
      return false;
    }
    if (!shift.isGroupSchedule && shift.employee_ids.length > 1) {
      toast.error("Single employee schedule can only have one employee.");
      return false;
    }
    if (!shift.start_date) {
      toast.error("Start date is required.");
      return false;
    }
    if (!shift.end_date) {
      toast.error("End date is required.");
      return false;
    }
    if (new Date(shift.start_date) > new Date(shift.end_date)) {
      toast.error("End date must be after start date.");
      return false;
    }
    if (!shift.description) {
      toast.error("Description is required.");
      return false;
    }
    if (!shift.schedule_settings || shift.schedule_settings.length !== 7) {
      toast.error("Schedule settings must include all days of the week.");
      return false;
    }
    for (const setting of shift.schedule_settings) {
      if (!setting.is_rest_day && !setting.hours) {
        toast.error(`Hours must be specified for ${setting.day} if it is not a rest day.`);
        return false;
      }
    }
    return true;
  };

  const handleAddShift = async () => {
    if (!validateShift(newShift)) return;
    setIsSaving(true);
    try {
      await addShift(newShift);
      setIsAddModalOpen(false);
      setNewShift({
        employee_ids: [],
        start_date: "",
        end_date: "",
        description: "",
        schedule_settings: [
          { day: "Sunday", is_rest_day: false, hours: "8hrs fixed" },
          { day: "Monday", is_rest_day: false, hours: "8hrs fixed" },
          { day: "Tuesday", is_rest_day: false, hours: "8hrs fixed" },
          { day: "Wednesday", is_rest_day: false, hours: "8hrs fixed" },
          { day: "Thursday", is_rest_day: false, hours: "8hrs fixed" },
          { day: "Friday", is_rest_day: false, hours: "8hrs fixed" },
          { day: "Saturday", is_rest_day: false, hours: "8hrs fixed" },
        ],
        isGroupSchedule: false,
      });
      toast.success("Shift schedule added successfully");
    } catch (err) {
      toast.error("Failed to add shift schedule");
      console.error("Add error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateShift = async () => {
    if (!selectedShift || !validateShift(selectedShift)) return;
    setIsSaving(true);
    try {
      await editShift(Number(selectedShift.id), selectedShift);
      setIsDetailModalOpen(false);
      setSelectedShift(null);
      setIsEditMode(false);
      toast.success("Shift schedule updated successfully");
    } catch (err) {
      toast.error("Failed to update shift schedule");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift) return;
    setIsDeleting(true);
    try {
      await removeShift(Number(selectedShift.id));
      setIsDeleteModalOpen(false);
      setSelectedShift(null);
      toast.success("Shift schedule deleted successfully");
    } catch (err) {
      toast.error("Failed to delete shift schedule");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (shift: Shift) => {
    setSelectedShift({ ...shift, employee_ids: shift.employee_ids || [], isGroupSchedule: shift.isGroupSchedule ?? shift.employee_ids.length > 1 });
    setIsEditMode(false);
    setIsDetailModalOpen(true);
  };

  const handleEditToggle = () => {
    setIsEditMode(true);
  };

  const filteredShifts = useMemo(() => {
    let result = [...shifts];
    if (searchTerm) {
      result = result.filter((shift) =>
        [
          shift.employee_ids
            .map((id) => allEmployees.find((emp) => emp.id === id)?.user?.lastname || "")
            .join(" "),
          shift.employee_ids
            .map((id) => allEmployees.find((emp) => emp.id === id)?.user?.firstname || "")
            .join(" "),
          shift.start_date || "",
          shift.end_date || "",
          shift.description || "",
          shift.schedule_settings?.map((s) => `${s.day} ${s.hours} ${s.is_rest_day ? "Rest Day" : ""}`).join(" ") || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [shifts, searchTerm, allEmployees]);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Shift Scheduling</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Shift Schedule
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <ShiftTable
        shifts={filteredShifts}
        loading={loading}
        handleDelete={(item) => {
          setSelectedShift(item);
          setIsDeleteModalOpen(true);
        }}
        handleView={handleView}
        userRole={userRole}
        allEmployees={allEmployees}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <ShiftForm
          shift={newShift}
          employees={employeesWithoutShifts}
          onChange={setNewShift}
          onSave={handleAddShift}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isSaving}
        />
      </Dialog>

      <Dialog open={isDetailModalOpen} onOpenChange={(open) => {
        setIsDetailModalOpen(open);
        if (!open) {
          setSelectedShift(null);
          setIsEditMode(false);
        }
      }}>
        {selectedShift && (
          <ShiftForm
            shift={selectedShift}
            employees={allEmployees}
            onChange={(updatedShift) => setSelectedShift(updatedShift as Shift)}
            onSave={handleUpdateShift}
            onCancel={() => setIsDetailModalOpen(false)}
            isSaving={isSaving}
            isEditMode={isEditMode}
            isViewMode={!isEditMode}
            onEditToggle={handleEditToggle}
          />
        )}
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DeleteConfirmation
          onConfirm={handleDeleteShift}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default ShiftList;