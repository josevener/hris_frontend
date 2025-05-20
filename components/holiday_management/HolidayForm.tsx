import { useRef, useEffect, useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Edit as EditIcon, Calendar as CalendarIcon } from "lucide-react";
import { Holiday, UserRole } from "@/types/department";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HolidayFormProps {
  holiday: Partial<Holiday>;
  onChange: (updatedHoliday: Partial<Holiday>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  userRole: UserRole;
  isEditMode?: boolean;
  isEditable?: boolean;
  setIsEditable?: (value: boolean) => void;
}

const HolidayForm: React.FC<HolidayFormProps> = ({
  holiday,
  onChange,
  onSave,
  onCancel,
  isSaving,
  userRole,
  isEditMode = false,
  isEditable = false,
  setIsEditable,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [date, setDate] = useState<Date | undefined>(
    holiday.date_holiday && !isNaN(new Date(holiday.date_holiday).getTime())
      ? new Date(holiday.date_holiday)
      : undefined
  );
  const [errors, setErrors] = useState<{ name_holiday?: string; date_holiday?: string; type_holiday?: string }>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Sync local date state with holiday.date_holiday
    if (holiday.date_holiday) {
      const parsedDate = new Date(holiday.date_holiday);
      if (!isNaN(parsedDate.getTime())) {
        console.log("Synced date_holiday:", holiday.date_holiday, "Parsed date:", parsedDate);
        setDate(parsedDate);
      } else {
        console.warn("Invalid date_holiday:", holiday.date_holiday);
        setDate(undefined);
      }
    } else {
      console.log("No date_holiday provided, setting date to undefined");
      setDate(undefined);
    }
  }, [holiday.date_holiday]);

  const handleEditClick = () => {
    if (setIsEditable) {
      setIsEditable(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name_holiday?: string; date_holiday?: string; type_holiday?: string } = {};
    if (!holiday.name_holiday || holiday.name_holiday.trim() === "") {
      newErrors.name_holiday = "Holiday name is required";
    }
    if (!holiday.date_holiday || holiday.date_holiday.trim() === "") {
      newErrors.date_holiday = "Holiday date is required";
    } else if (isNaN(new Date(holiday.date_holiday).getTime())) {
      newErrors.date_holiday = "Invalid date format";
    }
    if (!holiday.type_holiday || holiday.type_holiday.trim() === "") {
      newErrors.type_holiday = "Holiday type is required";
    } else if (!["Regular Holiday", "Special Non-Working Holiday"].includes(holiday.type_holiday)) {
      newErrors.type_holiday = "Invalid holiday type";
    }
    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    console.log("Saving holiday:", holiday, "Selected date:", date);
    if (validateForm()) {
      onSave();
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px] w-[80vw] bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-foreground dark:text-foreground">
          {isEditMode ? "View/Edit Holiday" : "Add New Holiday"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground dark:text-gray-300">
          {isEditMode ? "View or update the holiday details." : "Enter the details for the new holiday."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={isEditMode ? "edit-name_holiday" : "name_holiday"} className="text-foreground dark:text-foreground">
            Holiday Name
          </Label>
          <Input
            id={isEditMode ? "edit-name_holiday" : "name_holiday"}
            value={holiday.name_holiday || ""}
            onChange={(e) => onChange({ ...holiday, name_holiday: e.target.value })}
            placeholder="Enter holiday name"
            disabled={isEditMode && !isEditable}
            maxLength={255}
            className="bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
          {errors.name_holiday && (
            <p className="text-red-500 text-sm">{errors.name_holiday}</p>
          )}
        </div>
       
        <div className="flex flex-col gap-2">
          <Label htmlFor={isEditMode ? "edit-type_holiday" : "type_holiday"} className="text-foreground dark:text-foreground">
            Type
          </Label>
          <Select
            value={holiday.type_holiday || ""}
            onValueChange={(value) => onChange({ ...holiday, type_holiday: value })}
            disabled={isEditMode && !isEditable}
          >
            <SelectTrigger
              id={isEditMode ? "edit-type_holiday" : "type_holiday"}
              className="bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
            >
              <SelectValue placeholder="Select holiday type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Regular Holiday">Regular Holiday</SelectItem>
              <SelectItem value="Special Non-Working Holiday">Special Non-Working Holiday</SelectItem>
            </SelectContent>
          </Select>
          {errors.type_holiday && (
            <p className="text-red-500 text-sm">{errors.type_holiday}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={isEditMode ? "edit-date_holiday" : "date_holiday"} className="text-foreground dark:text-foreground">
            Date
          </Label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                id={isEditMode ? "edit-date_holiday" : "date_holiday"}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700",
                  !date && "text-muted-foreground"
                )}
                disabled={isEditMode && !isEditable}
                onClick={() => console.log("DatePicker button clicked, disabled:", isEditMode && !isEditable)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  console.log("Calendar onSelect triggered, newDate:", newDate);
                  setDate(newDate);
                  onChange({
                    ...holiday,
                    date_holiday: newDate ? format(newDate, "yyyy-MM-dd") : "",
                  });
                  setIsPopoverOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date_holiday && (
            <p className="text-red-500 text-sm">{errors.date_holiday}</p>
          )}
        </div>
      </div>
      <DialogFooter className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          {(isEditMode ? isEditable : true) && (userRole === "HR" || userRole === "Admin") && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                isEditMode ? "Save Changes" : "Save"
              )}
            </Button>
          )}
        </div>
        {isEditMode && !isEditable && (userRole === "HR" || userRole === "Admin") && (
          <Button
            onClick={handleEditClick}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground flex items-center gap-2"
          >
            <EditIcon className="h-4 w-4" /> Edit
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default HolidayForm;