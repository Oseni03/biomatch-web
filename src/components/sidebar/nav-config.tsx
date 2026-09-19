import {
    AlertTriangle,
    Bell,
    History,
    LayoutDashboard,
    Radio,
    type LucideIcon,
} from "lucide-react";

export type Role = "donor" | "hospital";

export interface NavItem {
    title: string;
    url: string;
    icon: LucideIcon;
    /** Only highlight on the exact URL. Needed for the dashboard root, which prefixes every other route. */
    exact?: boolean;
    /** Shows a live count badge, read from the counts the sidebar computes. */
    countKey?: "alerts";
    /** Shows a red dot when the matching flag is true. */
    dotKey?: "notifications";
}

// Profile is reached from the account menu in the sidebar footer, not from here.
export const NAV_ITEMS: Record<Role, NavItem[]> = {
    donor: [
        { title: "Dashboard", url: "/donor", icon: LayoutDashboard, exact: true },
        { title: "Urgent Requests", url: "/donor/requests", icon: Radio, countKey: "alerts" },
        { title: "Donation History", url: "/donor/history", icon: History },
        {
            title: "Notifications",
            url: "/donor/notifications",
            icon: Bell,
            dotKey: "notifications",
        },
    ],
    hospital: [
        { title: "Dashboard", url: "/hospital", icon: LayoutDashboard, exact: true },
        { title: "Emergency Request", url: "/hospital/emergency", icon: AlertTriangle },
        { title: "Request History", url: "/hospital/history", icon: History },
    ],
};

export const SECTION_LABELS: Record<Role, string> = {
    donor: "Donor",
    hospital: "Hospital",
};

export const HOME_URL: Record<Role, string> = {
    donor: "/donor",
    hospital: "/hospital",
};

export const PROFILE_URL: Record<Role, string> = {
    donor: "/donor/profile",
    hospital: "/hospital/profile",
};

export const FALLBACK_NAME: Record<Role, string> = {
    donor: "BioMATCH User",
    hospital: "Hospital Account",
};

function isWithin(pathname: string, url: string) {
    return pathname === url || pathname.startsWith(`${url}/`);
}

/**
 * Longest-prefix match, so "/donor/requests/42" activates "Urgent Requests".
 * Items marked `exact` (the dashboard root) never match sub-routes.
 */
export function getActiveItem(role: Role, pathname: string): NavItem | undefined {
    let best: NavItem | undefined;
    for (const item of NAV_ITEMS[role]) {
        const matches = item.exact ? pathname === item.url : isWithin(pathname, item.url);
        if (matches && (!best || item.url.length > best.url.length)) {
            best = item;
        }
    }
    return best;
}

/** Title for the topbar breadcrumb, including routes that have no sidebar item. */
export function getPageTitle(role: Role, pathname: string): string | undefined {
    if (isWithin(pathname, PROFILE_URL[role])) return "Profile";
    return getActiveItem(role, pathname)?.title;
}