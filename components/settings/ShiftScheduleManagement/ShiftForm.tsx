"use client";

import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Edit, RefreshCw } from "lucide-react";
import { Employee } from "@/types/employee";
import { Shift, DaySchedule } from "@/types/shift";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ShiftFormProps {
  shift: Partial<Shift>;
  employees: Employee[];
  onChange: (updatedShift: Partial<Shift>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEditMode?: boolean;
  isViewMode?: boolean;
  onEditToggle?: () => void;
}

const ShiftForm: React.FC<ShiftFormProps> = ({
  shift,
  employees,
  onChange,
  onSave,
  onCancel,
  isSaving,
  isEditMode = false,
  isViewMode = false,
  onEditToggle,
}) => {
  const isReadOnly = !isEditMode && isViewMode;
  const isGroupSchedule = shift.isGroupSchedule ?? false;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hourOptions = ["8hrs fixed", "4hrs fixed"];

  const scheduleSettings: DaySchedule[] = shift.schedule_settings || daysOfWeek.map((day) => ({
    day,
    is_rest_day: false,
    hours: "8hrs fixed",
  }));

  const getFullName = (employee: Employee): string => {
    const user = employee.user;
    return user
      ? `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname} ${user.extension || ""}`.trim()
      : `Employee #${employee.id}`;
  };

  const currentEmployeesNames = () => {
    const selectedEmployees = employees.filter((emp) => shift.employee_ids?.includes(emp.id));
    return selectedEmployees.length > 0
      ? selectedEmployees.map(getFullName).join(", ")
      : shift.employee_ids?.length
      ? `Employee #${shift.employee_ids.join(", #")}`
      : "No employees selected";
  };

  const handleScheduleSettingChange = (day: string, isRestDay: boolean, hours: string) => {
    const updatedSettings = scheduleSettings.map((setting) => {
      if (setting.day === day) {
        return { ...setting, is_rest_day: isRestDay, hours };
      }
      return setting;
    });
    onChange({ ...shift, schedule_settings: updatedSettings });
  };

  const toggleAllRestDays = (isRestDay: boolean) => {
    const updatedSettings = scheduleSettings.map((setting) => ({
      ...setting,
      is_rest_day: isRestDay,
      hours: isRestDay ? "Rest Day" : "8hrs fixed",
    }));
    onChange({ ...shift, schedule_settings: updatedSettings });
  };

  const resetAllSettings = () => {
    const updatedSettings = daysOfWeek.map((day) => ({
      day,
      is_rest_day: false,
      hours: "8hrs fixed",
    }));
    onChange({ ...shift, schedule_settings: updatedSettings });
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const id = Number(employeeId);
    let updatedIds = Array.isArray(shift.employee_ids) ? [...shift.employee_ids] : [];

    if (isGroupSchedule) {
      // Group mode: Allow multiple selections
      updatedIds = updatedIds.includes(id)
        ? updatedIds.filter((eid) => eid !== id)
        : [...updatedIds, id];
    } else {
      // Single mode: Allow only one selection
      updatedIds = updatedIds.includes(id) ? [] : [id];
    }

    onChange({ ...shift, employee_ids: updatedIds });
  };

  const handleGroupScheduleToggle = (checked: boolean) => {
    const currentIds = Array.isArray(shift.employee_ids) ? [...shift.employee_ids] : [];
    // If switching to single mode and more than one employee is selected, keep only the first
    const updatedIds = checked || currentIds.length <= 1 ? currentIds : [currentIds[0]];
    onChange({ ...shift, isGroupSchedule: checked, employee_ids: updatedIds });
  };

  // Custom multi-select component to keep dropdown open
  const MultiSelect = ({ value, onChange, options }: { value: number[], onChange: (ids: number[]) => void, options: Employee[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full border border-gray-300 rounded-md p-2 text-left"
        >
          {value.length > 0 ? value.map(id => getFullName(options.find(emp => emp.id === id) || { id } as Employee)).join(", ") : "Select employees"}
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
            {options.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleEmployeeSelect(employee.id.toString());
                  // Do not close the dropdown
                }}
              >
                <input
                  type="checkbox"
                  checked={shift.employee_ids?.includes(employee.id) || false}
                  onChange={() => {}}
                  className="mr-2"
                />
                {getFullName(employee)}
              </div>
            ))}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full p-2 text-center bg-gray-200 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <DialogContent className="max-w-[75vw] w-[1200px] shadow-lg rounded-lg">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-3xl font-bold text-center text-gray-800">
          {isViewMode ? "View Shift Schedule" : isEditMode ? "Edit Shift Schedule" : "Create Shift Schedule"}
        </DialogTitle>
        <DialogDescription className="text-sm text-center text-gray-500">
          Fill up the required information to manage shifts.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-row gap-8 py-4">
        <div className="flex flex-col gap-4 w-1/2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="group-schedule"
              checked={isGroupSchedule}
              onCheckedChange={handleGroupScheduleToggle}
              disabled={isReadOnly}
            />
            <Label htmlFor="group-schedule" className="text-sm font-semibold text-gray-700">
              Batch/Group Schedule (Optional)
            </Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="employees" className="text-sm font-semibold text-gray-700">
              {isGroupSchedule ? "Employees" : "Employee"} <span className="text-red-500">*</span>
            </Label>
            {isReadOnly ? (
              <Input value={currentEmployeesNames()} readOnly className="w-full border-gray-300 rounded-md" />
            ) : (
              isGroupSchedule ? (
                <MultiSelect
                  value={shift.employee_ids || []}
                  onChange={(ids) => onChange({ ...shift, employee_ids: ids })}
                  options={employees}
                />
              ) : (
                <Select
                  onValueChange={handleEmployeeSelect}
                  value={shift.employee_ids?.[0]?.toString() || ""}
                >
                  <SelectTrigger className="w-full border-gray-300 rounded-md">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id.toString()}
                        >
                          {getFullName(employee)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No available employees</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-gray-700">
              Schedule Period <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="start_date" className="sr-only">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={shift.start_date || ""}
                  onChange={(e) => onChange({ ...shift, start_date: e.target.value })}
                  className="w-full border-gray-300 rounded-md"
                  readOnly={isReadOnly}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end_date" className="sr-only">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={shift.end_date || ""}
                  onChange={(e) => onChange({ ...shift, end_date: e.target.value })}
                  className="w-full border-gray-300 rounded-md"
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description <span className="text-red-500">*</span>
            </Label>
            {isReadOnly ? (
              <Textarea
                id="description"
                value={shift.description || ""}
                readOnly
                className="w-full h-24 resize-none border-gray-300 rounded-md"
              />
            ) : (
              <Textarea
                id="description"
                value={shift.description || ""}
                onChange={(e) => onChange({ ...shift, description: e.target.value })}
                placeholder="Provide details about the shift..."
                className="w-full h-24 resize-none border-gray-300 rounded-md"
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Schedule Settings</Label>
                <p className="text-xs text-gray-500">Check the toggle to indicate Restday</p>
              </div>
              {!isReadOnly && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllRestDays(true)}
                    className="text-gray-600 border-gray-300"
                  >
                    Mark All as Rest Days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAllSettings}
                    className="text-gray-600 border-gray-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset All
                  </Button>
                </div>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {daysOfWeek.map((day) => {
                const setting = scheduleSettings.find((s) => s.day === day) || {
                  day,
                  is_rest_day: false,
                  hours: "8hrs fixed",
                };
                const displayValue = setting.is_rest_day ? "" : setting.hours;

                return (
                  <div key={day} className="flex items-center gap-2 mb-2 p-1">
                    <div className="flex-1 flex items-center gap-2">
                      {isReadOnly ? (
                        <div className="flex items-center border rounded-md px-3 py-2 w-full">
                          <span className="w-24 text-sm font-medium text-gray-700">{day}</span>
                          <Input
                            value={displayValue || "Rest Day"}
                            readOnly
                            className="w-full border-none focus:ring-0 bg-transparent"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <Select
                              onValueChange={(value) => {
                                if (value === "Rest Day") {
                                  handleScheduleSettingChange(day, true, "Rest Day");
                                } else {
                                  handleScheduleSettingChange(day, false, value);
                                }
                              }}
                              value={displayValue || "Rest Day"}
                            >
                              <SelectTrigger className="w-full border-gray-300 rounded-md hover:border-gray-400 focus:ring-2 focus:ring-blue-500 transition-all">
                                <span className="w-24 text-sm font-medium text-gray-700">{day}</span>
                                <SelectValue placeholder="" />
                              </SelectTrigger>
                              <SelectContent>
                                {hourOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                                <SelectItem value="Rest Day">Rest Day</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            <Label htmlFor={`rest-day-switch-${day}`} className="sr-only">
                              {setting.is_rest_day ? "Unmark Rest Day" : "Mark as Rest Day"} for {day}
                            </Label>
                            <Switch
                              id={`rest-day-switch-${day}`}
                              checked={setting.is_rest_day}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleScheduleSettingChange(day, true, "Rest Day");
                                } else {
                                  handleScheduleSettingChange(day, false, "8hrs fixed");
                                }
                              }}
                              className="scale-75"
                              title={setting.is_rest_day ? "Unmark Rest Day" : "Mark as Rest Day"}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-3 mt-6">
        {isViewMode && onEditToggle && (
          <Button
            variant="outline"
            onClick={onEditToggle}
            className="px-4 py-2 text-sm bg-gray-900 text-white flex items-center hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-4 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-gray-900 text-white hover:bg-gray-700 transition-colors flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default ShiftForm;