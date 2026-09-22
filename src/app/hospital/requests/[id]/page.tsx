import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Droplet, Phone, User } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getBloodRequestSummary } from "@/servers/requests";
import { getRequestDonorView } from "@/servers/responses";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { StatCard } from "@/components/dashboard/stat-card";
import { ConfirmDonationButton } from "@/components/hospital/confirm-donation-button";
import { Button } from "@/components/ui/button";

function matchTone(status: string): "info" | "ok" | "low" | "critical" {
	switch (status) {
		case "accepted":
		case "completed":
			return "ok";
		case "declined":
		case "filled":
		case "expired":
		case "cancelled":
			return "low";
		default:
			return "info";
	}
}

export default async function HospitalRequestDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const { id } = await params;
	const organizationId = await getActiveOrganizationId(session.user.id).catch(
		() => undefined,
	);
	if (!organizationId) {
		redirect("/hospital");
	}
	const [summary, view] = await Promise.all([
		getBloodRequestSummary(organizationId, session.user.id, id).catch(() => null),
		getRequestDonorView(organizationId, session.user.id, id).catch(() => null),
	]);
	if (!summary || !view) {
		notFound();
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title={`${summary.bloodGroup} request`}
				subtitle={`${summary.locationName} · created ${summary.createdAt.toLocaleDateString()}`}
				action={
					<StatusTag status={summary.status === "active" ? "info" : "ok"}>
						{summary.status}
					</StatusTag>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Units needed" value={String(summary.unitsRequired)} icon={Droplet} />
				<StatCard label="Units accepted" value={String(summary.unitsAccepted)} icon={Droplet} />
				<StatCard label="Donors notified" value={String(summary.notifiedCount)} icon={User} />
				<StatCard
					label="Search radius"
					value={`${Number(summary.currentRadiusKm).toFixed(0)} km`}
					icon={Droplet}
				/>
			</div>

			<section className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">
					Donor view ({view.matches.length})
				</h2>
				{view.matches.length === 0 ? (
					<div className="mt-3 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-8 text-center">
						<User className="mx-auto h-7 w-7 text-muted-foreground" />
						<p className="mt-2 text-sm font-semibold text-foreground">No responses yet</p>
						<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
							Matched donors appear here with their response status. Contact
							details are revealed once a donor accepts.
						</p>
					</div>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{view.matches.map((match) => (
							<li key={match.matchId} className="flex flex-wrap items-center gap-3 py-3">
								<BloodTypeBadge bloodGroup={match.bloodGroup} size="sm" />
								<div className="min-w-0 flex-1">
									{match.donor ? (
										<>
											<p className="truncate text-sm font-semibold text-foreground">
												{match.donor.name}{" "}
												<span className="font-mono text-xs font-normal text-muted-foreground">
													{match.donor.donorCode}
												</span>
											</p>
											<p className="flex items-center gap-1 text-xs text-muted-foreground">
												<Phone className="h-3 w-3" />
												{match.donor.phoneNumber ?? "No phone on file"} ·{" "}
												{match.distanceKm.toFixed(1)} km away
											</p>
										</>
									) : (
										<>
											<p className="text-sm font-semibold text-muted-foreground">
												Waiting donor
											</p>
											<p className="text-xs text-muted-foreground">
												{match.distanceKm.toFixed(1)} km away · contact shown after
												acceptance
											</p>
										</>
									)}
								</div>
								<StatusTag status={matchTone(match.status)}>{match.status}</StatusTag>
								{match.status === "accepted" && (
									<ConfirmDonationButton
										organizationId={organizationId}
										callerId={session.user.id}
										matchId={match.matchId}
									/>
								)}
							</li>
						))}
					</ul>
				)}
			</section>

			<Button asChild variant="outline" className="rounded-xl">
				<Link href="/hospital">Back to dashboard</Link>
			</Button>
		</div>
	);
}
