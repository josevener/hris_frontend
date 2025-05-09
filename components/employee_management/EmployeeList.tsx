"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import EmployeeForm from "./EmployeeForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { Employee, SortKey, UserRole } from "@/types/employee";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { createEmployee, deleteEmployee, fetchEmployees, fetchEmployee, updateEmployee } from "@/services/api/apiEmployee";
import { EmployeeTable } from "./EmployeeTable";
import { useAuth } from "@/lib/AuthContext";

const EmployeeList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { employees, users, departments, designations, loading: dataLoading, error, setEmployees, setUsers } = useEmployeeData();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    birthdate: null,
    gender: null,
    address: "",
    user_id: 0,
    department_id: 0,
    designation_id: 0,
    joining_date: null,
    contract_type: null,
    sss_id: "",
    philhealth_id: "",
    pagibig_id: "",
    tin: "",
    tax: "",
    dependents: [],
    education_backgrounds: [],
    documents: [],
    company_id_number: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const isLoading = dataLoading || isAdding || isUpdating || isDeleting;

  // Refs for focus management
  const roleFilterSelectRef = useRef<HTMLButtonElement>(null);

  // Blur the SelectTrigger when a sheet opens to prevent it from retaining focus
  useEffect(() => {
    if (isAddSheetOpen || isViewSheetOpen) {
      if (roleFilterSelectRef.current) {
        roleFilterSelectRef.current.blur();
      }
    }
  }, [isAddSheetOpen, isViewSheetOpen]);

  const validateEmployee = (employee: Partial<Employee>): boolean => {
    if (!employee.user_id || employee.user_id === 0) {
      toast.error("Employee Name is required.");
      return false;
    }
    if (!employee.department_id || employee.department_id === 0) {
      toast.error("Department is required.");
      return false;
    }
    if (!employee.designation_id || employee.designation_id === 0) {
      toast.error("Designation is required.");
      return false;
    }
    return true;
  };

  const handleAddEmployee = async () => {
    setIsAdding(true);
    try {
      if (!validateEmployee(newEmployee)) return;

      const companyIdNumber = users.find((u) => u.id === newEmployee.user_id)?.company_id_number || "";
      const payload = {
        ...newEmployee,
        company_id_number: companyIdNumber,
      };
      console.log("Payload sent to createEmployee:", payload);

      const addedEmployee = await createEmployee(payload, token);
      console.log("addedEmployee received:", addedEmployee);

      if (!addedEmployee.id) {
        throw new Error("Employee ID missing from server response");
      }

      const enrichedEmployee: Employee = {
        ...addedEmployee,
        user: users.find((u) => u.id === newEmployee.user_id),
        department: departments.find((d) => d.id === newEmployee.department_id),
        designation: designations.find((des) => des.id === newEmployee.designation_id),
        status: addedEmployee.status || "Active",
        isActive: addedEmployee.isActive !== undefined ? addedEmployee.isActive : 1,
        created_at: addedEmployee.created_at || new Date().toISOString(),
      };

      setEmployees((prev) => {
        const newEmployees = [...prev, enrichedEmployee];
        console.log("Updated employees:", newEmployees);
        return newEmployees;
      });
      setUsers((prev) => prev.filter((u) => u.id !== newEmployee.user_id));
      setIsAddSheetOpen(false);
      setNewEmployee({
        birthdate: null,
        gender: null,
        address: "",
        user_id: 0,
        department_id: 0,
        designation_id: 0,
        joining_date: null,
        contract_type: null,
        sss_id: "",
        philhealth_id: "",
        pagibig_id: "",
        tin: "",
        tax: "",
        dependents: [],
        education_backgrounds: [],
        documents: [],
        company_id_number: "",
      });
      toast.success("Employee added successfully");
      if (userRole === "Employee") toast.info("Your profile has been submitted for review");
    
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors?.company_id_number?.[0] ||
        err.response?.data?.message ||
        err.message || "Failed to add employee";
      toast.error(errorMessage);
      console.error("Add error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateEmployee = async () => {
  if (!selectedEmployee) return;

  setIsUpdating(true);
  try {
    if (!validateEmployee(selectedEmployee)) return;

    // Deduplicate dependents and education_backgrounds
    const deduplicateById = <T extends { id?: number }>(items: T[]): T[] => {
      const seen = new Set<number>();
      return items.filter((item) => {
        if (item.id) {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        }
        return true; // Keep items without id (new records)
      });
    };

    const payload = {
      company_id_number: selectedEmployee.company_id_number?? null,
      birthdate: selectedEmployee.birthdate || null,
      gender: selectedEmployee.gender === "N/A" ? null : selectedEmployee.gender,
      address: selectedEmployee.address || "",
      user_id: selectedEmployee.user_id?? undefined,
      department_id: selectedEmployee.department_id || undefined, // Avoid sending 0
      designation_id: selectedEmployee.designation_id || undefined, // Avoid sending 0
      joining_date: selectedEmployee.joining_date || null,
      contract_type: selectedEmployee.contract_type || null,
      sss_id: selectedEmployee.sss_id || "",
      philhealth_id: selectedEmployee.philhealth_id || "",
      pagibig_id: selectedEmployee.pagibig_id || "",
      tin: selectedEmployee.tin || "",
      tax: selectedEmployee.tax || "",
      dependents: deduplicateById(selectedEmployee.dependents || []).map(dep => ({
        id: dep.id,
        name: dep.name,
        relationship: dep.relationship
      })),
      education_backgrounds: deduplicateById(selectedEmployee.education_backgrounds || []).map(edu => ({
        id: edu.id,
        attainment: edu.attainment,
        course: edu.course
      })),
      documents: selectedEmployee.documents || [],
    };

    // Log payload to debug
    console.log("Update payload (after deduplication):", payload);

    // Ensure department_id and designation_id are valid before sending
    if (payload.department_id === 0 || payload.designation_id === 0) {
      throw new Error("Invalid department or designation ID");
    }

    const response = await updateEmployee(selectedEmployee.id, payload, token);
    console.log("Update response:", response);

    const employees = await fetchEmployees(token);
    setEmployees(employees);

    setIsViewSheetOpen(false);
    setSelectedEmployee(null);
    setIsEditable(false);
    toast.success("Employee updated successfully");
    if (userRole === "Employee") toast.info("Your profile has been updated");

  } catch (err: any) {
    toast.error(err.message || "Failed to update employee");
    console.error("Update error:", err);
  } finally {
    setIsUpdating(false);
  }
};

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    setIsDeleting(true);
    try {
      await deleteEmployee(selectedEmployee.id, token);
      setEmployees((prev) => prev.filter((emp) => emp.id !== selectedEmployee.id));
      if (selectedEmployee.user) setUsers((prev) => [...prev, selectedEmployee.user!]);
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
      toast.success("Employee deleted successfully");

    } catch (err: any) {
      toast.error(err.message || "Failed to delete employee");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewProfile = async (employee: Employee) => {
    try {
      const fullEmployeeData = await fetchEmployee(employee.id, token);
      console.log("Fetched employee data:", fullEmployeeData);
      setSelectedEmployee(fullEmployeeData);
      setIsViewSheetOpen(true);
      setIsEditable(false);
    } catch (err: any) {
      toast.error("Failed to load employee details");
      console.error("View profile error:", err);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleEmployeeChange = (updatedEmployee: Partial<Employee>) => {
    setSelectedEmployee((prev) => (prev ? { ...prev, ...updatedEmployee } : null));
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    if (searchTerm) {
      result = result.filter((emp) =>
        [
          emp.user?.lastname,
          emp.user?.firstname,
          emp.company_id_number,
          emp.department?.department,
          emp.designation?.designation,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "All") {
      result = result.filter((emp) => emp.user?.role_name === roleFilter);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Employee] || a.user?.lastname || a.department?.department || a.designation?.designation;
        const bValue = b[sortConfig.key as keyof Employee] || b.user?.lastname || b.department?.department || b.designation?.designation;

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    }

    return result;
  }, [employees, searchTerm, roleFilter, sortConfig]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEmployees.slice(start, start + itemsPerPage);
  }, [filteredAndSortedEmployees, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-foreground">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Employee Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger
              ref={roleFilterSelectRef}
              className="w-[180px] bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700"
            >
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 dark:text-foreground dark:border-gray-700">
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
            </SelectContent>
          </Select>
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={() => setIsAddSheetOpen(true)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

      <EmployeeTable
        employees={paginatedEmployees}
        loading={isLoading}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleViewProfile={handleViewProfile}
        userRole={userRole}
        itemsPerPage={itemsPerPage}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-foreground dark:text-foreground">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="dark:bg-gray-700 dark:text-foreground dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Next
          </Button>
        </div>
      )}

      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <EmployeeForm
          employee={newEmployee}
          users={users}
          departments={departments}
          designations={designations}
          onChange={setNewEmployee}
          onSave={handleAddEmployee}
          onCancel={() => setIsAddSheetOpen(false)}
          isSaving={isAdding}
          userRole={userRole}
        />
      </Sheet>

      <Sheet
        open={isViewSheetOpen}
        onOpenChange={(open) => {
          setIsViewSheetOpen(open);
          if (!open) {
            setIsEditable(false);
            setSelectedEmployee(null);
          }
        }}
      >
        {selectedEmployee && (
          <EmployeeForm
            employee={selectedEmployee}
            users={users}
            departments={departments}
            designations={designations}
            onChange={handleEmployeeChange}
            onSave={handleUpdateEmployee}
            onCancel={() => setIsViewSheetOpen(false)}
            isSaving={isUpdating}
            userRole={userRole}
            isEditMode
            isEditable={isEditable}
            setIsEditable={setIsEditable}
          />
        )}
      </Sheet>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DeleteConfirmation
          onConfirm={handleDeleteEmployee}
          onCancel={() => setIsDeleteModalOpen(false)}
          isDeleting={isDeleting}
        />
      </Dialog>
    </div>
  );
};

export default EmployeeList;