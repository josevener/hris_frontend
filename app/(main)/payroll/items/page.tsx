import PayrollItemList from "@/components/payroll_item_management/PayrollItemList";

export default function SalariesPage() {
  return (
    <div className="container mx-auto p-6" suppressHydrationWarning>
      <PayrollItemList />
    </div>
  );
}
