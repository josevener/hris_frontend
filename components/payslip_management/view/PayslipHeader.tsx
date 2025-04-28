import { Card, CardContent } from "@/components/ui/card";
import Company from "@/types/company";

interface PayslipHeaderProps {
  company: Company[] | null;
}

export const PayslipHeader: React.FC<PayslipHeaderProps> = ({ company }) => {
  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-none shadow-none">
      <CardContent className="flex justify-between items-start p-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {company && company.length > 0 ? company[0].name : "N/A"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {company && company.length > 0 && company[0].address
              ? company[0].address.split("\r\n").map((line, index) => (
                  <span key={index}>
                    {line.trim()}
                    <br />
                  </span>
                ))
              : "N/A"}
            Contact Number: {company && company.length > 0 ? company[0].phone : "N/A"}
            <br />
            Email: {company && company.length > 0 ? company[0].email : "N/A"}
          </p>
        </div>
        <img
          src="/assets/images/bfd.jpg"
          alt="Company Logo"
          className="h-32 w-32 object-contain"
        />
      </CardContent>
    </Card>
  );
};