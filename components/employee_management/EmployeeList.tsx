"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import { Plus } from "lucide-react";
import EmployeeForm from "./EmployeeForm";
import DeleteConfirmation from "./DeleteConfirmation";
import { Employee, SortKey, UserRole } from "@/types/employee";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { createEmployee, deleteEmployee, updateEmployee } from "@/services/api";
import { EmployeeTable } from "./EmployeeTable";

const EmployeeList: React.FC<{ userRole?: UserRole }> = ({ userRole = "Admin" }) => {
  const { employees, users, departments, designations, loading, error, setEmployees, setUsers } = useEmployeeData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    birthdate: null,
    reports_to: null,
    gender: null,
    user_id: 0,
    department_id: 0,
    designation_id: 0,
    company_id_number: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

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
      const payload = { ...newEmployee, company_id_number: companyIdNumber };
      const addedEmployee = await createEmployee(payload);

      const enrichedEmployee: Employee = {
        ...addedEmployee,
        user: users.find((u) => u.id === newEmployee.user_id),
        department: departments.find((d) => d.id === newEmployee.department_id),
        designation: designations.find((des) => des.id === newEmployee.designation_id),
        status: addedEmployee.status || "Active",
        isActive: addedEmployee.isActive !== undefined ? addedEmployee.isActive : 1,
        created_at: addedEmployee.created_at || new Date().toISOString(),
      };

      setEmployees((prev) => [...prev, enrichedEmployee]);
      setUsers((prev) => prev.filter((u) => u.id !== newEmployee.user_id));
      setIsAddModalOpen(false);
      setNewEmployee({
        birthdate: null,
        reports_to: null,
        gender: null,
        user_id: 0,
        department_id: 0,
        designation_id: 0,
        company_id_number: "",
      });
      toast.success("Employee added successfully");
      if (userRole === "Employee") toast.info("Your profile has been submitted for review");
    } catch (err: any) {
      toast.error(err.message || "Failed to add employee");
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

      const payload = {
        company_id_number: selectedEmployee.company_id_number,
        birthdate: selectedEmployee.birthdate || null,
        reports_to: selectedEmployee.reports_to === "none" ? null : selectedEmployee.reports_to,
        gender: selectedEmployee.gender === "none" ? null : selectedEmployee.gender,
        user_id: selectedEmployee.user_id,
        department_id: selectedEmployee.department_id,
        designation_id: selectedEmployee.designation_id,
      };

      const updatedEmployee = await updateEmployee(selectedEmployee.id, payload);
      const enrichedUpdatedEmployee: Employee = {
        ...updatedEmployee,
        user: users.find((u) => u.id === selectedEmployee.user_id) || selectedEmployee.user,
        department: departments.find((d) => d.id === selectedEmployee.department_id),
        designation: designations.find((des) => des.id === selectedEmployee.designation_id),
        status: updatedEmployee.status || selectedEmployee.status,
        isActive: updatedEmployee.isActive !== undefined ? updatedEmployee.isActive : selectedEmployee.isActive,
        created_at: updatedEmployee.created_at || selectedEmployee.created_at,
      };

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === enrichedUpdatedEmployee.id ? enrichedUpdatedEmployee : emp))
      );
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
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
      await deleteEmployee(selectedEmployee.id);
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

  const handleViewProfile = (employee: Employee) => {
    console.log(`View Profile: ${employee.id}`);
    toast.info("View profile functionality to be implemented");
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

    if (statusFilter !== "All") {
      result = result.filter((emp) => emp.status === statusFilter);
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
  }, [employees, searchTerm, statusFilter, sortConfig]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEmployees.slice(start, start + itemsPerPage);
  }, [filteredAndSortedEmployees, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);

  return (
    <div className="p-6 flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-gray-100">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Employee Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Resigned">Resigned</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          {(userRole === "HR" || userRole === "Admin") && (
            <Button onClick={() => setIsAddModalOpen(true)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

      <EmployeeTable
        employees={paginatedEmployees}
        loading={loading}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleEdit={setSelectedEmployee}
        handleDelete={(employee) => { setSelectedEmployee(employee); setIsDeleteModalOpen(true); }}
        handleViewProfile={handleViewProfile}
        userRole={userRole}
        itemsPerPage={itemsPerPage}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-foreground dark:text-gray-200">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <EmployeeForm
          employee={newEmployee}
          users={users}
          departments={departments}
          designations={designations}
          onChange={setNewEmployee}
          onSave={handleAddEmployee}
          onCancel={() => setIsAddModalOpen(false)}
          isSaving={isAdding}
          userRole={userRole}
        />
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {selectedEmployee && (
          <EmployeeForm
            employee={selectedEmployee}
            users={users}
            departments={departments}
            designations={designations}
            onChange={handleEmployeeChange}
            onSave={handleUpdateEmployee}
            onCancel={() => setIsEditModalOpen(false)}
            isSaving={isUpdating}
            userRole={userRole}
            isEditMode
          />
        )}
      </Dialog>

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