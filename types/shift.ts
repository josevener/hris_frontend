import { Employee } from "@/types/employee";

export interface DaySchedule {
  day: string; // e.g., "Sunday", "Monday", etc.
  is_rest_day: boolean; // Toggle for rest day
  hours: string; // e.g., "8hrs fixed", "4hrs fixed", or a custom value like "6hrs"
}

export interface Shift {
  id: number;
  employee_id: number;
  start_date: string; // e.g., "2025-04-28"
  end_date: string; // e.g., "2025-05-04"
  description: string; // e.g., "Weekly schedule for employee"
  schedule_settings: DaySchedule[]; // Array of settings for each day of the week
  created_at: string;
  updated_at: string;
  employee?: Employee;
}
