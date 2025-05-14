import { Employee } from "./employee";

export interface DaySchedule {
  day: string;
  is_rest_day: boolean;
  hours: string;
}

export interface Shift {
  id?: number;
  employee_ids: number[];
  start_date: string;
  end_date: string;
  description: string;
  schedule_settings: DaySchedule[];
  employees?: Employee;
  isGroupSchedule?: boolean;
}

export interface PartialShift {
  id?: number;
  employee_ids?: number[];
  start_date?: string;
  end_date?: string;
  description?: string;
  schedule_settings?: DaySchedule[];
  isGroupSchedule?: boolean;
}
