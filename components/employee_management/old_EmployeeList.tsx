// "use client";

// import { useState, useEffect, useMemo } from "react";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import {
//   Edit,
//   MoreVertical,
//   Trash,
//   ChevronDown,
//   ChevronUp,
//   Plus,
//   FileText,
//   Loader2,
// } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Toaster, toast } from "sonner";
// import { Skeleton } from "../ui/skeleton";

// // Interfaces
// interface User {
//   id: number;
//   lastname: string;
//   firstname: string;
//   middlename: string;
//   extension: string;
//   role_name: string;
//   email: string;
//   profile_image: string;
//   phone_number: string;
//   company_id_number: string;
// }

// interface Department {
//   id: number;
//   department: string;
// }

// interface Designation {
//   id: number;
//   designation: string;
//   department_id: number;
// }

// interface Employee {
//   id: number;
//   company_id_number: string;
//   birthdate: string | null;
//   reports_to: string | null;
//   gender: string | null;
//   user_id: number;
//   department_id: number;
//   designation_id: number;
//   status: "Active" | "On Leave" | "Resigned" | "Terminated";
//   created_at: string;
//   isActive: number;
//   resignation_date?: string;
//   user?: User;
//   department?: Department;
//   designation?: Designation;
// }

// type SortKey =
//   | keyof Employee
//   | "user.lastname"
//   | "department.department"
//   | "designation.designation";
// type SortValue = string | number | undefined;
// type UserRole = "Employee" | "HR" | "Admin";

// const getAuthToken = () => {
//   return localStorage.getItem("auth_token") || "your-sanctum-token-here";
// };

// export default function EmployeeList({ userRole = "Admin" }: { userRole?: UserRole }) {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [designations, setDesignations] = useState<Designation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("All");
//   const [sortConfig, setSortConfig] = useState<{
//     key: SortKey;
//     direction: "asc" | "desc";
//   } | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
//   const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
//     birthdate: null,
//     reports_to: null,
//     gender: null,
//     user_id: 0,
//     department_id: 0,
//     designation_id: 0,
//     company_id_number: "",
//   });
//   const [isAdding, setIsAdding] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     const loadEmployees = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const employeeResponse = await fetch("http://127.0.0.1:8000/api/employees", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getAuthToken()}`,
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });
//         if (!employeeResponse.ok) throw new Error(`Employees fetch failed: ${employeeResponse.status}`);
//         const employeeData: Employee[] = await employeeResponse.json();
//         setEmployees(employeeData);
//       } catch (err) {
//         setError("Failed to fetch employees. Please try again later.");
//         console.error("Error fetching employees:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadEmployees();
//   }, []);

//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         const userResponse = await fetch("http://127.0.0.1:8000/api/users-doesnt-have-employee", { // Fetch all users
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getAuthToken()}`,
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });
//         if (!userResponse.ok) throw new Error(`Users fetch failed: ${userResponse.status}`);
//         const userData: User[] = await userResponse.json();
//         setUsers(userData);

//         const deptResponse = await fetch("http://127.0.0.1:8000/api/departments", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getAuthToken()}`,
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });
//         if (!deptResponse.ok) throw new Error(`Departments fetch failed: ${deptResponse.status}`);
//         const deptData: Department[] = await deptResponse.json();
//         setDepartments(deptData);

//         const desigResponse = await fetch("http://127.0.0.1:8000/api/designations", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getAuthToken()}`,
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });
//         if (!desigResponse.ok) throw new Error(`Designations fetch failed: ${desigResponse.status}`);
//         const desigData: Designation[] = await desigResponse.json();
//         setDesignations(desigData);
//       } catch (err) {
//         console.error("Error fetching initial data:", err);
//         toast.error("Failed to load initial data");
//       }
//     };

//     loadInitialData();
//   }, []);

