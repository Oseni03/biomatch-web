"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useDonorAlerts } from "@/hooks/use-emergency-requests";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { getEligibility, ELIGIBILITY_MONTHS } from "@/lib/eligibility";
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

import { EligibilityCard, type EligibilityView } from "./eligibility-card";
import { HOME_URL, NAV_ITEMS, type Role } from "./nav-config";
import { SidebarUserMenu, type SidebarUser } from "./sidebar-user-menu";

const ACTIVE_ALERT_STATUSES = new Set<string>(["alerted", "accepted", "en_route"]);

// Muted by default; the active item becomes a light pill with a red outline and red accents.
const NAV_BUTTON_CLASS = [
    "h-10 gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold",
    "text-sidebar-foreground/60 transition-colors",
    "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
    "[&>svg]:size-[18px]",
    "data-[active=true]:border-brand/40 data-[active=true]:bg-white data-[active=true]:text-neutral-900",
    "data-[active=true]:shadow-sm data-[active=true]:hover:bg-white data-[active=true]:hover:text-neutral-900",
].join(" ");

/** Live count of alerts a donor still needs to act on. Always 0 for hospitals. */
function useActiveAlertCount(role: Role, userId?: string) {
    const { data } = useDonorAlerts(role === "donor" ? userId : undefined);
    return (data?.alerts ?? []).filter((alert) => (ACTIVE_ALERT_STATUSES as readonly string[]).includes(alert.status)).length;
}

type DonorEligibilityUser = {
    lastDonationDate?: Date | string | null;
    deferredUntil?: Date | string | null;
    blacklistedAt?: Date | string | null;
};

/** Map a donor's screening/cooldown state onto the sidebar eligibility card. */
function buildEligibilityView(user?: DonorEligibilityUser | null): EligibilityView | undefined {
    if (!user) return undefined;

    if (user.blacklistedAt) {
        return {
            tone: "ineligible",
            headline: "Permanently blacklisted",
            detail: "You can no longer donate through BioMATCH.",
        };
    }

    if (user.deferredUntil) {
        const until = new Date(user.deferredUntil);
        if (until > new Date()) {
            const dateLabel = until.toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
            });
            return {
                tone: "deferred",
                headline: `Deferred until ${dateLabel}`,
                detail: "Your screening deferred you until this date.",
            };
        }
    }

    const lastDonation = user.lastDonationDate
        ? new Date(user.lastDonationDate).toISOString().slice(0, 10)
        : null;
    const eligibility = getEligibility(lastDonation);

    if (eligibility.eligible) {
        return {
            tone: "eligible",
            headline: "Available today",
            detail: "You're cleared to donate right now.",
        };
    }

    return {
        tone: "deferred",
        headline: `Eligible again in ${eligibility.daysRemaining} days`,
        detail: `${ELIGIBILITY_MONTHS}-month wait between donations.`,
    };
}

interface AppSidebarProps {
    role: Role;
    userId?: string;
    user: SidebarUser;
    activeUrl?: string;
    eligibility?: EligibilityView;
    hasUnreadNotifications?: boolean;
}

export function AppSidebar({
    role,
    userId,
    user,
    activeUrl,
    eligibility,
    hasUnreadNotifications = false,
}: AppSidebarProps) {
    const { setOpenMobile } = useSidebar();
    const counts = { alerts: useActiveAlertCount(role, userId) };
    const dots = { notifications: hasUnreadNotifications };

    // Server-provided eligibility wins; otherwise live-derive it from the donor
    // dashboard query (already prefetched on /donor, refreshed by mutations).
    const donorUser = useDonorDashboard().data;
    const cardEligibility = eligibility ?? buildEligibilityView(donorUser ?? null);

    // On mobile the sidebar is a sheet; close it once the user picks a destination.
    const closeMobile = () => setOpenMobile(false);

    return (
        <Sidebar variant="inset">
            <SidebarHeader className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={HOME_URL[role]} onClick={closeMobile}>
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
                        Menu
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {NAV_ITEMS[role].map((item) => {
                                const isActive = item.url === activeUrl;
                                const count = item.countKey ? counts[item.countKey] : 0;
                                const showDot = item.dotKey ? dots[item.dotKey] : false;

                                return (
                                    <SidebarMenuItem key={item.url}>
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
                                                <span className="flex-1 truncate">{item.title}</span>

                                                {count > 0 && (
                                                    <span className="rounded-full bg-brand/15 px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
                                                        {count > 9 ? "9+" : count} Live
                                                    </span>
                                                )}

                                                {showDot && (
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
            </SidebarContent>

            <SidebarFooter className="gap-2 p-3">
                {role === "donor" && cardEligibility && <EligibilityCard {...cardEligibility} />}
                <SidebarUserMenu role={role} user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}