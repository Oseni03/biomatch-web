import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EligibilityView {
    tone: "eligible" | "deferred" | "ineligible";
    /** Short status line, e.g. "Available today" or "Eligible again 12 Nov". */
    headline: string;
    /** One sentence of context. */
    detail: string;
}

const TONES = {
    eligible: {
        icon: ShieldCheck,
        label: "Eligible",
        iconClass: "text-emerald-500",
        pillClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    deferred: {
        icon: ShieldAlert,
        label: "Deferred",
        iconClass: "text-amber-500",
        pillClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    ineligible: {
        icon: ShieldOff,
        label: "Not eligible",
        iconClass: "text-destructive",
        pillClass: "border-destructive/30 bg-destructive/10 text-destructive",
    },
} as const;

export function EligibilityCard({ tone, headline, detail }: EligibilityView) {
    const { icon: Icon, label, iconClass, pillClass } = TONES[tone];

    return (
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3.5">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/60">
                    <Icon className={cn("size-3.5", iconClass)} aria-hidden="true" />
                    Eligibility Status
                </div>
                <span
                    className={cn("rounded-lg border px-2 py-0.5 text-xs font-semibold", pillClass)}
                >
                    {label}
                </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-sidebar-foreground">{headline}</p>
            <p className="mt-1 text-xs leading-snug text-sidebar-foreground/60">{detail}</p>
        </div>
    );
}