"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { Wordmark } from "@/components/brand/wordmark";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import { SidebarUserMenu, type SidebarUser } from "./sidebar-user-menu";
import { BloodBankStatusCard, type BloodBankStatus } from "./blood-bank-status";
import { HospitalSupportDialog } from "./hospital-support-dialog";
import { HospitalWorkspaceCard } from "./hospital-workspace-card";
import { HOSPITAL_NAV_ITEMS } from "./hospital-nav-config";

const NAV_BUTTON_CLASS = [
    "h-auto gap-3 rounded-xl border border-transparent px-3 py-2.5 text-xs font-medium transition-colors",
    "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
    "data-[active=true]:border-brand/40 data-[active=true]:bg-white data-[active=true]:text-neutral-900",
    "data-[active=true]:shadow-sm data-[active=true]:hover:bg-white data-[active=true]:hover:text-neutral-900",
    "[&>svg]:size-[18px]",
].join(" ");

export interface HospitalSidebarProps {
    user: SidebarUser;
    hospitalName: string;
    hospitalLocation: string;
    hospitalAccredited?: boolean;
    activeUrl?: string;
    activeRequestCount?: number;
    hasUnreadNotifications?: boolean;
    bloodBankStatus?: BloodBankStatus;
    bloodBankMessage?: string;
}

export function HospitalSidebar({
    user,
    hospitalName,
    hospitalLocation,
    hospitalAccredited = true,
    activeUrl,
    activeRequestCount = 0,
    hasUnreadNotifications = false,
    bloodBankStatus = "operational",
    bloodBankMessage = "Operational & ready",
}: HospitalSidebarProps) {
    const { setOpenMobile } = useSidebar();
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const closeMobile = () => setOpenMobile(false);

    return (
        <>
            <Sidebar variant="inset">
                <SidebarHeader className="p-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/hospital" onClick={closeMobile}>
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
                                        <BloodDropIcon className="size-5" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <Wordmark size="sm" className="truncate" />
                                        <span className="truncate text-[11px] text-sidebar-foreground/60">
                                            Blood Management
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="px-3">
                    <SidebarGroup>
                        <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                            Emergency Operations
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {HOSPITAL_NAV_ITEMS.map((item) => {
                                    const isActive = item.url === activeUrl;
                                    const count =
                                        item.countKey === "activeRequests" ? activeRequestCount : 0;
                                    const showDot =
                                        item.dotKey === "notifications" ? hasUnreadNotifications : false;

                                    return (
                                        <SidebarMenuItem key={item.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className={NAV_BUTTON_CLASS}
                                            >
                                                <Link
                                                    href={item.url}
                                                    aria-current={isActive ? "page" : undefined}
                                                    onClick={closeMobile}
                                                >
                                                    <item.icon
                                                        aria-hidden="true"
                                                        className={isActive ? "text-brand" : undefined}
                                                    />
                                                    <div className="min-w-0 flex-1 text-left">
                                                        <div className="truncate font-semibold">{item.title}</div>
                                                        <div className="truncate text-[10px] text-sidebar-foreground/50">
                                                            {item.description}
                                                        </div>
                                                    </div>

                                                    {count > 0 && (
                                                        <span className="shrink-0 rounded-full bg-brand/15 px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
                                                            {count > 9 ? "9+" : count} Active
                                                        </span>
                                                    )}

                                                    {showDot && !count && (
                                                        <span className="size-1.5 shrink-0 rounded-full bg-destructive">
                                                            <span className="sr-only">Unread</span>
                                                        </span>
                                                    )}

                                                    {isActive && (
                                                        <span aria-hidden="true" className="flex shrink-0">
                                                            <ChevronRight className="size-4 text-brand" />
                                                        </span>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        className="h-auto gap-3 rounded-xl border border-brand/25 bg-brand/10 px-3 py-2.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/20 hover:text-brand"
                                    >
                                        <Link
                                            href="/hospital/emergency"
                                            onClick={closeMobile}
                                        >
                                            <Plus
                                                aria-hidden="true"
                                                className="size-[18px]"
                                            />
                                            <span className="min-w-0 flex-1 text-left">
                                                <span className="block truncate">
                                                    Create Blood Request
                                                </span>
                                                <span className="block truncate text-[10px] font-normal text-sidebar-foreground/50">
                                                    Broadcast to nearby donors
                                                </span>
                                            </span>
                                            <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                                                Urgent
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="gap-2 p-3">
                    <BloodBankStatusCard status={bloodBankStatus} message={bloodBankMessage} />
                    <HospitalWorkspaceCard
                        name={hospitalName}
                        location={hospitalLocation}
                        isAccredited={hospitalAccredited}
                    />
                    <SidebarUserMenu
                        role="hospital"
                        user={user}
                        onSupportClick={() => setIsHelpOpen(true)}
                    />
                </SidebarFooter>
            </Sidebar>

            <HospitalSupportDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
        </>
    );
}