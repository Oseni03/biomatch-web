import { ShieldCheck, ShieldAlert, Clock, ShieldX } from "lucide-react";
import { StatusTag } from "@/components/brand/status-tag";
import type { VerificationStatus } from "@/servers/screening";

const CONTENT: Record<
	VerificationStatus,
	{
		icon: typeof ShieldCheck;
		title: string;
		body: string;
		tagStatus: "ok" | "low" | "critical" | "info";
		tagLabel: string;
	}
> = {
	verified: {
		icon: ShieldCheck,
		title: "You're a verified donor",
		body: "You're eligible to receive emergency donation requests from hospitals.",
		tagStatus: "ok",
		tagLabel: "Verified",
	},
	unverified: {
		icon: ShieldAlert,
		title: "Get screened to start receiving requests",
		body: "Visit a partner hospital for a walk-in blood screening. Once staff record your result, you'll be eligible for emergency donation requests.",
		tagStatus: "low",
		tagLabel: "Unverified",
	},
	pending: {
		icon: Clock,
		title: "Your screening is in progress",
		body: "A partner hospital has recorded your screening and you'll be notified by email once your result is ready.",
		tagStatus: "info",
		tagLabel: "Pending",
	},
	failed: {
		icon: ShieldX,
		title: "You're not currently cleared to donate",
		body: "Visit a partner hospital again for a follow-up screening at any time — a new screening can update your status.",
		tagStatus: "critical",
		tagLabel: "Not Cleared",
	},
};

export function VerificationStatusBanner({
	status,
}: {
	status: VerificationStatus;
}) {
	const { icon: Icon, title, body, tagStatus, tagLabel } = CONTENT[status];

	return (
		<div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
			<Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
			<div className="flex-1">
				<div className="flex items-center gap-2 flex-wrap">
					<p className="text-sm font-semibold text-foreground">
						{title}
					</p>
					<StatusTag status={tagStatus}>{tagLabel}</StatusTag>
				</div>
				<p className="text-xs text-muted-foreground mt-0.5">{body}</p>
			</div>
		</div>
	);
}
