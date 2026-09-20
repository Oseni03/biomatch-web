"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Bell,
	Users,
	History,
	Activity,
	CheckCircle2,
	Send,
} from "lucide-react";
import {
	useAlertsAwaitingConfirmation,
	usePendingEmergencyRequests,
} from "@/hooks/use-emergency-requests";
import { StatCard } from "@/components/dashboard/stat-card";

const TABS = [
	{ href: "/hospital", label: "Active Match Broadcasts", icon: Bell },
	{ href: "/hospital/history", label: "Request History", icon: History },
];

interface HospitalDashboardShellProps {
	organizationId: string;
	children: React.ReactNode;
}

export function HospitalDashboardShell({
	organizationId,
	children,
}: HospitalDashboardShellProps) {
	const pathname = usePathname();
	const { data: pendingData } = usePendingEmergencyRequests(organizationId, {
		page: 1,
		pageSize: 10,
	});
	const { data: awaitingConfirmation } =
		useAlertsAwaitingConfirmation(organizationId);

	const pendingServerReqs = pendingData?.requests ?? [];
	const activeCount = pendingData?.total ?? pendingServerReqs.length;
	const respondingCount = pendingServerReqs.reduce(
		(sum, r) =>
			sum +
			r.aggregates.accepted +
			r.aggregates.en_route +
			r.aggregates.arrived +
			r.aggregates.completed,
		0,
	);
	const notifiedCount = pendingServerReqs.reduce(
		(sum, r) => sum + r.alerts.length,
		0,
	);
	const awaitingCount = awaitingConfirmation?.length ?? 0;

	return (
		<div className="space-y-8 text-left">
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					icon={Activity}
					label="Active Requests"
					value={String(activeCount)}
					tone={activeCount > 0 ? "warning" : "default"}
				/>
				<StatCard
					icon={Users}
					label="Donors Responding"
					value={String(respondingCount)}
					tone={respondingCount > 0 ? "warning" : "default"}
				/>
				<StatCard
					icon={Send}
					label="Donors Notified"
					value={String(notifiedCount)}
				/>
				<StatCard
					icon={CheckCircle2}
					label="Awaiting Confirmation"
					value={String(awaitingCount)}
					tone={awaitingCount > 0 ? "warning" : "default"}
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
