import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Edit, X, RefreshCw } from "lucide-react";
import { Employee } from "@/types/employee";
import { Shift, DaySchedule } from "@/types/shift";

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
  const isReadOnly: boolean = !isEditMode && isViewMode;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hourOptions = ["8hrs fixed", "4hrs fixed"];

  // Initialize schedule settings if not present
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

  const currentEmployeeName = () => {
    const employee = employees.find((emp) => emp.id === shift.employee_id);
    return employee ? getFullName(employee) : `Employee #${shift.employee_id || "Unknown"}`;
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

  const resetDayToRest = (day: string) => {
    handleScheduleSettingChange(day, true, "Rest Day");
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

  return (
    <DialogContent className="max-w-[75vw] w-[1200px] shadow-lg rounded-lg">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-3xl font-bold text-center text-gray-800">
          {isViewMode ? "View Shift Schedule" : isEditMode ? "Edit Shift Adjustment" : "Create Shift Adjustment"}
        </DialogTitle>
        <DialogDescription className="text-sm text-center text-gray-500">
          Fill up the required information to manage shifts.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-row gap-8 py-4">
        <div className="flex flex-col gap-4 w-1/2">
          {/* Employee Select */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="employee" className="text-sm font-semibold text-gray-700">
              Employee <span className="text-red-500">*</span>
            </Label>
            {isReadOnly ? (
              <Input value={currentEmployeeName()} readOnly className="w-full border-gray-300 rounded-md" />
            ) : (
              <Select
                onValueChange={(value) => onChange({ ...shift, employee_id: Number(value) })}
                value={shift.employee_id ? shift.employee_id.toString() : ""}
              >
                <SelectTrigger className="w-full border-gray-300 rounded-md">
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {getFullName(employee)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No employees available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Start Date and End Date */}
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

          {/* Description (Textarea) */}
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
                placeholder="Provide details about the shift adjustment..."
                className="w-full h-24 resize-none border-gray-300 rounded-md"
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          {/* Schedule Settings */}
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
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            {!setting.is_rest_day && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetDayToRest(day);
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full"
                                title="Mark as Rest Day"
                              >
                                <X className="h-4 w-4 text-gray-600" />
                              </Button>
                            )}
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
            className="px-4 py-2 text-sm bg-blue-600 text-white flex items-center hover:bg-blue-700 transition-colors"
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