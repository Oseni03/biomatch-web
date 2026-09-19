import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROFILE_URL, SECTION_LABELS, type Role } from "./nav-config";

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

interface AccountSummaryProps {
    role: Role;
    name: string;
    onNavigate?: () => void;
}

export function AccountSummary({ role, name, onNavigate }: AccountSummaryProps) {
    return (
        <Link
            href={PROFILE_URL[role]}
            onClick={onNavigate}
            className="group block rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 transition-colors hover:bg-sidebar-accent"
        >
            <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-xs font-bold text-brand">
                    {role === "hospital" ? (
                        <Building2 className="size-5" aria-hidden="true" />
                    ) : (
                        getInitials(name)
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold">{name}</p>
                        <ChevronRight
                            className="size-3.5 shrink-0 text-sidebar-foreground/40 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                        />
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-brand/20 bg-brand/10 px-1.5 py-0 text-[10px] text-brand"
                        >
                            {SECTION_LABELS[role]}
                        </Badge>
                        <span className="truncate text-[11px] text-sidebar-foreground/60">
                            View profile
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}