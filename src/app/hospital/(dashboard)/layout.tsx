"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Bell,
	Users,
	BarChart,
	UserPlus,
	History,
	Activity,
	CheckCircle2,
	AlertTriangle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePendingEmergencyRequests } from "@/hooks/use-emergency-requests";
import { StatCard } from "@/components/dashboard/stat-card";

const TABS = [
	{ href: "/hospital", label: "Active Match Broadcasts", icon: Bell },
	{
		href: "/hospital/directory",
		label: "Proactive Donor Directory",
		icon: Users,
	},
	{ href: "/hospital/analytics", label: "Analytics & Reports", icon: BarChart },
	{ href: "/hospital/history", label: "Request History", icon: History },
	{
		href: "/hospital/staff",
		label: "Hospital Staff Accounts",
		icon: UserPlus,
	},
];

export default function HospitalDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const { data: pendingData } = usePendingEmergencyRequests(
		session?.user?.id,
	);

	const pendingServerReqs = pendingData?.requests ?? [];
	const totalAlerts = pendingData?.total ?? pendingServerReqs.length;
	const activeAlerts = pendingServerReqs.filter(
		(r) => r.status === "pending" || r.status === "matched",
	).length;
	const fulfilledAlerts = pendingServerReqs.filter(
		(r) => r.status === "fulfilled",
	).length;

	return (
		<div className="space-y-8 text-left">
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					icon={Activity}
					label="Total Requests"
					value={String(totalAlerts)}
				/>
				<StatCard
					icon={AlertTriangle}
					label="Active Alerts"
					value={String(activeAlerts)}
					tone={activeAlerts > 0 ? "warning" : "default"}
				/>
				<StatCard
					icon={Users}
					label="Donors Responding"
					value={String(
						pendingServerReqs.reduce(
							(sum, r) => sum + r.alerts.length,
							0,
						),
					)}
				/>
				<StatCard
					icon={CheckCircle2}
					label="Fulfilled"
					value={String(fulfilledAlerts)}
				/>
			</div>

			<div className="flex border-b border-border pb-px gap-6 overflow-x-auto">
				{TABS.map((tab) => {
					const Icon = tab.icon;
					const isActive = pathname === tab.href;
					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition cursor-pointer whitespace-nowrap ${
								isActive
									? "border-brand text-brand font-bold"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							<Icon className="h-4.5 w-4.5" />
							{tab.label}
						</Link>
					);
				})}
			</div>

			{children}
		</div>
	);
}
