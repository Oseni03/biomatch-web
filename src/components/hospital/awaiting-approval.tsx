import Link from "next/link";
import { Building2, Clock, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { cn } from "@/lib/utils";

const COPY: Record<string, { title: string; body: string; next: string[] }> = {
	pending: {
		title: "Awaiting approval",
		body: "Your registration is under review. You can sign in and manage your workspace profile, but emergency dispatch stays disabled until BioMatch verifies your facility.",
		next: [
			"Our team confirms your registration number and official email",
			"Approval unlocks emergency requests and donor matching",
			"Most reviews complete within 2 business days",
		],
	},
	rejected: {
		title: "Application not approved",
		body: "This hospital application was not approved, so emergency dispatch is disabled on this workspace. Your details were kept for the reapply review.",
		next: [
			"Check that your registration number and official email are correct",
			"A reapply flow will be available here soon",
			"Contact support if you believe this is a mistake",
		],
	},
	suspended: {
		title: "Account suspended",
		body: "This hospital workspace has been suspended, so emergency dispatch is disabled. Your workspace profile and history are preserved.",
		next: [
			"Contact support to appeal or resolve the suspension",
			"Dispatch stays disabled until the suspension is lifted",
		],
	},
};

export function AwaitingApproval({
	status,
	hospitalName,
}: {
	status: "pending" | "rejected" | "suspended" | "none";
	hospitalName: string;
}) {
	if (status === "none") {
		return (
			<div className="space-y-8">
				<DashboardGreeting
					title="Hospital workspace"
					subtitle="Emergency dispatch and donor matching live here once your facility is registered."
				/>
				<div className="rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-12 text-center">
					<Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-3 text-sm font-semibold text-foreground">
						No hospital registered yet
					</p>
					<p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
						This account is not attached to a hospital workspace.
						Register your facility to start verification.
					</p>
					<Button asChild className="mt-4 rounded-2xl">
						<Link href="/auth/signup?role=hospital">Register your hospital</Link>
					</Button>
				</div>
			</div>
		);
	}

	const copy = COPY[status];
	const Icon = status === "pending" ? Clock : status === "rejected" ? XCircle : ShieldAlert;

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title={hospitalName || "Hospital workspace"}
				subtitle="Verification status for this facility."
				action={
					<StatusTag status={status === "pending" ? "info" : "critical"}>
						<Icon className="h-3.5 w-3.5" />
						{status === "pending" ? "Awaiting approval" : copy.title}
					</StatusTag>
				}
			/>

			<div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
				<div className="flex items-start gap-4">
					<div
						className={cn(
							"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
							status === "pending"
								? "bg-status-info-bg text-status-info"
								: "bg-status-critical-bg text-status-critical",
						)}
					>
						<Icon className="h-5 w-5" />
					</div>
					<div className="space-y-1">
						<h2 className="text-base font-bold text-foreground">{copy.title}</h2>
						<p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
							{copy.body}
						</p>
					</div>
				</div>

				<div className="mt-6 rounded-xl border border-border bg-muted/50 p-4">
					<p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
						What happens next
					</p>
					<ul className="mt-2 space-y-1.5">
						{copy.next.map((step) => (
							<li
								key={step}
								className="flex items-start gap-2 text-xs leading-relaxed text-foreground"
							>
								<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
								{step}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}
