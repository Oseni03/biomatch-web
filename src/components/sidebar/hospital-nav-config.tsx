import { AlertTriangle, Bell, History, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface HospitalNavItem {
    id: string;
    title: string;
    url: string;
    icon: LucideIcon;
    description: string;
    /** Only highlight on the exact URL. Needed for the dashboard root, which prefixes every other route. */
    exact?: boolean;
    /** Shows a live count badge. */
    countKey?: "activeRequests";
    /** Shows a red dot when the matching flag is true. */
    dotKey?: "notifications";
}

export const HOSPITAL_NAV_ITEMS: HospitalNavItem[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        url: "/hospital",
        icon: LayoutDashboard,
        description: "Overview & emergency stats",
        exact: true,
    },
    {
        id: "emergency_requests",
        title: "Emergency Requests",
        url: "/hospital/emergency",
        icon: AlertTriangle,
        description: "Live alerts & responding donors",
        countKey: "activeRequests",
    },
    {
        id: "request_history",
        title: "Request History",
        url: "/hospital/history",
        icon: History,
        description: "Fulfilled & past records",
    },
    {
        id: "notifications",
        title: "Notifications",
        url: "/hospital/notifications",
        icon: Bell,
        description: "Dispatch and donor updates",
        dotKey: "notifications",
    },
] as const;

export const FALLBACK_HOSPITAL_NAME = "Hospital Account";

export function getActiveHospitalItem(pathname: string): HospitalNavItem | undefined {
    let best: HospitalNavItem | undefined;
    for (const item of HOSPITAL_NAV_ITEMS) {
        const exact = "exact" in item && item.exact;
        const matches = exact ? pathname === item.url : pathname === item.url || pathname.startsWith(`${item.url}/`);
        if (matches && (!best || item.url.length > best.url.length)) {
            best = item;
        }
    }
    return best;
}

export function getHospitalPageTitle(pathname: string): string | undefined {
    // Check for pages that don't have nav items
    if (pathname.includes("/hospital/profile")) return "Hospital Profile";
    return getActiveHospitalItem(pathname)?.title;
}