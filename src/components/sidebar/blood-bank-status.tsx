import { Droplet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type BloodBankStatus = "operational" | "limited" | "offline";

export interface BloodBankStatusCardProps {
    status: BloodBankStatus;
    /** e.g., "5 units in stock" or "Restocking in progress" */
    message: string;
}

const STATUS_CONFIG = {
    operational: {
        label: "Operational",
        dotClass: "bg-emerald-500",
        iconClass: "text-emerald-500",
        bgClass: "bg-emerald-500/10 border-emerald-500/20",
    },
    limited: {
        label: "Limited Availability",
        dotClass: "bg-amber-500",
        iconClass: "text-amber-500",
        bgClass: "bg-amber-500/10 border-amber-500/20",
    },
    offline: {
        label: "Offline",
        dotClass: "bg-destructive",
        iconClass: "text-destructive",
        bgClass: "bg-destructive/10 border-destructive/20",
    },
} as const;

export function BloodBankStatusCard({ status, message }: BloodBankStatusCardProps) {
    const config = STATUS_CONFIG[status];

    return (
        <div className={cn("rounded-xl border p-3.5", config.bgClass)}>
            <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 shrink-0 ${config.iconClass}`}>
                    {status === "offline" ? (
                        <AlertCircle className="size-4" aria-hidden="true" />
                    ) : (
                        <Droplet className="size-4" aria-hidden="true" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className={cn("size-1.5 rounded-full", config.dotClass)} aria-hidden="true" />
                        <span className="text-xs font-semibold text-sidebar-foreground">
                            Blood Bank
                        </span>
                    </div>
                    <p className="mt-1 text-[11px] text-sidebar-foreground/80">{message}</p>
                </div>
            </div>
        </div>
    );
}