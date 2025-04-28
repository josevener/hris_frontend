import SettingsLayout from "./SettingsLayout";
import ShiftList from "./ShiftScheduleManagement/ShiftList";

// Shift Schedule Page
export function ShiftScheduleSettings() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <ShiftList />
    </div>
  );
}