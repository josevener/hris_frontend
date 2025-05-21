import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactNode } from "react";

export interface ActionItem<T = any> {
  label: string;
  icon: ReactNode;
  onClick: (item: T) => void;
  show?: boolean | ((item: T) => boolean);
  danger?: boolean;
}

interface CustomActionsProps<T = any> {
  item: T;
  actions: ActionItem<T>[];
}

const CustomActions = <T,>({ item, actions }: CustomActionsProps<T>) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="dark:text-foreground dark:hover:bg-gray-700"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-2">
          {actions.map((action, index) => {
            const shouldShow =
              typeof action.show === "function"
                ? action.show(item)
                : action.show ?? true;

            if (!shouldShow) return null;

            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => action.onClick(item)}
                className={`justify-start ${
                  action.danger
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground dark:text-foreground"
                } dark:hover:bg-gray-700`}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomActions;
