import { useState, useEffect } from "react";
import {
  createShift,
  deleteShift,
  fetchShifts,
  updateShift,
  fetchEmployeesDoesntHaveShift,
} from "@/services/api/apiShifts";
import { fetchEmployees } from "@/services/api/apiEmployee";
import { toast } from "sonner";
import { Shift } from "@/types/shift";
import { Employee } from "@/types/employee";
import { getCookie } from "@/lib/auth";

export const useShiftData = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [employeesWithoutShifts, setEmployeesWithoutShifts] = useState<
    Employee[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getCookie("auth_token");
      setToken(authToken);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const [shiftData, allEmployeeData, employeesWithoutShiftData] =
          await Promise.all([
            fetchShifts(token),
            fetchEmployees(token),
            fetchEmployeesDoesntHaveShift(token),
          ]);

        const enrichedShifts = shiftData.map((shift: Shift) => ({
          ...shift,
          employee_ids: Array.isArray(shift.employee_ids)
            ? shift.employee_ids
            : [],
          schedule_settings: shift.schedule_settings || [],
          employee: Array.isArray(shift.employees)
            ? shift.employees[0]
            : undefined,
          isGroupSchedule:
            shift.isGroupSchedule ??
            (Array.isArray(shift.employee_ids) &&
              shift.employee_ids.length > 1),
        }));

        setShifts(enrichedShifts);
        setAllEmployees(Array.isArray(allEmployeeData) ? allEmployeeData : []);
        setEmployeesWithoutShifts(
          Array.isArray(employeesWithoutShiftData)
            ? employeesWithoutShiftData
            : []
        );
      } catch (err: any) {
        setError(err.message || "Failed to fetch shift data.");
        toast.error(err.message || "Failed to fetch shift data.");
        // console.error("Error fetching shift data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const addShift = async (shift: Partial<Shift>) => {
    if (!token) throw new Error("No authentication token available");
    try {
      const payload = {
        employee_ids: Array.isArray(shift.employee_ids)
          ? shift.employee_ids
          : [],
        start_date: shift.start_date,
        end_date: shift.end_date,
        description: shift.description,
        schedule_settings: shift.schedule_settings,
        isGroupSchedule: shift.isGroupSchedule ?? false,
      };
      const newShift = await createShift(payload, token);
      const updatedShifts = await fetchShifts(token);
      const allEmployeeData = await fetchEmployees(token);
      const employeesWithoutShiftData =
        await fetchEmployeesDoesntHaveShift(token);
      const enrichedShifts = updatedShifts.map((shift: Shift) => ({
        ...shift,
        employee_ids: Array.isArray(shift.employee_ids)
          ? shift.employee_ids
          : [],
        employee: Array.isArray(allEmployeeData)
          ? allEmployeeData.find((emp) => shift.employee_ids.includes(emp.id))
          : undefined,
        isGroupSchedule:
          shift.isGroupSchedule ??
          (Array.isArray(shift.employee_ids) && shift.employee_ids.length > 1),
      }));
      setShifts(enrichedShifts);
      setAllEmployees(Array.isArray(allEmployeeData) ? allEmployeeData : []);
      setEmployeesWithoutShifts(
        Array.isArray(employeesWithoutShiftData)
          ? employeesWithoutShiftData
          : []
      );
      return newShift;
    } catch (err: any) {
      setError(err.message || "Failed to add shift.");
      toast.error(err.message || "Failed to add shift.");
      throw err;
    }
  };

  const editShift = async (id: number, shift: Partial<Shift>) => {
    if (!token) throw new Error("No authentication token available");
    try {
      const payload = {
        employee_ids: Array.isArray(shift.employee_ids)
          ? shift.employee_ids
          : [],
        start_date: shift.start_date,
        end_date: shift.end_date,
        description: shift.description,
        schedule_settings: shift.schedule_settings,
        isGroupSchedule: shift.isGroupSchedule ?? false,
      };
      await updateShift(id, payload, token);
      const updatedShifts = await fetchShifts(token);
      const allEmployeeData = await fetchEmployees(token);
      const employeesWithoutShiftData =
        await fetchEmployeesDoesntHaveShift(token);
      const enrichedShifts = updatedShifts.map((shift: Shift) => ({
        ...shift,
        employee_ids: Array.isArray(shift.employee_ids)
          ? shift.employee_ids
          : [],
        employee: Array.isArray(allEmployeeData)
          ? allEmployeeData.find((emp) => shift.employee_ids.includes(emp.id))
          : undefined,
        isGroupSchedule:
          shift.isGroupSchedule ??
          (Array.isArray(shift.employee_ids) && shift.employee_ids.length > 1),
      }));
      setShifts(enrichedShifts);
      setAllEmployees(Array.isArray(allEmployeeData) ? allEmployeeData : []);
      setEmployeesWithoutShifts(
        Array.isArray(employeesWithoutShiftData)
          ? employeesWithoutShiftData
          : []
      );
    } catch (err: any) {
      setError(err.message || "Failed to edit shift.");
      toast.error(err.message || "Failed to edit shift.");
      throw err;
    }
  };

  const removeShift = async (id: number) => {
    if (!token) throw new Error("No authentication token available");
    try {
      await deleteShift(id, token);
      const updatedShifts = await fetchShifts(token);
      const allEmployeeData = await fetchEmployees(token);
      const employeesWithoutShiftData =
        await fetchEmployeesDoesntHaveShift(token);
      const enrichedShifts = updatedShifts.map((shift: Shift) => ({
        ...shift,
        employee_ids: Array.isArray(shift.employee_ids)
          ? shift.employee_ids
          : [],
        employee: Array.isArray(allEmployeeData)
          ? allEmployeeData.find((emp) => shift.employee_ids.includes(emp.id))
          : undefined,
        isGroupSchedule:
          shift.isGroupSchedule ??
          (Array.isArray(shift.employee_ids) && shift.employee_ids.length > 1),
      }));
      setShifts(enrichedShifts);
      setAllEmployees(Array.isArray(allEmployeeData) ? allEmployeeData : []);
      setEmployeesWithoutShifts(
        Array.isArray(employeesWithoutShiftData)
          ? employeesWithoutShiftData
          : []
      );
    } catch (err: any) {
      setError(err.message || "Failed to remove shift.");
      toast.error(err.message || "Failed to remove shift.");
      throw err;
    }
  };

  return {
    shifts,
    employees: employeesWithoutShifts,
    allEmployees,
    loading,
    error,
    setShifts,
    addShift,
    editShift,
    removeShift,
  };
};