//   const fetchAllData = async () => {
//         try {
//           const userResponse = await fetch("http://127.0.0.1:8000/api/users-doesnt-have-employee", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${getAuthToken()}`,
//               Accept: "application/json",
//             },
//             cache: "no-store",
//           });
//           if (!userResponse.ok) throw new Error(`Users fetch failed: ${userResponse.status}`);
//           const userData: User[] = await userResponse.json();
//           setUsers(userData);
    
//           const deptResponse = await fetch("http://127.0.0.1:8000/api/departments", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${getAuthToken()}`,
//               Accept: "application/json",
//             },
//             cache: "no-store",
//           });
//           if (!deptResponse.ok) throw new Error(`Departments fetch failed: ${deptResponse.status}`);
//           const deptData: Department[] = await deptResponse.json();
//           setDepartments(deptData);
    
//           const desigResponse = await fetch("http://127.0.0.1:8000/api/designations", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${getAuthToken()}`,
//               Accept: "application/json",
//             },
//             cache: "no-store",
//           });
//           if (!desigResponse.ok) throw new Error(`Designations fetch failed: ${desigResponse.status}`);
//           const desigData: Designation[] = await desigResponse.json();
//           setDesignations(desigData);
    
//           const employeeResponse = await fetch("http://127.0.0.1:8000/api/employees", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${getAuthToken()}`,
//               Accept: "application/json",
//             },
//             cache: "no-store",
//           });
//           if (!employeeResponse.ok) throw new Error(`Employees fetch failed: ${employeeResponse.status}`);
//           const employeeData: Employee[] = await employeeResponse.json();
//           setEmployees(employeeData);
//         } catch (err) {
//           console.error("Error fetching all data:", err);
//           toast.error("Failed to refresh data");
//         }
//       };

//   const fetchEmployee = async (id: number): Promise<Employee> => {
//     const response = await fetch(`http://127.0.0.1:8000/api/employees/${id}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${getAuthToken()}`,
//         Accept: "application/json",
//       },
//       cache: "no-store",
//     });
//     if (!response.ok) throw new Error(`Employee fetch failed: ${response.status}`);
//     return await response.json();
//   };

//   const validateNewEmployee = (employee: Partial<Employee>): boolean => {
//     if (!employee.user_id || employee.user_id === 0) {
//       toast.error("Employee Name is required.");
//       return false;
//     }
//     if (!employee.department_id || employee.department_id === 0) {
//       toast.error("Department is required.");
//       return false;
//     }
//     if (!employee.designation_id || employee.designation_id === 0) {
//       toast.error("Designation is required.");
//       return false;
//     }
//     return true;
//   };

//   const handleAddEmployee = async () => {
//     setIsAdding(true);
//     try {
//       if (!validateNewEmployee(newEmployee)) {
//         setIsAdding(false);
//         return;
//       }

//       const companyIdNumber = getUserCompanyId(newEmployee.user_id || 0);
//       const payload = {
//         company_id_number: companyIdNumber,
//         birthdate: newEmployee.birthdate || null,
//         reports_to: newEmployee.reports_to === "none" ? null : newEmployee.reports_to,
//         gender: newEmployee.gender === "none" ? null : newEmployee.gender,
//         user_id: newEmployee.user_id,
//         department_id: newEmployee.department_id,
//         designation_id: newEmployee.designation_id,
//       };

//       const response = await fetch("http://127.0.0.1:8000/api/employees", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${getAuthToken()}`,
//           Accept: "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }

//       const addedEmployee: Employee = await response.json();

//       // Enrich the new employee with relational data from local state
//       const user = users.find((u) => u.id === newEmployee.user_id);
//       const department = departments.find((d) => d.id === newEmployee.department_id);
//       const designation = designations.find((des) => des.id === newEmployee.designation_id);

