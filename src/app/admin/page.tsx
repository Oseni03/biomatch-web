import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Clock, HeartHandshake, ShieldCheck } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { getAdminOverviewCounts } from "@/servers/admin";

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

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
		</div>
	);
}
