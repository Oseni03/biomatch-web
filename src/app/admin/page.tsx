import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, Building2, Clock, Droplets, HeartHandshake, ShieldCheck } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { getAdminOverviewCounts } from "@/servers/admin";
import { DeliveryFailuresCard } from "@/components/admin/delivery-failures-card";

export default async function AdminOverviewPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const counts = await getAdminOverviewCounts(session.user.id);

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Platform overview"
				subtitle="Hospitals awaiting review, verified partners and registered donors."
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<StatCard
					label="Pending applications"
					value={String(counts.pendingApplications)}
					icon={Clock}
					tone={counts.pendingApplications > 0 ? "warning" : "default"}
				/>
				<StatCard
					label="Approved hospitals"
					value={String(counts.approvedHospitals)}
					icon={ShieldCheck}
				/>
				<StatCard
					label="Total hospitals"
					value={String(counts.totalHospitals)}
					icon={Building2}
				/>
				<StatCard
					label="Registered donors"
					value={String(counts.totalDonors)}
					icon={HeartHandshake}
				/>
				<StatCard
					label="Active requests"
					value={String(counts.activeRequests)}
					icon={Activity}
					tone={counts.activeRequests > 0 ? "warning" : "default"}
				/>
				<StatCard
					label="Completed donations"
					value={String(counts.completedDonations)}
					icon={Droplets}
				/>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Hospital management</h2>
				{counts.pendingApplications > 0 ? (
					<p className="mt-1 text-sm text-muted-foreground">
						{counts.pendingApplications} hospital{" "}
						{counts.pendingApplications === 1 ? "application is" : "applications are"}{" "}
						waiting for review.
					</p>
				) : counts.totalHospitals > 0 ? (
					<p className="mt-1 text-sm text-muted-foreground">
						The review queue is clear. All registered hospitals have been reviewed.
					</p>
				) : (
					<p className="mt-1 text-sm text-muted-foreground">
						No hospitals have registered yet. New registrations will appear in
						the review queue automatically.
					</p>
				)}
				<Button asChild className="mt-4 rounded-2xl">
					<Link href="/admin/hospitals">Open hospital management</Link>
				</Button>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Emergency activity</h2>
				{counts.activeRequests > 0 ? (
					<p className="mt-1 text-sm text-muted-foreground">
						{counts.activeRequests} emergency request{counts.activeRequests === 1 ? " is" : "s are"} live
						right now.
						{counts.completedDonations > 0 &&
							` ${counts.completedDonations} donation${counts.completedDonations === 1 ? " has" : "s have"} been completed so far.`}
					</p>
				) : counts.completedDonations > 0 ? (
					<p className="mt-1 text-sm text-muted-foreground">
						No emergency requests are live right now. {counts.completedDonations} donation
						{counts.completedDonations === 1 ? " has" : "s have"} been completed so far.
					</p>
				) : (
					<p className="mt-1 text-sm text-muted-foreground">
						No emergency activity yet. Live requests and completed donations will
						appear here once hospitals start requesting blood.
					</p>
				)}
			</div>

			<DeliveryFailuresCard />
		</div>
	);
}