//       const enrichedEmployee: Employee = {
//         ...addedEmployee,
//         user: user || undefined,
//         department: department || undefined,
//         designation: designation || undefined,
//         status: addedEmployee.status || "Active", // Default if not provided
//         isActive: addedEmployee.isActive !== undefined ? addedEmployee.isActive : 1, // Default if not provided
//         created_at: addedEmployee.created_at || new Date().toISOString(), // Default if not provided
//       };

//       setEmployees((prev) => [...prev, enrichedEmployee]);
//       setUsers((prev) => prev.filter((u) => u.id !== newEmployee.user_id)); // Remove user from available list
//       setIsAddModalOpen(false);
//       setNewEmployee({
//         birthdate: null,
//         reports_to: null,
//         gender: null,
//         user_id: 0,
//         department_id: 0,
//         designation_id: 0,
//         company_id_number: "",
//       });
//       toast.success("Employee added successfully");
//       if (userRole === "Employee") {
//         toast.info("Your profile has been submitted for review");
//       }
//     } catch (err: any) {
//       toast.error(err.message || "Failed to add employee");
//       console.error("Add error:", err);
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   const handleEdit = (employee: Employee) => {
//     setSelectedEmployee(employee);
//     setIsEditModalOpen(true);
//   };

//   const validateSelectedEmployee = (employee: Employee): boolean => {
//     if (!employee.user_id || employee.user_id === 0) {
//       toast.error("Employee Name is required.");
//       return false;
//     }
//     if (!employee.department_id || employee.department_id === 0) {
//       toast.error("Department is required.");
//       return false;
//     }
//     if (!employee.designation_id || employee.designation_id === 0) {
//       toast.error("Designation is required.");
//       return false;
//     }
//     return true;
//   };

//   const handleUpdateEmployee = async () => {
//     if (!selectedEmployee) return;

//     setIsUpdating(true);
//     try {
//       if (!validateSelectedEmployee(selectedEmployee)) {
//         setIsUpdating(false);
//         return;
//       }

//       const payload = {
//         company_id_number: selectedEmployee.company_id_number,
//         birthdate: selectedEmployee.birthdate || null,
//         reports_to: selectedEmployee.reports_to === "none" ? null : selectedEmployee.reports_to,
//         gender: selectedEmployee.gender === "none" ? null : selectedEmployee.gender,
//         user_id: selectedEmployee.user_id,
//         department_id: selectedEmployee.department_id,
//         designation_id: selectedEmployee.designation_id,
//       };

//       const response = await fetch(
//         `http://127.0.0.1:8000/api/employees/${selectedEmployee.id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getAuthToken()}`,
//             Accept: "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }

//       // const fullUpdatedEmployee = await fetchEmployee(selectedEmployee.id);
//       // setEmployees((prev) =>
//       //   prev.map((emp) => (emp.id === fullUpdatedEmployee.id ? fullUpdatedEmployee : emp))
//       // );
      
//       await fetchAllData();
      
//       setIsEditModalOpen(false);
//       setSelectedEmployee(null);
//       toast.success("Employee updated successfully");
//       if (userRole === "Employee") {
//         toast.info("Your profile has been updated");
//       }

//     } catch (err: any) {
//       toast.error(err.message || "Failed to update employee");
//       console.error("Update error:", err);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedEmployee) return;

//     setIsDeleting(true);
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/api/employees/${selectedEmployee.id}`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getAuthToken()}`,
//             Accept: "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
//       }

//       setEmployees((prev) => prev.filter((emp) => emp.id !== selectedEmployee.id));
//       setIsDeleteModalOpen(false);
//       setSelectedEmployee(null);
//       toast.success("Employee deleted successfully");

//       await fetchAllData();

//     } catch (err: any) {
//       toast.error(err.message || "Failed to delete employee");
//       console.error("Delete error:", err);
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleViewProfile = (employee: Employee) => {
//     console.log(`View Profile: ${employee.id}`);
//     toast.info("View profile functionality to be implemented");
//   };

//   const getSortValue = (employee: Employee, key: SortKey): SortValue => {
//     switch (key) {
//       case "user.lastname":
//         return employee.user?.lastname;
//       case "department.department":
//         return employee.department?.department;
//       case "designation.designation":
//         return employee.designation?.designation;
//       default:
//         return (employee[key as keyof Employee] as SortValue) || undefined;
//     }
//   };

//   const getFullName = (employee: Employee): string => {
//     const user = employee.user;
//     return user
//       ? `${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()
//       : "N/A";
//   };

//   const getUserCompanyId = (userId: number): string => {
//     const user = users.find((u) => u.id === userId);
//     return user ? user.company_id_number : "";
//   };

//   const getSupervisorName = (reportsTo: string | null): string => {
//     if (!reportsTo || reportsTo === "none") return "None";
//     const supervisor = users.find((u) => u.id === parseInt(reportsTo));
//     return supervisor
//       ? `${supervisor.firstname} ${supervisor.middlename ? supervisor.middlename[0] + "." : ""} ${supervisor.lastname}`.trim()
//       : "N/A";
//   };

//   const handleSort = (key: SortKey) => {
//     setSortConfig((prev) => ({
//       key,
//       direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const filteredAndSortedEmployees = useMemo(() => {
//     let result = [...employees];

//     if (searchTerm) {
//       result = result.filter((emp) =>
//         [
//           emp.user?.lastname,
//           emp.user?.firstname,
//           emp.company_id_number,
//           emp.department?.department,
//           emp.designation?.designation,
//         ]
//           .join(" ")
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase())
//       );
//     }

//     if (statusFilter !== "All") {
//       result = result.filter((emp) => emp.status === statusFilter);
//     }

//     if (sortConfig) {
//       result.sort((a, b) => {
//         const aValue = getSortValue(a, sortConfig.key);
//         const bValue = getSortValue(b, sortConfig.key);

//         if (aValue === undefined || bValue === undefined) return 0;

//         if (typeof aValue === "string" && typeof bValue === "string") {
//           return sortConfig.direction === "asc"
//             ? aValue.localeCompare(bValue)
//             : bValue.localeCompare(aValue);
//         }

//         if (typeof aValue === "number" && typeof bValue === "number") {
//           return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
//         }

//         return 0;
//       });
//     }

//     return result;
//   }, [employees, searchTerm, statusFilter, sortConfig]);

//   const paginatedEmployees = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filteredAndSortedEmployees.slice(start, start + itemsPerPage);
//   }, [filteredAndSortedEmployees, currentPage]);

//   const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage);

//   const SortIcon = ({ column }: { column: SortKey }) =>
//     sortConfig?.key === column ? (
//       sortConfig.direction === "asc" ? (
//         <ChevronUp className="ml-2 h-4 w-4 inline" />
//       ) : (
//         <ChevronDown className="ml-2 h-4 w-4 inline" />
//       )
//     ) : null;

//   return (
//     <div className="p-6 flex flex-col items-center bg-background text-foreground dark:bg-gray-900 dark:text-gray-100">
//       <Toaster position="top-right" richColors />
//       <div className="w-full max-w-6xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
//         <h1 className="text-2xl font-bold dark:text-white">Employee Management</h1>
//         <div className="flex gap-4">
//           <Input
//             placeholder="Search employees..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="max-w-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
//           />
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
//               <SelectValue placeholder="Filter by Status" />
//             </SelectTrigger>
//             <SelectContent className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
//               <SelectItem value="All">All Statuses</SelectItem>
//               <SelectItem value="Active">Active</SelectItem>
//               <SelectItem value="On Leave">On Leave</SelectItem>
//               <SelectItem value="Resigned">Resigned</SelectItem>
//               <SelectItem value="Terminated">Terminated</SelectItem>
//             </SelectContent>
//           </Select>
//           {(userRole === "HR" || userRole === "Admin") && (
//             <Button onClick={() => setIsAddModalOpen(true)} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
//               <Plus className="mr-2 h-4 w-4" /> Add Employee
//             </Button>
//           )}
//         </div>
//       </div>

//       {error && <div className="text-red-500 mb-4 dark:text-red-400">{error}</div>}

//       <Table className="w-full max-w-6xl bg-white dark:bg-gray-800 dark:border-gray-700">
//         <TableCaption className="dark:text-gray-300">Comprehensive employee management directory.</TableCaption>
//         <TableHeader>
//           <TableRow className="dark:bg-gray-700">
//             <TableHead className="w-[50px] cursor-pointer dark:text-gray-200" onClick={() => handleSort("id")}>
//               No. <SortIcon column="id" />
//             </TableHead>
//             <TableHead className="cursor-pointer dark:text-gray-200" onClick={() => handleSort("user.lastname")}>
//               Name <SortIcon column="user.lastname" />
//             </TableHead>
//             <TableHead className="dark:text-gray-200">Employee No.</TableHead>
//             <TableHead
//               className="cursor-pointer dark:text-gray-200"
//               onClick={() => handleSort("designation.designation")}
//             >
//               Designation <SortIcon column="designation.designation" />
//             </TableHead>
//             <TableHead
//               className="cursor-pointer dark:text-gray-200"
//               onClick={() => handleSort("department.department")}
//             >
//               Department <SortIcon column="department.department" />
//             </TableHead>
//             <TableHead className="dark:text-gray-200">Supervisor</TableHead>
//             <TableHead className="dark:text-gray-200">Birth Date</TableHead>
//             <TableHead className="dark:text-gray-200">Status</TableHead>
//             <TableHead className="w-[50px] text-center dark:text-gray-200">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {loading ? (
//             Array.from({ length: itemsPerPage }).map((_, index) => (
//               <TableRow key={`skeleton-${index}`} className="dark:bg-gray-800">
//                 <TableCell><Skeleton className="h-4 w-8 dark:bg-gray-600" /></TableCell>
//                 <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
//                 <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
//                 <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
//                 <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
//                 <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
//                 <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
//                 <TableCell><Skeleton className="h-4 w-24 dark:bg-gray-600" /></TableCell>
//                 <TableCell className="text-center"><Skeleton className="h-6 w-6 mx-auto dark:bg-gray-600" /></TableCell>
//               </TableRow>
//             ))
//           ) : paginatedEmployees.length > 0 ? (
//             paginatedEmployees.map((employee, index) => (
//               <TableRow key={employee.id} className="dark:bg-gray-800 dark:hover:bg-gray-700">
//                 <TableCell className="dark:text-gray-200">{index + 1}</TableCell>
//                 <TableCell className="dark:text-gray-200">{getFullName(employee)}</TableCell>
//                 <TableCell className="dark:text-gray-200">{employee.company_id_number || "N/A"}</TableCell>
//                 <TableCell className="dark:text-gray-200">{employee.designation?.designation || "N/A"}</TableCell>
//                 <TableCell className="dark:text-gray-200">{employee.department?.department || "N/A"}</TableCell>
//                 <TableCell className="dark:text-gray-200">{getSupervisorName(employee.reports_to)}</TableCell>
//                 <TableCell className="dark:text-gray-200">
//                   {employee.birthdate ? new Date(employee.birthdate).toLocaleDateString() : "N/A"}
//                 </TableCell>
//                 <TableCell>
//                   <Badge
//                     variant={
//                       employee.isActive === 1
//                         ? "default"
//                         : employee.isActive === 0
//                         ? "secondary"
//                         : "destructive"
//                     }
//                     className={employee.isActive === 1 ? "dark:bg-green-600" : "dark:bg-gray-600"}
//                   >
//                     {employee.isActive === 1 ? "Active" : "Inactive"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-center">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-600">
//                       <MoreVertical className="h-5 w-5 dark:text-gray-200" />
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
//                       <DropdownMenuItem onClick={() => handleViewProfile(employee)} className="dark:hover:bg-gray-700">
//                         <FileText className="w-4 h-4 mr-2" /> View Profile
//                       </DropdownMenuItem>
//                       {(userRole === "HR" || userRole === "Admin" || userRole === "Employee") && (
//                         <DropdownMenuItem onClick={() => handleEdit(employee)} className="dark:hover:bg-gray-700">
//                           <Edit className="w-4 h-4 mr-2" /> Edit
//                         </DropdownMenuItem>
//                       )}
//                       {(userRole === "HR" || userRole === "Admin") && (
//                         <DropdownMenuItem
//                           onClick={() => {
//                             setSelectedEmployee(employee);
//                             setIsDeleteModalOpen(true);
//                           }}
//                           className="text-red-500 dark:text-red-400 dark:hover:bg-red-900"
//                         >
//                           <Trash className="w-4 h-4 mr-2" /> Delete
//                         </DropdownMenuItem>
//                       )}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))
//           ) : (
//             <TableRow className="dark:bg-gray-800">
//               <TableCell colSpan={9} className="text-center dark:text-gray-300">
//                 No employees found.
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>

//       {totalPages > 1 && (
//         <div className="mt-4 flex items-center gap-2 text-foreground dark:text-gray-200">
//           <Button
//             variant="outline"
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
//           >
//             Previous
//           </Button>
//           <span>Page {currentPage} of {totalPages}</span>
//           <Button
//             variant="outline"
//             onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//             className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
//           >
//             Next
//           </Button>
//         </div>
//       )}

//       {/* Add Employee Modal */}
//       <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//         <DialogContent className="sm:max-w-[900px] w-[90vw] bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
//           <DialogHeader>
//             <DialogTitle className="dark:text-white">Add New Employee</DialogTitle>
//             <DialogDescription className="dark:text-gray-300">Enter the details for the new employee.</DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4 grid-cols-6">
//             <div className="col-span-2 flex flex-col gap-2">
//               <Label htmlFor="user_id" className="dark:text-gray-200">Employee Name *</Label>
//               <Select
//                 value={newEmployee.user_id?.toString() || ""}
//                 onValueChange={(value) => {
//                   const userId = parseInt(value) || 0;
//                   setNewEmployee({ ...newEmployee, user_id: userId });
//                 }}
//               >
//                 <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   <SelectValue placeholder="Select Employee" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   {users.map((user) => (
//                     <SelectItem key={user.id} value={user.id.toString()}>
//                       {`${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="col-span-2 flex flex-col gap-2">
//               <Label htmlFor="company_id_number" className="dark:text-gray-200">Employee ID</Label>
//               <Input
//                 id="company_id_number"
//                 value={getUserCompanyId(newEmployee.user_id || 0)}
//                 disabled
//                 className="bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
//               />
//             </div>
//             <div className="col-span-2 flex flex-col gap-2">
//               <Label htmlFor="birthdate" className="dark:text-gray-200">Birthdate</Label>
//               <Input
//                 id="birthdate"
//                 type="date"
//                 value={newEmployee.birthdate || ""}
//                 onChange={(e) => setNewEmployee({ ...newEmployee, birthdate: e.target.value || null })}
//                 className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
//               />
//             </div>
//             <div className="col-span-2 flex flex-col gap-2">
//               <Label htmlFor="supervisor" className="dark:text-gray-200">Supervisor</Label>
//               <Select
//                 value={newEmployee.reports_to || "none"}
//                 onValueChange={(value) =>
//                   setNewEmployee({ ...newEmployee, reports_to: value === "none" ? null : value })
//                 }
//               >
//                 <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   <SelectValue placeholder="Select Supervisor" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   <SelectItem value="none">None</SelectItem>
//                   {users
//                     .filter((user) => user.id !== newEmployee.user_id)
//                     .map((user) => (
//                       <SelectItem key={user.id} value={user.id.toString()}>
//                         {`${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="col-span-2 flex flex-col gap-2">
//               <Label htmlFor="gender" className="dark:text-gray-200">Gender</Label>
//               <Select
//                 value={newEmployee.gender || "none"}
//                 onValueChange={(value) =>
//                   setNewEmployee({ ...newEmployee, gender: value === "none" ? null : value })
//                 }
//               >
//                 <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   <SelectValue placeholder="Select Gender" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   <SelectItem value="none">None</SelectItem>
//                   <SelectItem value="Male">Male</SelectItem>
//                   <SelectItem value="Female">Female</SelectItem>
//                   <SelectItem value="Other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="col-span-2 flex flex-col gap-2">
//               <Label htmlFor="department_id" className="dark:text-gray-200">Department *</Label>
//               <Select
//                 value={newEmployee.department_id?.toString() || ""}
//                 onValueChange={(value) => {
//                   const deptId = parseInt(value) || 0;
//                   setNewEmployee({ ...newEmployee, department_id: deptId, designation_id: 0 });
//                 }}
//               >
//                 <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   <SelectValue placeholder="Select Department" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   {departments.map((dept) => (
//                     <SelectItem key={dept.id} value={dept.id.toString()}>
//                       {dept.department}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="col-span-2 flex flex-col gap-2">
//               <Label htmlFor="designation_id" className="dark:text-gray-200">Designation *</Label>
//               <Select
//                 value={newEmployee.designation_id?.toString() || ""}
//                 onValueChange={(value) =>
//                   setNewEmployee({ ...newEmployee, designation_id: parseInt(value) || 0 })
//                 }
//                 disabled={!newEmployee.department_id}
//               >
//                 <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   <SelectValue placeholder="Select Designation" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                   {designations
//                     .filter((desig) => desig.department_id === newEmployee.department_id)
//                     .map((desig) => (
//                       <SelectItem key={desig.id} value={desig.id.toString()}>
//                         {desig.designation}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsAddModalOpen(false)}
//               className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleAddEmployee}
//               disabled={isAdding}
//               className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
//             >
//               {isAdding ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
//                 </>
//               ) : (
//                 "Add Employee"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Employee Modal */}
//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent className="sm:max-w-[900px] w-[90vw] bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
//           <DialogHeader>
//             <DialogTitle className="dark:text-white">Edit Employee</DialogTitle>
//             <DialogDescription className="dark:text-gray-300">Update the employee’s details.</DialogDescription>
//           </DialogHeader>
//           {selectedEmployee && (
//             <div className="grid gap-4 py-4 grid-cols-6">
//               <div className="col-span-2 flex flex-col gap-2">
//                 <Label htmlFor="edit-user_id" className="dark:text-gray-200">Employee Name *</Label>
//                 <Input
//                   id="edit-user_id"
//                   value={getFullName(selectedEmployee)}
//                   disabled
//                   className="bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
//                 />
//               </div>
//               <div className="col-span-2 flex flex-col gap-2">
//                 <Label htmlFor="edit-company_id_number" className="dark:text-gray-200">Employee ID</Label>
//                 <Input
//                   id="edit-company_id_number"
//                   value={selectedEmployee.company_id_number || ""}
//                   disabled
//                   className="bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
//                 />
//               </div>
//               <div className="col-span-2 flex flex-col gap-2">
//                 <Label htmlFor="edit-birthdate" className="dark:text-gray-200">Birthdate</Label>
//                 <Input
//                   id="edit-birthdate"
//                   type="date"
//                   value={selectedEmployee.birthdate || ""}
//                   onChange={(e) =>
//                     setSelectedEmployee({ ...selectedEmployee, birthdate: e.target.value || null })
//                   }
//                   disabled={userRole === "Employee"}
//                   className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
//                 />
//               </div>
//               <div className="col-span-2 flex flex-col gap-2">
//                 <Label htmlFor="supervisor" className="dark:text-gray-200">Supervisor</Label>
//                 <Select
//                   value={selectedEmployee.reports_to || "none"}
//                   onValueChange={(value) =>
//                     setSelectedEmployee({ ...selectedEmployee, reports_to: value === "none" ? null : value })
//                   }
//                   disabled={userRole === "Employee"}
//                 >
//                   <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     <SelectValue placeholder="Select Supervisor" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     <SelectItem value="none">None</SelectItem>
//                     {users
//                       .filter((user) => user.id !== selectedEmployee.user_id)
//                       .map((user) => (
//                         <SelectItem key={user.id} value={user.id.toString()}>
//                           {`${user.firstname} ${user.middlename ? user.middlename[0] + "." : ""} ${user.lastname}`.trim()}
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="col-span-2 flex flex-col gap-2">
//                 <Label htmlFor="edit-gender" className="dark:text-gray-200">Gender</Label>
//                 <Select
//                   value={selectedEmployee.gender || "none"}
//                   onValueChange={(value) =>
//                     setSelectedEmployee({ ...selectedEmployee, gender: value === "none" ? null : value })
//                   }
//                   disabled={userRole === "Employee"}
//                 >
//                   <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     <SelectValue placeholder="Select Gender" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     <SelectItem value="none">None</SelectItem>
//                     <SelectItem value="Male">Male</SelectItem>
//                     <SelectItem value="Female">Female</SelectItem>
//                     <SelectItem value="Other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="col-span-2 flex flex-col gap-2">
//                 <Label htmlFor="edit-department_id" className="dark:text-gray-200">Department *</Label>
//                 <Select
//                   value={selectedEmployee.department_id?.toString() || ""}
//                   onValueChange={(value) => {
//                     const deptId = parseInt(value) || 0;
//                     setSelectedEmployee({ ...selectedEmployee, department_id: deptId, designation_id: 0 });
//                   }}
//                   disabled={userRole === "Employee"}
//                 >
//                   <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     <SelectValue placeholder="Select Department" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     {departments.map((dept) => (
//                       <SelectItem key={dept.id} value={dept.id.toString()}>
//                         {dept.department}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="col-span-2 flex flex-col gap-2">
//                 <Label htmlFor="edit-designation_id" className="dark:text-gray-200">Designation *</Label>
//                 <Select
//                   value={selectedEmployee.designation_id?.toString() || ""}
//                   onValueChange={(value) =>
//                     setSelectedEmployee({ ...selectedEmployee, designation_id: parseInt(value) || 0 })
//                   }
//                   disabled={!selectedEmployee.department_id || userRole === "Employee"}
//                 >
//                   <SelectTrigger className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     <SelectValue placeholder="Select Designation" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600">
//                     {designations
//                       .filter((desig) => desig.department_id === selectedEmployee.department_id)
//                       .map((desig) => (
//                         <SelectItem key={desig.id} value={desig.id.toString()}>
//                           {desig.designation}
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           )}
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsEditModalOpen(false)}
//               className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleUpdateEmployee}
//               disabled={isUpdating}
//               className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
//             >
//               {isUpdating ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
//                 </>
//               ) : (
//                 "Save Changes"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Employee Modal */}
//       <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
//         <DialogContent className="bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
//           <DialogHeader>
//             <DialogTitle className="dark:text-white">Confirm Deletion</DialogTitle>
//             <DialogDescription className="dark:text-gray-300">
//               <span>Are you sure you want to delete this record?</span>
//               <span>You are also deleting its record in Employee Management.</span>
//               <span>This action cannot be undone.</span>
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsDeleteModalOpen(false)}
//               className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleDelete}
//               disabled={isDeleting}
//               className="dark:bg-red-700 dark:hover:bg-red-600"
//             >
//               {isDeleting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
//                 </>
//               ) : (
//                 "Delete"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }