import {
Tabs,
TabsList,
TabsTrigger,
TabsContent,
} from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";

interface TabItem {
label: string;
value: string;
icon: LucideIcon;
content: React.ReactNode;
}

interface CustomTabsTableProps {
tabs: TabItem[];
defaultValue?: string;
className?: string;
}

const CustomTabsTable: React.FC<CustomTabsTableProps> = ({
tabs,
defaultValue,
className = "",
}) => {
return (
        <div>
            <Tabs defaultValue={defaultValue || tabs[0]?.value} className={className}>
            <TabsList className={`grid w-2/3 items-start flex-start mb-4 grid-cols-${tabs.length}`}>
                {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                {tab.content}
                </TabsContent>
            ))}
            </Tabs>
        </div>
    );
};

export default CustomTabsTable;