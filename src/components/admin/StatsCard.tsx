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
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
                    <p
                        className={cn(
                            "text-3xl font-bold mt-1",
                            variant === "warning" && "text-red-600",
                            variant === "success" && "text-green-600",
                            variant === "default" && "text-zinc-900 dark:text-zinc-100"
                        )}
                    >
                        {value}
                    </p>
                    {description && (
                        <p className="text-xs text-zinc-400 mt-1">{description}</p>
                    )}
                </div>
                <div
                    className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        variant === "warning" && "bg-red-100 text-red-600 dark:bg-red-900/30",
                        variant === "success" && "bg-green-100 text-green-600 dark:bg-green-900/30",
                        variant === "default" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    )}
                >
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
