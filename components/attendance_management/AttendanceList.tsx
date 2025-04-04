"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import { Attendance } from "@/types/attendance";
import { UserRole } from "@/types/employee";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import AttendanceTable from "./AttendanceTable";
import AttendanceForm from "./AttendanceForm";

const AttendanceList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { attendances, employees, loading, error, addAttendance, editAttendance } = useAttendanceData();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [newAttendance, setNewAttendance] = useState<Partial<Attendance>>({
    employee_id: 0,
    date: new Date().toISOString().split("T")[0],
    clock_in: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Rest of your component logic remains the same...
  const validateAttendance = (attendance: Partial<Attendance>): boolean => {
    if (!attendance.employee_id || attendance.employee_id === 0) {
      toast.error("Employee is required.");
      return false;
    }
    if (!attendance.date) {
      toast.error("Date is required.");
      return false;
    }
    if (!attendance.clock_in) {
      toast.error("Clock-in time is required.");
      return false;
    }
    return true;
  };

  const handleAddAttendance = async () => {
    if (!validateAttendance(newAttendance)) return;
    setIsSaving(true);
    try {
      await addAttendance(newAttendance);
      setIsAddModalOpen(false);
      setNewAttendance({ employee_id: 0, date: new Date().toISOString().split("T")[0], clock_in: "" });
      toast.success("Attendance recorded successfully");
    } catch (err) {
      toast.error("Failed to record attendance");
      console.error("Add error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAttendance = async () => {
    if (!selectedAttendance || !validateAttendance(selectedAttendance)) return;
    setIsSaving(true);
    try {
      await editAttendance(selectedAttendance.id, selectedAttendance);
      setIsEditModalOpen(false);
      setSelectedAttendance(null);
      toast.success("Attendance updated successfully");
    } catch (err) {
      toast.error("Failed to update attendance");
      console.error("Update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewProfile = () => {
    toast.info("View profile functionality to be implemented");
  };

  const filteredAttendances = useMemo(() => {
    let result = [...attendances];
    if (searchTerm) {
      result = result.filter((attendance) =>
        [
          attendance.employee?.user?.lastname || "",
          attendance.employee?.user?.firstname || "",
          attendance.date,
          attendance.clock_in || "",
          attendance.clock_out || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [attendances, searchTerm]);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search attendance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Record Attendance
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <AttendanceTable
        attendances={filteredAttendances}
        loading={loading}
        handleEdit={(attendance) => {
          setSelectedAttendance(attendance);
          setIsEditModalOpen(true);
        }}
        handleViewProfile={handleViewProfile}
        userRole={userRole}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <AttendanceForm
          attendance={newAttendance}
          employees={employees}
          onChange={setNewAttendance}
          onSave={handleAddAttendance}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isSaving}
        />
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedAttendance && (
          <AttendanceForm
            attendance={selectedAttendance}
            employees={employees}
            onChange={(updatedAttendance) => setSelectedAttendance(updatedAttendance as Attendance)}
            onSave={handleUpdateAttendance}
            onCancel={() => setIsEditModalOpen(false)}
            isSaving={isSaving}
            isEditMode
          />
        )}
      </Dialog>
    </div>
  );
};

export default AttendanceList;