import { AlertTriangle, Bell, Building2, History, LayoutDashboard, Users, type LucideIcon } from "lucide-react";

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
        description: "Overview & live requests",
        exact: true,
        /** Shows a live count badge. */
        countKey: "activeRequests",
    },
    {
        id: "emergency_requests",
        title: "Emergency Requests",
        url: "/hospital/emergency",
        icon: AlertTriangle,
        description: "Broadcast to compatible donors",
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
    {
        id: "hospital_profile",
        title: "Hospital Profile",
        url: "/hospital/profile",
        icon: Building2,
        description: "Workspace and accreditation",
    },
    {
        id: "team",
        title: "Team & Roles",
        url: "/hospital/team",
        icon: Users,
        description: "Members, invites and roles",
    },
] as const;

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
    return getActiveHospitalItem(pathname)?.title;
}