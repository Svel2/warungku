import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    variant?: "default" | "warning" | "success";
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    variant = "default",
}: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">{title}</p>
                    <p
                        className={cn(
                            "text-xl sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1",
                            variant === "warning" && "text-red-600",
                            variant === "success" && "text-green-600",
                            variant === "default" && "text-zinc-900 dark:text-zinc-100"
                        )}
                    >
                        {value}
                    </p>
                    {description && (
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 truncate">{description}</p>
                    )}
                </div>
                <div
                    className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                        variant === "warning" && "bg-red-100 text-red-600 dark:bg-red-900/30",
                        variant === "success" && "bg-green-100 text-green-600 dark:bg-green-900/30",
                        variant === "default" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    )}
                >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
            </div>
        </div>
    );
}
