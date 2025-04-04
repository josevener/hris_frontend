import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Attendance } from "@/types/attendance";
import { Employee } from "@/types/salary";

interface AttendanceFormProps {
  attendance: Partial<Attendance>;
  employees: Employee[];
  onChange: (updatedAttendance: Partial<Attendance>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  attendance,
  employees,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
}) => {
  const getFullName = (employee: Employee): string => {
    const user = employee.user;
    if (!user) return "Unknown Employee";
    return `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim();
  };

  const currentEmployeeName = () => {
    if (attendance.employee) {
      return getFullName(attendance.employee);
    }
    const employee = employees.find((emp) => emp.id === attendance.employee_id);
    return employee ? getFullName(employee) : "Unknown Employee";
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">
          {isEditMode ? "Edit Attendance" : "Record Attendance"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="employee" className="text-sm font-medium">
            Employee *
          </Label>
          <Select
            onValueChange={(value) => onChange({ ...attendance, employee_id: Number(value) })}
            value={attendance.employee_id ? attendance.employee_id.toString() : ""}
            disabled={isEditMode}
          >
            <SelectTrigger className="w-full">
              {isEditMode ? (
                <span>{currentEmployeeName()}</span>
              ) : (
                <SelectValue placeholder="Choose an employee" />
              )}
            </SelectTrigger>
            <SelectContent>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {getFullName(employee)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No employees available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="date" className="text-sm font-medium">
            Date *
          </Label>
          <Input
            id="date"
            type="date"
            value={attendance.date || ""}
            onChange={(e) => onChange({ ...attendance, date: e.target.value })}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="clock_in" className="text-sm font-medium">
              Clock In *
            </Label>
            <Input
              id="clock_in"
              type="time"
              value={attendance.clock_in || ""}
              onChange={(e) => onChange({ ...attendance, clock_in: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="clock_out" className="text-sm font-medium">
              Clock Out
            </Label>
            <Input
              id="clock_out"
              type="time"
              value={attendance.clock_out || ""}
              onChange={(e) => onChange({ ...attendance, clock_out: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="px-4 py-2 text-sm">
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isSaving} className="px-4 py-2 text-sm flex items-center">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AttendanceForm;