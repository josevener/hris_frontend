import {
  Employee,
  User,
  Department,
  Designation,
  Dependent,
  Education,
  Document,
} from "../../types/employee";

const BASE_URL = "http://127.0.0.1:8000/api";

const apiFetch = async <T>(
  endpoint: string,
  method: string,
  token: string | null,
  body?: any,
  isMultipart: boolean = false
): Promise<T> => {
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    const error = new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
    (error as any).response = errorData;
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export const fetchEmployees = async (token: string | null) => {
  const employees = await apiFetch<Employee[]>("/employees", "GET", token);
  return employees.map((employee) => ({
    ...employee,
    education_background: employee.education_backgrounds || [],
  }));
};

export const fetchUsers = (token: string | null) =>
  apiFetch<User[]>("/users-doesnt-have-employee", "GET", token);

export const fetchDepartments = (token: string | null) =>
  apiFetch<Department[]>("/departments", "GET", token);

export const fetchDesignations = (token: string | null) =>
  apiFetch<Designation[]>("/designations", "GET", token);

export const fetchEmployee = async (id: number, token: string | null) => {
  const response = await apiFetch<any>(`/employees/${id}`, "GET", token);
  return {
    ...response.employee,
    education_background: response.employee.educationBackgrounds || [],
  } as Employee;
};

export const createEmployee = async (
  data: Partial<Employee>,
  token: string | null
): Promise<Employee> => {
  const normalizedData = {
    ...data,
    dependents:
      data.dependents !== undefined
        ? Array.isArray(data.dependents)
          ? data.dependents
          : [data.dependents as Dependent]
        : [],
    education_background:
      data.education_backgrounds !== undefined
        ? Array.isArray(data.education_backgrounds)
          ? data.education_backgrounds
          : [data.education_backgrounds as Education]
        : [],
    documents: normalizeDocuments(data.documents),
  };

  const hasFiles = normalizedData.documents?.length > 0;

  if (hasFiles) {
    const formData = new FormData();

    Object.entries(normalizedData).forEach(([key, value]) => {
      if (key === "dependents" && Array.isArray(value)) {
        (value as Dependent[]).forEach((dep, index) => {
          formData.append(`dependents[${index}][name]`, dep.name || "");
          formData.append(
            `dependents[${index}][relationship]`,
            dep.relationship || ""
          );
        });
      } else if (key === "education_background" && Array.isArray(value)) {
        (value as Education[]).forEach((edu, index) => {
          formData.append(
            `education_background[${index}][attainment]`,
            edu.attainment || ""
          );
          formData.append(
            `education_background[${index}][course]`,
            edu.course || ""
          );
        });
      } else if (key === "documents" && Array.isArray(value)) {
        (value as Document[]).forEach((doc, index) => {
          formData.append(`documents[${index}][type]`, doc.type || "");
          if (doc.file instanceof File) {
            formData.append(`documents[${index}][file]`, doc.file);
          }
        });
      } else {
        formData.append(key, value === null ? "" : value.toString());
      }
    });

    // Log FormData entries for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await apiFetch<any>(
      "/employees",
      "POST",
      token,
      formData,
      true
    );

    if (!response.employee) {
      throw new Error("Invalid server response: 'employee' object missing");
    }
    return response.employee;
  } else {
    const response = await apiFetch<any>(
      "/employees",
      "POST",
      token,
      normalizedData,
      false
    );
    if (!response.employee) {
      throw new Error("Invalid server response: 'employee' object missing");
    }
    return response.employee;
  }
};

export const updateEmployee = async (
  id: number,
  data: Partial<Employee>,
  token: string | null
): Promise<Employee> => {
  const normalizedData = {
    ...data,
    dependents:
      data.dependents !== undefined
        ? Array.isArray(data.dependents)
          ? data.dependents
          : [data.dependents as Dependent]
        : [],
    education_background:
      data.education_backgrounds !== undefined
        ? Array.isArray(data.education_backgrounds)
          ? data.education_backgrounds
          : [data.education_backgrounds as Education]
        : [],
    documents: normalizeDocuments(data.documents, true),
  };

  const hasFiles = normalizedData.documents?.some(
    (doc: Document) => doc.file instanceof File
  );

  if (hasFiles) {
    const formData = new FormData();

    Object.entries(normalizedData).forEach(([key, value]) => {
      if (key === "dependents" && Array.isArray(value)) {
        (value as Dependent[]).forEach((dep, index) => {
          if (dep.id) {
            formData.append(`dependents[${index}][id]`, dep.id.toString());
          }
          formData.append(`dependents[${index}][name]`, dep.name || "");
          formData.append(
            `dependents[${index}][relationship]`,
            dep.relationship || ""
          );
        });
      } else if (key === "education_background" && Array.isArray(value)) {
        (value as Education[]).forEach((edu, index) => {
          if (edu.id) {
            formData.append(
              `education_background[${index}][id]`,
              edu.id.toString()
            );
          }
          formData.append(
            `education_background[${index}][attainment]`,
            edu.attainment || ""
          );
          formData.append(
            `education_background[${index}][course]`,
            edu.course || ""
          );
        });
      } else if (key === "documents" && Array.isArray(value)) {
        (value as Document[]).forEach((doc, index) => {
          if (doc.id) {
            formData.append(`documents[${index}][id]`, doc.id.toString());
          }
          formData.append(`documents[${index}][type]`, doc.type || "");
          if (doc.file instanceof File) {
            formData.append(`documents[${index}][file]`, doc.file);
          }
        });
      } else {
        formData.append(key, value === null ? "" : value.toString());
      }
    });

    // Log FormData entries for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    return apiFetch<Employee>(`/employees/${id}`, "PUT", token, formData, true);
  } else {
    return apiFetch<Employee>(
      `/employees/${id}`,
      "PUT",
      token,
      normalizedData,
      false
    );
  }
};

export const deleteEmployee = (id: number, token: string | null) =>
  apiFetch<void>(`/employees/${id}`, "DELETE", token);

export const deleteEducationBackground = (id: number, token: string | null) =>
  apiFetch<void>(`/education-backgrounds/${id}`, "DELETE", token);

export const deleteDependent = (id: number, token: string | null) =>
  apiFetch<void>(`/dependents/${id}`, "DELETE", token);

export const deleteDocument = (id: number, token: string | null) =>
  apiFetch<void>(`/documents/${id}`, "DELETE", token);

// Helper function to normalize documents with type safety
function normalizeDocuments(
  docs?: Document[] | Document,
  isUpdate?: boolean
): Document[] {
  if (!docs) return [];
  if (Array.isArray(docs)) {
    return docs.filter((doc: Document) => {
      const hasRequiredProps =
        doc.type && (isUpdate || doc.file instanceof File);
      return hasRequiredProps;
    });
  }
  if (
    docs &&
    typeof docs === "object" &&
    "type" in docs &&
    (isUpdate || ("file" in docs && docs.file instanceof File))
  ) {
    return [docs as Document];
  }
  return [];
}
