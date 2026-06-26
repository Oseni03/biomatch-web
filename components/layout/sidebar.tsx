"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	ClipboardPlus,
	Building2,
	Droplet,
	FileSignature,
	HeartPulse,
	LayoutDashboard,
	ListChecks,
	Search,
	ShieldCheck,
	AlertTriangle,
	Wallet,
	type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAlertCount } from "@/lib/alert-context";

type Role = "donor" | "hospital" | "admin";

const NAV_ITEMS: Record<
	Role,
	{ title: string; url: string; icon: LucideIcon }[]
> = {
	donor: [
		{ title: "Dashboard", url: "/donor", icon: LayoutDashboard },
		{
			title: "Health Profile",
			url: "/donor/health-profile",
			icon: HeartPulse,
		},
		{ title: "My BioMatch Wallet", url: "/donor/wallet", icon: Wallet },
	],
	hospital: [
		{
			title: "Live Inventory Grid",
			url: "/hospital/inventory",
			icon: Building2,
		},
		{
			title: "Emergency Request",
			url: "/hospital/emergency",
			icon: AlertTriangle,
		},
		{
			title: "BioMatch Donor Finder",
			url: "/hospital/donor-finder",
			icon: Search,
		},
		{
			title: "Request Blood Drive",
			url: "/hospital/blood-drive",
			icon: ClipboardPlus,
		},
	],
	admin: [
		{ title: "System Overview", url: "/admin", icon: ShieldCheck },
		{
			title: "Verification Queue",
			url: "/admin/verification",
			icon: ListChecks,
		},
		{
			title: "Partner Contracts",
			url: "/admin/contracts",
			icon: FileSignature,
		},
	],
};

const SECTION_LABELS: Record<Role, string> = {
	donor: "Donor",
	hospital: "Hospital",
	admin: "Admin",
};

interface SidebarLayoutProps {
	role: Role;
	userName?: string;
	children: React.ReactNode;
}

export function SidebarLayout({
	role,
	userName,
	children,
}: SidebarLayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar role={role} userName={userName} />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-2 border-b">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 h-4"
						/>
						<h1 className="text-sm font-medium">
							{SECTION_LABELS[role]}
						</h1>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

function AppSidebar({ role, userName }: { role: Role; userName?: string }) {
	const pathname = usePathname();
	const alertCount = useAlertCount();

	const items = NAV_ITEMS[role].map((item) => {
		const isActive =
			pathname === item.url || pathname.startsWith(item.url + "/");
		const badge =
			role === "donor" && item.title === "Dashboard" && alertCount > 0
				? alertCount
				: undefined;
		return { ...item, isActive, badge };
	});
	const label = SECTION_LABELS[role];

	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Droplet
										className="size-4"
										fill="currentColor"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										BioMatch
									</span>
									<span className="truncate text-xs">
										Blood Management
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain label={`${label} Menu`} items={items} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: userName ?? "BioMatch User",
						email: role,
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
