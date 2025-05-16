import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { Employee } from "@/types/employee";

interface EmployeeAnalyticsProps {
    // employees: Employee[];
    labelCount: number;
    spanCount?: string;
    labelTitle: string;
    icon: React.ReactNode;
}

export const EmployeeAnalytics: React.FC<EmployeeAnalyticsProps> = ({
    // employees,
    labelCount,
    spanCount,
    labelTitle,
    icon,
}) => {
    const workforceData = {
        // employees: employees,
        labelCount: labelCount,
        spanCount: spanCount,
        labelTitle: labelTitle,
        icon: icon,
    };
    return (
        <Card className="w-48 max-w-xs bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
            <CardHeader>
                <CardTitle>
                    {icon}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
                <p className="text-3xl font-bold">
                    {labelCount}{" "}
                    {spanCount && (
                        <span className="text-green-600 text-base">{spanCount}</span>
                    )}
                </p>
                <p className="text-xs font-semibold">{workforceData.labelTitle}</p>
                {/* <p>On Leave: {workforceData.onLeave}</p> */}
                {/* <p>Resigned: {workforceData.resigned}</p> */}
            </CardContent>
        </Card>
    );
}