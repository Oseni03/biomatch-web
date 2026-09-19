"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";
import type { EligibilityView } from "./eligibility-card";
import {
    FALLBACK_NAME,
    SECTION_LABELS,
    getActiveItem,
    getPageTitle,
    type Role,
} from "./nav-config";

interface SidebarLayoutProps {
    role: Role;
    /** Optional server-provided name; avoids a flash while the client session loads. */
    userName?: string;
    /** Donor eligibility for the sidebar card. The card is hidden when omitted. */
    eligibility?: EligibilityView;
    /** Shows the red dot on Notifications. */
    hasUnreadNotifications?: boolean;
    children: React.ReactNode;
}

export function SidebarLayout({
    role,
    userName,
    eligibility,
    hasUnreadNotifications,
    children,
}: SidebarLayoutProps) {
    const { data: session } = authClient.useSession();
    const pathname = usePathname();

    const activeUrl = getActiveItem(role, pathname)?.url;
    const pageTitle = getPageTitle(role, pathname);

    const user = {
        name: userName ?? session?.user?.name ?? FALLBACK_NAME[role],
        email: session?.user?.email ?? "",
        image: session?.user?.image,
    };

    return (
        <SidebarProvider>
            <AppSidebar
                role={role}
                userId={session?.user?.id}
                user={user}
                activeUrl={activeUrl}
                eligibility={eligibility}
                hasUnreadNotifications={hasUnreadNotifications}
            />
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