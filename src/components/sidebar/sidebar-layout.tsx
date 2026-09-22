"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { usePendingEmergencyRequests } from "@/hooks/use-emergency-requests";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";
import { HospitalSidebar } from "./hospital-sidebar";
import type { EligibilityView } from "./eligibility-card";
import {
    getActiveHospitalItem,
    getHospitalPageTitle,
} from "./hospital-nav-config";
import type { BloodBankStatus } from "./blood-bank-status";
import {
    FALLBACK_NAME,
    SECTION_LABELS,
    getActiveItem,
    getPageTitle,
    type Role,
} from "./nav-config";

function useHospitalRequestActivity(organizationId?: string) {
    const { data } = usePendingEmergencyRequests(organizationId, { page: 1, pageSize: 10 });
    const requests = data?.requests ?? [];
    // Red dot when a donor needs hospital attention: accepted, en route, or arrived.
    const hasActionableResponses = requests.some(
        (r) =>
            r.aggregates.accepted + r.aggregates.en_route + r.aggregates.arrived > 0,
    );
    return {
        activeRequestCount: data?.total ?? 0,
        hasActionableResponses,
    };
}

interface SidebarLayoutProps {
    role: Role;
    /** Optional server-provided name; avoids a flash while the client session loads. */
    userName?: string;
    /** Donor eligibility for the sidebar card. The card is hidden when omitted. */
    eligibility?: EligibilityView;
    /** Shows the red dot on Notifications. */
    hasUnreadNotifications?: boolean;
    children: React.ReactNode;

    /** Hospital-only: feeds the dedicated HospitalSidebar. */
    organizationId?: string;
    hospitalName?: string;
    hospitalLocation?: string;
    bloodBankStatus?: BloodBankStatus;
    bloodBankMessage?: string;
    /** Hospital-only: enables the multi-hospital switcher. */
    hospitalUserId?: string;
}

export function SidebarLayout({
    role,
    userName,
    eligibility,
    hasUnreadNotifications,
    children,
    organizationId,
    hospitalName,
    hospitalLocation,
    bloodBankStatus,
    bloodBankMessage,
    hospitalUserId,
}: SidebarLayoutProps) {
    const { data: session } = authClient.useSession();
    const pathname = usePathname();

    const activeUrl =
        role === "hospital"
            ? getActiveHospitalItem(pathname)?.url
            : getActiveItem(role, pathname)?.url;
    const pageTitle =
        role === "hospital" ? getHospitalPageTitle(pathname) : getPageTitle(role, pathname);

    const user = {
        name: userName ?? session?.user?.name ?? FALLBACK_NAME[role],
        email: session?.user?.email ?? "",
        image: session?.user?.image,
    };

    const hospitalActivity = useHospitalRequestActivity(
        role === "hospital" ? organizationId : undefined,
    );

    return (
        <SidebarProvider>
            {role === "hospital" ? (
                <HospitalSidebar
                    user={user}
                    userId={hospitalUserId}
                    hospitalName={hospitalName || FALLBACK_NAME.hospital}
                    hospitalLocation={hospitalLocation ?? ""}
                    activeUrl={activeUrl}
                    activeRequestCount={hospitalActivity.activeRequestCount}
                    hasUnreadNotifications={
                        hasUnreadNotifications ?? hospitalActivity.hasActionableResponses
                    }
                    bloodBankStatus={bloodBankStatus}
                    bloodBankMessage={bloodBankMessage}
                    organizationId={organizationId}
                />
            ) : (
                <AppSidebar
                    role={role}
                    userId={session?.user?.id}
                    user={user}
                    activeUrl={activeUrl}
                    eligibility={eligibility}
                    hasUnreadNotifications={hasUnreadNotifications}
                />
            )}
            <SidebarInset>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <header className="on-ink flex h-14 shrink-0 items-center gap-2 rounded-2xl border border-sidebar-border bg-sidebar px-4 shadow-card">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />

                        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
                            <span className="text-sidebar-foreground/60">{SECTION_LABELS[role]}</span>
                            {pageTitle && (
                                <>
                                    <ChevronRight
                                        className="size-3.5 shrink-0 text-sidebar-foreground/40"
                                        aria-hidden="true"
                                    />
                                    <span className="truncate font-medium" aria-current="page">
                                        {pageTitle}
                                    </span>
                                </>
                            )}
                        </nav>
                    </header>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}