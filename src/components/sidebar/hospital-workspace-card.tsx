import { Building2 } from "lucide-react";

export interface HospitalWorkspaceCardProps {
    /** Hospital name */
    name: string;
    /** Full location string, e.g. "Lagos Island, Lagos" */
    location: string;
    /** Whether the hospital is accredited. */
    isAccredited?: boolean;
}

export function HospitalWorkspaceCard({
    name,
    location,
    isAccredited = true,
}: HospitalWorkspaceCardProps) {
    return (
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3.5">
            <div className="flex items-start gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
                    <Building2 className="size-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
                        Hospital Workspace
                    </div>
                    <p className="truncate text-sm font-semibold text-sidebar-foreground" title={name}>
                        {name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                        {isAccredited && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                                Accredited
                            </span>
                        )}
                        <span className="text-sidebar-foreground/30">•</span>
                        <span className="truncate text-[10px] text-sidebar-foreground/60">{location}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}