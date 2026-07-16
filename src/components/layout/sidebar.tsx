"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
	Bell,
	ClipboardPlus,
	Building2,
	Droplet,
	HeartPulse,
	LayoutDashboard,
	Search,
	AlertTriangle,
	Wallet,
	type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAlertCount } from "@/lib/alert-context";
import { cn } from "@/lib/utils";

type Role = "donor" | "hospital";

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
};

const SECTION_LABELS: Record<Role, string> = {
	donor: "Donor",
	hospital: "Hospital",
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
				<header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 h-4"
						/>
						<h1 className="text-sm font-medium">
							{SECTION_LABELS[role]}
						</h1>
					</div>
					<div className="ml-auto flex items-center gap-1.5">
						<TopBarActions role={role} />
						<Separator
							orientation="vertical"
							className="mx-1 h-5"
						/>
						<NavUser
							user={{
								name: userName ?? "BioMatch User",
								email: role,
							}}
							variant="topbar"
						/>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

function BadgeCount({
	count,
	className,
}: {
	count: number;
	className?: string;
}) {
	if (count <= 0) return null;
	return (
		<span
			className={cn(
				"absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white leading-none",
				className,
			)}
		>
			{count > 9 ? "9+" : count}
		</span>
	);
}

function TopBarActions({ role }: { role: Role }) {
	const alertCount = useAlertCount();

	return (
		<>
			{role === "hospital" && (
				<Button
					variant="ghost"
					size="icon-sm"
					className={cn(
						"relative text-destructive hover:text-destructive hover:bg-destructive/10",
						alertCount > 0 && "animate-pulse",
					)}
					asChild
				>
					<Link href="/hospital/emergency">
						<AlertTriangle className="size-4" />
						<span className="sr-only">Emergency Request</span>
					</Link>
				</Button>
			)}
			{role === "donor" && (
				<Button
					variant="ghost"
					size="icon-sm"
					className={cn(
						"relative text-destructive hover:text-destructive hover:bg-destructive/10",
						alertCount > 0 && "animate-pulse",
					)}
					asChild
				>
					<Link href="/donor">
						<AlertTriangle className="size-4" />
						<BadgeCount
							count={alertCount}
							className="bg-destructive"
						/>
						<span className="sr-only">Active Alerts</span>
					</Link>
				</Button>
			)}
			<Button
				variant="ghost"
				size="icon-sm"
				className="relative text-muted-foreground hover:text-foreground"
			>
				<Bell className="size-4" />
				<BadgeCount count={alertCount} className="bg-brand" />
				<span className="sr-only">Notifications</span>
			</Button>
			<ThemeToggle />
		</>
	);
}

function AppSidebar({
	role,
	userName,
}: {
	role: Role;
	userName?: string;
}) {
	const pathname = usePathname();
	const alertCount = useAlertCount();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

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
								<div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-brand text-white">
									<Droplet
										className="size-5"
										fill="currentColor"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold tracking-tight">
										BioMatch
									</span>
									<span className="truncate text-[11px] text-muted-foreground">
										Blood Management
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{!mounted ? (
					<div className="flex flex-col gap-1 p-2">
						{[...Array(3)].map((_, i) => (
							<SidebarMenuSkeleton key={i} showIcon />
						))}
					</div>
				) : (
					<NavMain label={`${label} Menu`} items={items} />
				)}
			</SidebarContent>
		</Sidebar>
	);
}
