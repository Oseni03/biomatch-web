"use client";

import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import type { EligibilityResult } from "@/lib/eligibility";
import type { DonorStatus } from "@/lib/donor-types";
import { cn } from "@/lib/utils";
import { EmergencyRequestCard } from "@/components/donor/urgent-request-card";

export type CardHandlers = Omit<
	ComponentProps<typeof EmergencyRequestCard>,
	"eligibility" | "donorStatus" | "request" | "alertStatus" | "isTracked"
> & {
	eligibility: EligibilityResult;
	donorStatus: DonorStatus;
};

export function SectionHeading({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
			{children}
		</h2>
	);
}

export function EmptyState({
	icon: Icon,
	iconClassName,
	title,
	description,
	action,
}: {
	icon: LucideIcon;
	iconClassName?: string;
	title: string;
	description: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="space-y-2 rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-10">
			<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<Icon className={cn("h-5 w-5", iconClassName)} />
			</div>
			<h3 className="text-base font-bold text-foreground">{title}</h3>
			<p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
				{description}
			</p>
			{action && <div className="pt-3">{action}</div>}
		</div>
	);
}

export function InfoCard({
	icon: Icon,
	iconClassName,
	title,
	meta,
	children,
}: {
	icon: LucideIcon;
	iconClassName?: string;
	title: string;
	meta: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
					<Icon className={cn("h-4 w-4", iconClassName)} />
					{title}
				</h2>
				{meta}
			</div>
			{children}
		</section>
	);
}

export function InfoTile({
	icon: Icon,
	iconClassName,
	label,
	value,
	hint,
}: {
	icon: LucideIcon;
	iconClassName?: string;
	label: string;
	value: React.ReactNode;
	hint: React.ReactNode;
}) {
	return (
		<div className="space-y-1 rounded-xl border border-border bg-muted/50 p-3.5">
			<div className="flex items-center gap-1.5 font-medium text-muted-foreground">
				<Icon className={cn("h-3.5 w-3.5", iconClassName)} />
				{label}
			</div>
			<div className="text-base font-bold text-foreground">{value}</div>
			<div className="text-[11px] text-muted-foreground">{hint}</div>
		</div>
	);
}
