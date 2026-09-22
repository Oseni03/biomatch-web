import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Building2, Users } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { getHospitalDetail } from "@/servers/admin";
import { HospitalReviewActions } from "./review-actions";

function statusTone(status: string): "info" | "ok" | "low" | "critical" {
	switch (status) {
		case "pending":
			return "info";
		case "approved":
			return "ok";
		case "rejected":
			return "critical";
		case "suspended":
			return "low";
		default:
			return "info";
	}
}

export default async function AdminHospitalDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const { id } = await params;
	const detail = await getHospitalDetail(session.user.id, id).catch(() => null);
	if (!detail) {
		notFound();
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title={detail.name}
				subtitle={`${detail.officialEmail} · ${detail.state}${detail.lga ? ` · ${detail.lga}` : ""}`}
				action={
					<StatusTag status={statusTone(detail.verificationStatus)}>
						{detail.verificationStatus}
					</StatusTag>
				}
			/>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-2xl border border-border bg-card p-6">
					<h2 className="text-base font-bold text-foreground">Registration details</h2>
					<dl className="mt-3 space-y-2 text-sm">
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Registration number</dt>
							<dd className="font-semibold text-foreground">{detail.registrationNumber ?? "—"}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Phone</dt>
							<dd className="font-semibold text-foreground">{detail.phone ?? "—"}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Address</dt>
							<dd className="text-right font-semibold text-foreground">{detail.address}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Screening partner</dt>
							<dd className="font-semibold text-foreground">
								{detail.isScreeningPartner ? "Yes" : "No"}
							</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Blood requests</dt>
							<dd className="font-semibold text-foreground">{detail.requestCount}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Donations</dt>
							<dd className="font-semibold text-foreground">{detail.donationCount}</dd>
						</div>
					</dl>
				</div>

				<HospitalReviewActions
					organizationId={detail.id}
					verificationStatus={detail.verificationStatus}
				/>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
					<Users className="h-4 w-4" /> Team members ({detail.members.length})
				</h2>
				{detail.members.length === 0 ? (
					<p className="mt-2 text-sm text-muted-foreground">
						This hospital has no team members yet.
					</p>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{detail.members.map((member) => (
							<li key={member.userId} className="flex items-center justify-between gap-3 py-2">
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
									<p className="truncate text-xs text-muted-foreground">{member.email}</p>
								</div>
								<span className="text-xs font-semibold text-muted-foreground">{member.role}</span>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
					<Building2 className="h-4 w-4" /> Application history
				</h2>
				<ul className="mt-3 divide-y divide-border">
					{detail.applications.map((application) => (
						<li key={application.id} className="py-2 text-sm">
							<div className="flex flex-wrap items-center gap-2">
								<StatusTag status={statusTone(application.decision)}>
									{application.decision}
								</StatusTag>
								<span className="text-xs text-muted-foreground">
									submitted {application.submittedAt.toLocaleDateString()}
									{application.reviewedAt
										? ` · reviewed ${application.reviewedAt.toLocaleDateString()}`
										: ""}
								</span>
							</div>
							{application.rejectionReason && (
								<p className="mt-1 text-xs text-muted-foreground">
									Reason: {application.rejectionReason}
								</p>
							)}
							{application.notes && (
								<p className="mt-1 text-xs text-muted-foreground">Notes: {application.notes}</p>
							)}
						</li>
					))}
				</ul>
			</div>

			<Button asChild variant="outline" className="rounded-xl">
				<Link href="/admin/hospitals">Back to hospitals</Link>
			</Button>
		</div>
	);
}
