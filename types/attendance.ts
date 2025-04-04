import { Employee } from "./salary"; // Reuse Employee type

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  clock_in: string; // Format: "HH:mm:ss"
  clock_out?: string | null; // Format: "HH:mm:ss"
  break_start?: string | null; // Format: "HH:mm:ss"
  break_end?: string | null; // Format: "HH:mm:ss"
  missing_time_out: number; // 0 or 1
  worked_hours?: number | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}
