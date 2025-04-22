"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { fetchPayslip } from "@/services/api/apiPayslip";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/lib/AuthContext";
import { PayrollItem } from "@/types/payroll";
import { fetchPayrollItems } from "@/services/api/apiPayrollItem";
import { fetchCompanyDetails } from "@/services/api/apiCompany";
import Company from "@/types/company";
import { Payslip } from "@/types/payslip";

export default function PayslipViewPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params.id as string;
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [company, setCompany] = useState<Company[] | null>(null);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const payslipRef = useRef<HTMLDivElement>(null);

  console.log("[id]/page.tsx: Rendering for ID:", id, "Type:", typeof id);
  console.log("[id]/page.tsx: Auth Token:", token ? "[REDACTED]" : null);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      console.log("[id]/page.tsx: Invalid ID provided");
      setError("Invalid payslip ID");
      setLoading(false);
      return;
    }

    const loadPayslip = async () => {
      try {
        console.log("[id]/page.tsx: Fetching payslip ID:", id);
        const data = await fetchPayslip(Number(id), token);
        const companyDetails = await fetchCompanyDetails(token);
        console.log("[id]/page.tsx: Payslip data:", data);
        console.log("[id]/page.tsx: Company data:", companyDetails);
        setPayslip(data);
        setCompany(companyDetails);

        if (data.payroll_cycles_id) {
          console.log("[id]/page.tsx: Fetching payroll items for payroll_cycles_id:", data.payroll_cycles_id);
          const items = await fetchPayrollItems(data.payroll_cycles_id, token);
          console.log("[id]/page.tsx: Payroll items:", items);

          const filteredItems = items.filter(item => 
            (item.scope === "specific" && item.employee_id === data.employee_id) || 
            (item.scope === "global")
          );
          console.log("[id]/page.tsx: Filtered payroll items:", filteredItems);
          setPayrollItems(filteredItems);
        } else {
          console.log("[id]/page.tsx: No payroll_cycles_id found in payslip data");
          setPayrollItems([]);
        }
      } catch (err: any) {
        console.error("[id]/page.tsx: Fetch error:", {
          message: err.message,
          status: err.status,
          data: err.response,
        });
        if (
          err.status === 404 ||
          err.message === "Payslip not found" ||
          err.message.includes("HTTP error! Status: 404")
        ) {
          console.log("[id]/page.tsx: Triggering notFound() for ID:", id);
          notFound();
        }
        setError(err.message || "Failed to load payslip.");
        toast.error(err.message || "Failed to load payslip.");
      } finally {
        setLoading(false);
      }
    };

    loadPayslip();
  }, [id, token]);

  const formatCurrency = (value: number | string): string => {
    return Number(value).toLocaleString("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const hasHoursAndRate = (category: string) => {
    const categoriesWithHours = ["Overtime Pay", "Holiday Pay"];
    return categoriesWithHours.includes(category);
  };

  const earningsItems = payrollItems
    .filter(item => item.type === "earning")
    .map(item => {
      const amount = parseFloat(String(item.amount));
      if (hasHoursAndRate(item.category)) {
        const hours = 5;
        const rate = amount / hours;
        return {
          desc: item.category,
          hours: hours.toString(),
          rate: formatCurrency(rate),
          current: formatCurrency(amount),
          ytd: "N/A",
        };
      }
      return {
        desc: item.category,
        hours: "-",
        rate: "-",
        current: formatCurrency(amount),
        ytd: "N/A",
      };
    });
  console.log("[id]/page.tsx: Earnings items:", earningsItems);

  const deductionsItems = payrollItems
    .filter(item => item.type === "deduction" || item.type === "contribution")
    .map(item => ({
      desc: item.category,
      current: formatCurrency(parseFloat(String(item.amount))),
      ytd: "N/A",
    }));
  console.log("[id]/page.tsx: Deductions items:", deductionsItems);

  const generatePDF = async () => {
    if (!payslip || !company || company.length === 0 || !payslipRef.current) return;

    try {
      // Temporarily enforce light mode for PDF rendering
      const originalClass = payslipRef.current.className;
      payslipRef.current.className = originalClass.replace("dark:bg-gray-800", "bg-white").replace("dark:text-gray-100", "text-gray-900").replace("dark:text-gray-300", "text-gray-700").replace("dark:bg-gray-600", "bg-gray-100").replace("dark:bg-gray-700", "bg-gray-200");

      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // Force white background
      });

      // Restore original classes
      payslipRef.current.className = originalClass;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // Add 10mm margin on all sides
      const usableWidth = pdfWidth - 2 * margin;
      const usableHeight = pdfHeight - 2 * margin;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Scale the image to fit the usable width of the PDF page
      const ratio = usableWidth / imgWidth;
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      let heightLeft = scaledHeight;
      let position = margin; // Start at the top margin

      // Add the first page
      pdf.addImage(imgData, "PNG", margin, position, scaledWidth, scaledHeight);
      heightLeft -= usableHeight;

      // Add additional pages if necessary
      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - heightLeft; // Adjust position for the next page
        pdf.addImage(imgData, "PNG", margin, position, scaledWidth, scaledHeight);
        heightLeft -= usableHeight;
      }

      pdf.save(`${payslip.employee?.company_id_number}_${payslip.employee?.user?.lastname}_${payslip.employee?.user?.firstname}.pdf`);
      toast.success("Payslip downloaded as PDF.");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500 dark:text-red-400 mb-6 text-lg">
          {error || "Payslip not found."}
        </p>
        <Button
          onClick={() => router.push("/payroll/payslips")}
          variant="outline"
          className="flex items-center gap-2 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Payslips
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors />
      <div className="w-full">
        {/* Buttons at the top-right */}
        <div className="flex justify-end mb-4">
          <div className="flex gap-3">
            <Button
              onClick={generatePDF}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button
              onClick={() => router.push("/payroll/payslips")}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        {/* Payslip Content - Full Width */}
        <div ref={payslipRef} className="w-full space-y-6">
          {/* Header with Padding */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{company && company.length > 0 ? company[0].name : "N/A"}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {company && company.length > 0 && company[0].address
                ? company[0].address.split("\r\n").map((line, index) => (
                    <span key={index}>
                      {line.trim()}
                      <br />
                    </span>
                  ))
                : "N/A"}
              Contact Number: {company && company.length > 0 ? company[0].phone : "N/A"}<br />
              Email: {company && company.length > 0 ? company[0].email : "N/A"}
            </p>
          </div>

          {/* Payslip Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            {/* Employee Information and Payroll Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-t">EMPLOYEE INFORMATION</h2>
                <div className="p-3 text-gray-700 dark:text-gray-300 space-y-1">
                  <p>
                    <span className="font-bold">Name: </span>
                      {payslip.employee?.user
                        ? `${payslip.employee.user.firstname} ${payslip.employee.user.middlename ? payslip.employee.user.middlename[0] + "." : ""} ${payslip.employee.user.lastname}`
                        : `Employee #${payslip.employee_id}`}
                  </p>
                  {/* {payslip.employee?.address ? (
                    payslip.employee.address.split(", ").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))
                  ) : (
                    <p>N/A</p>
                  )} */}
                  <p><span className="font-bold">Employee ID: </span>{payslip.employee?.company_id_number}</p>
                  <p><span className="font-bold">Contact Number: </span>{payslip.employee?.user?.phone_number || "N/A"}</p>
                  <p><span className="font-bold">Email: </span>{payslip.employee?.user?.email || "N/A"}</p>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-3 gap-0">
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-semibold py-2 px-3 text-left">PAY DATE</div>
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-semibold py-2 px-3 text-left">PAY TYPE</div>
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-semibold py-2 px-3 text-left">PERIOD</div>
                  <div className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 text-left">
                    {payslip.payroll_cycle?.pay_date
                      ? format(new Date(payslip.payroll_cycle.pay_date), "dd/MM/yyyy")
                      : "N/A"}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 text-left">
                    {payslip.salary?.pay_period || "N/A"}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 text-left">
                    {payslip.payroll_cycle
                      ? `${format(new Date(payslip.payroll_cycle.start_date), "MMM dd")} - ${format(new Date(payslip.payroll_cycle.end_date), "MMM dd")}`
                      : "N/A"}
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-semibold py-2 px-3 text-left">PAYROLL #</div>
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-semibold py-2 px-3 text-left">SSS NUMBER</div>
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-semibold py-2 px-3 text-left">TIN</div>
                  <div className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 text-left">{payslip.id}</div>
                  <div className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 text-left">QQ123456C</div>
                  <div className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 text-left">1250L</div>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Payment Method: </span>
                  <span className="text-gray-700 dark:text-gray-300">{payslip.payment_method || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Earnings Table */}
            <div>
              <h2 className="bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-t">EARNINGS</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <th className="py-2 px-3 text-left">DESCRIPTION</th>
                      <th className="py-2 px-3 text-left">HOURS</th>
                      <th className="py-2 px-3 text-left">RATE</th>
                      <th className="py-2 px-3 text-left">CURRENT</th>
                      <th className="py-2 px-3 text-left">YTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-100 dark:bg-gray-600">
                      <td className="py-2 px-3">Basic Pay</td>
                      <td className="py-2 px-3">40</td>
                      <td className="py-2 px-3">{formatCurrency(payslip.salary?.basic_salary || 0)}</td>
                      <td className="py-2 px-3">{formatCurrency(payslip.salary?.basic_salary || 0)}</td>
                      <td className="py-2 px-3">N/A</td>
                    </tr>
                    {earningsItems.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-100 dark:bg-gray-600" : "bg-white dark:bg-gray-800"}>
                        <td className="py-2 px-3">{item.desc}</td>
                        <td className="py-2 px-3">{item.hours}</td>
                        <td className="py-2 px-3">{item.rate}</td>
                        <td className="py-2 px-3">{item.current}</td>
                        <td className="py-2 px-3">{item.ytd}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
                      <td className="py-2 px-3">GROSS PAY</td>
                      <td className="py-2 px-3"></td>
                      <td className="py-2 px-3"></td>
                      <td className="py-2 px-3">{formatCurrency(payslip.gross_salary)}</td>
                      <td className="py-2 px-3">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deductions Table */}
            <div>
              <h2 className="bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-t">DEDUCTIONS</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <th className="py-2 px-3 text-left">DESCRIPTION</th>
                      <th className="py-2 px-3 text-left">CURRENT</th>
                      <th className="py-2 px-3 text-left">YTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductionsItems.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-100 dark:bg-gray-600" : "bg-white dark:bg-gray-800"}>
                        <td className="py-2 px-3">{item.desc}</td>
                        <td className="py-2 px-3">{item.current}</td>
                        <td className="py-2 px-3">{item.ytd}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
                      <td className="py-2 px-3">TOTAL DEDUCTIONS</td>
                      <td className="py-2 px-3">{formatCurrency(payslip.deductions)}</td>
                      <td className="py-2 px-3">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Pay */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold">
                    <td className="py-2 px-3">NET PAY</td>
                    <td className="py-2 px-3">{formatCurrency(payslip.net_salary)}</td>
                    <td className="py-2 px-3">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center block mt-4">
              <p className="py-1">Disclaimer: This is electronically generated; no signature required.</p>
              <p className="py-1">Copyright BFD Enterprises. All Rights Reserved. BDF Enterprises Highly Confidential</p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
              <p>
                If you have any questions about this payslip, please contact{" "}
                <br />
                {payslip.employee?.user
                  ? `${payslip.employee.user.firstname} ${payslip.employee.user.lastname}`
                  : `Employee #${payslip.employee_id}`}, {payslip.employee?.user?.phone_number || "N/A"}, {payslip.employee?.user?.email || "N/A"}
              </p>
              <p className="fw-bold">Powered by: Hunter Enterprises</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}