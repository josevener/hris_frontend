import { Payslip } from "@/types/payslip";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiFetch = async <T>(
  endpoint: string,
  method: string,
  token: string | null,
  body?: any
): Promise<T> => {
  console.log("API Request:", {
    url: `${BASE_URL}${endpoint}`,
    method,
    token: token ? "[REDACTED]" : null,
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials: "include",
  });

  console.log("API Response:", {
    status: response.status,
    statusText: response.statusText,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {};
    }
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid or missing token.");
    }
    if (response.status === 403) {
      throw new Error(
        "Forbidden: You lack permission to access this resource."
      );
    }
    const error = new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
    (error as any).response = errorData;
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export const fetchPayslips = (token: string | null) =>
  apiFetch<Payslip[]>("/payslips", "GET", token);

export const fetchPayslip = async (id: number, token: string | null) => {
  try {
    return await apiFetch<Payslip>(`/payslips/${id}`, "GET", token);
  } catch (err: any) {
    if (err.status === 404) {
      throw new Error("Payslip not found");
    }
    throw err;
  }
};
