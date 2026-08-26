import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardGreetingProps {
	title: string;
	subtitle?: string;
	action?: React.ReactNode;
	className?: string;
}

// Page-level header banner for donor/hospital dashboards — the serif
// "editorial" voice framing an otherwise clinical, data-dense screen.
export function DashboardGreeting({
	title,
	subtitle,
	action,
	className,
}: DashboardGreetingProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-card p-6 shadow-card",
				className,
			)}
		>
			<div>
				<h1 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
					{title}
				</h1>
				{subtitle && (
					<p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
				)}
			</div>
			{action}
		</div>
	);
}
