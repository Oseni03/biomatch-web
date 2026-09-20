import { redirect } from "next/navigation";
import { Bell, CheckCircle2, MapPin, Send, ShieldCheck } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getPendingEmergencyRequestsForOrganization } from "@/servers/emergency";
import { displayBloodGroup } from "@/lib/donor-types";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";

interface DispatchItem {
	id: string;
	at: Date;
	title: string;
	body: string;
	tone: "urgent" | "ok" | "info";
}

const TONE_STYLES: Record<DispatchItem["tone"], string> = {
	urgent: "border-brand/30",
	ok: "border-border",
	info: "border-border",
};

export default async function HospitalNotificationsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const organizationId = await getActiveOrganizationId(session.user.id);
	const { requests } = await getPendingEmergencyRequestsForOrganization(
		organizationId,
		{ page: 1, pageSize: 20 },
	);

	const items: DispatchItem[] = [];
	for (const req of requests) {
		items.push({
			id: `broadcast-${req.id}`,
			at: new Date(req.createdAt),
			title: `Emergency broadcast dispatched — ${displayBloodGroup(req.bloodGroup)} × ${req.unitsNeeded}`,
			body: `${req.alerts.length} screened donor${req.alerts.length !== 1 ? "s" : ""} notified within ${req.searchRadius ?? "—"}km.`,
			tone: req.urgencyLevel === "critical" ? "urgent" : "info",
		});
		for (const alert of req.alerts) {
			if (alert.status === "alerted" || alert.status === "declined") continue;
			const label =
				alert.status === "accepted"
					? "accepted the emergency call"
					: alert.status === "en_route"
						? "is en route to the hospital"
						: alert.status === "arrived"
							? "has arrived at the hospital"
							: "completed the donation";
			items.push({
				id: `alert-${alert.id}`,
				at: new Date(alert.updatedAt),
				title: `${alert.donor.name ?? "A verified donor"} ${label}`,
				body: `${displayBloodGroup(req.bloodGroup)} request of ${req.unitsNeeded} unit${req.unitsNeeded !== 1 ? "s" : ""}.`,
				tone: "ok",
			});
		}
	}
	items.sort((a, b) => b.at.getTime() - a.at.getTime());
	const visible = items.slice(0, 30);

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Hospital Dispatch Notifications"
				subtitle="Live emergency alerts, donor acceptances, and coordination updates."
			/>

			{visible.length === 0 ? (
				<div className="bg-card border-border rounded-2xl p-10 text-center text-xs text-muted-foreground">
					<Bell className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-60" />
					<p className="text-sm font-medium text-foreground">
						No dispatch activity yet.
					</p>
					<p className="mt-1">
						Create an emergency request to start notifying screened donors.
					</p>
				</div>
			) : (
				<div className="space-y-3 text-xs">
					{visible.map((item) => (
						<div
							key={item.id}
							className={`p-4 rounded-2xl bg-card border ${TONE_STYLES[item.tone]} space-y-1.5`}
						>
							<div className="flex items-center justify-between gap-2">
								<span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
									{item.tone === "urgent" ? (
										<span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
									) : item.tone === "ok" ? (
										<CheckCircle2 className="h-3.5 w-3.5 text-status-ok" />
									) : (
										<Send className="h-3.5 w-3.5 text-status-info" />
									)}
									{item.title}
								</span>
								<span className="text-[11px] text-muted-foreground shrink-0">
									{item.at.toLocaleString()}
								</span>
							</div>
							<p className="text-muted-foreground">{item.body}</p>
						</div>
					))}
				</div>
			)}

			<div className="p-4 rounded-2xl bg-card border border-border space-y-1.5 text-xs">
				<div className="flex items-center justify-between">
					<span className="inline-flex items-center gap-1.5 font-semibold text-status-info">
						<ShieldCheck className="h-3.5 w-3.5" />
						System channel check
					</span>
					<span className="text-[11px] text-muted-foreground flex items-center gap-1">
						<MapPin className="h-3 w-3" />
						Email dispatch via Resend
					</span>
				</div>
				<p className="text-muted-foreground">
					Donor alerts are delivered by email. Push/SMS channels are pending
					provider selection.
				</p>
			</div>
		</div>
	);
}
