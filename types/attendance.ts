import { Employee } from "./employee";

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  clock_in: string; // Format: "HH:mm:ss"
  clock_in_location?: string | null;
  clock_out?: string | null; // Format: "HH:mm:ss"
  clock_out_location?: string | null;
  missing_time_out: number; // 0 or 1
  worked_hours?: number | null;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}
