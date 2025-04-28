"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { fetchPayslip } from "@/services/api/apiPayslip";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Loader2, Download, ArrowLeft, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/lib/AuthContext";
import { PayrollItem } from "@/types/payroll";
import { fetchPayrollItems } from "@/services/api/apiPayrollItem";
import { fetchCompanyDetails } from "@/services/api/apiCompany";
import Company from "@/types/company";
import { Payslip } from "@/types/payslip";
import { PayslipHeader } from "@/components/payslip_management/view/PayslipHeader";
import { EmployeeInfo } from "@/components/payslip_management/view/EmployeeInfo";
import { PayrollMetadata } from "@/components/payslip_management/view/PayrollMetadata";
import { EarningsTable } from "@/components/payslip_management/view/EarningsTable";
import { DeductionsTable } from "@/components/payslip_management/view/DeductionsTable";
import { PayslipFooter } from "@/components/payslip_management/view/PayslipFooter";

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
  const buttonsRef = useRef<HTMLDivElement>(null);

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
          const items = await fetchPayrollItems();
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      hours: "-",
      rate: "-",
      current: formatCurrency(parseFloat(String(item.amount))),
      ytd: "N/A",
    }));
  console.log("[id]/page.tsx: Deductions items:", deductionsItems);

  const generatePDF = async () => {
    if (!payslip || !company || company.length === 0 || !payslipRef.current) return;

    try {
      // Temporarily enforce light mode for PDF rendering
      const originalClass = payslipRef.current.className;
      payslipRef.current.className = originalClass
        .replace("dark:bg-gray-800", "bg-white")
        .replace("dark:text-gray-100", "text-gray-900")
        .replace("dark:text-gray-300", "text-gray-700")
        .replace("dark:bg-gray-600", "bg-gray-100")
        .replace("dark:bg-gray-700", "bg-gray-200");

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

  const printPayslip = async () => {
    if (!payslipRef.current || !buttonsRef.current) return;

    try {
      // Temporarily hide buttons for the canvas capture
      const buttons = buttonsRef.current;
      const originalButtonsDisplay = buttons.style.display;
      buttons.style.display = "none";

      // Capture the payslip content as an image using html2canvas
      const canvas = await html2canvas(payslipRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#1F2937" : "#ffffff", // Preserve theme
      });

      // Restore buttons visibility
      buttons.style.display = originalButtonsDisplay;

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // A4 dimensions in mm (210mm width, 297mm height)
      const a4WidthMm = 210;
      const a4HeightMm = 297;
      const margin = 1.2; // 10mm margin on all sides
      const usableWidthMm = a4WidthMm - 2 * margin; // 190mm
      const usableHeightMm = a4HeightMm - 2 * margin; // 277mm

      // Convert usable dimensions to pixels (assuming 96 DPI for simplicity, 1mm = 3.78 pixels)
      const dpi = 96;
      const mmToPx = dpi / 25.4; // 1mm = 3.78 pixels at 96 DPI
      const usableWidthPx = usableWidthMm * mmToPx; // 190mm * 3.78 = ~718px
      const usableHeightPx = usableHeightMm * mmToPx; // 277mm * 3.78 = ~1047px

      // Calculate the scaling ratio to fit the image within the usable A4 dimensions
      const widthRatio = usableWidthPx / imgWidth;
      const heightRatio = usableHeightPx / imgHeight;
      const ratio = Math.min(widthRatio, heightRatio); // Use the smaller ratio to fit both dimensions

      const scaledWidthPx = imgWidth * ratio;
      const scaledHeightPx = imgHeight * ratio;

      // Convert scaled dimensions back to mm for CSS
      const scaledWidthMm = scaledWidthPx / mmToPx;
      const scaledHeightMm = scaledHeightPx / mmToPx;

      // Open a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Failed to open print window. Please allow pop-ups for this site.");
      }

      // Write the HTML structure with the captured image
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title></title> <!-- Empty title to avoid showing in header -->
            <style>
              @page {
                size: Letter;
                margin: 0; /* Remove default margins to control our own */
              }
              body {
                margin: 0;
                padding: ${margin}mm; /* Apply our own margins */
                box-sizing: border-box;
              }
              img {
                display: block;
                width: ${scaledWidthMm}mm;
                height: ${scaledHeightMm}mm;
                margin: 0 auto;
                page-break-before: auto;
                page-break-after: auto;
                page-break-inside: avoid; /* Prevent splitting across pages */
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Payslip" />
          </body>
        </html>
      `);

      // Close the document to finish writing
      printWindow.document.close();

      // Wait for the content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("Error printing payslip:", error);
      toast.error("Failed to print payslip.");
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
      <style jsx>{`
        @media print {
          .hide-on-print {
            display: none;
          }
          /* Ensure the page background is not printed */
          body {
            background: none !important;
          }
          /* Ensure the payslip container maintains its styling */
          .payslip-container {
            max-width: 864px !important; /* Matches max-w-3xl */
            margin: 0 auto !important;
            padding: 24px !important;
            background: ${document.documentElement.classList.contains("dark") ? "#1F2937" : "#ffffff"} !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            border-radius: 0.5rem !important;
          }
        }
      `}</style>
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-3xl mx-auto payslip-container">
        {/* Buttons at the top-right */}
        <div ref={buttonsRef} className="flex justify-end mb-4 hide-on-print">
          <div className="flex gap-3">
            <Button
              onClick={generatePDF}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button
              onClick={printPayslip}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors flex items-center gap-2"
            >
              <Printer className="h-4 w-4" /> Print Payslip
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

        {/* Payslip Content */}
        <div ref={payslipRef} className="w-full space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <PayslipHeader company={company} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmployeeInfo payslip={payslip} />
            <PayrollMetadata payslip={payslip} />
          </div>
          <EarningsTable payslip={payslip} earningsItems={earningsItems} formatCurrency={formatCurrency} />
          <DeductionsTable payslip={payslip} deductionsItems={deductionsItems} formatCurrency={formatCurrency} />
          <PayslipFooter payslip={payslip} />
        </div>
      </div>
    </div>
  );
}