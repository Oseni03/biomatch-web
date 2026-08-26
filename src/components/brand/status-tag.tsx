import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusTagVariants = cva(
	"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
	{
		variants: {
			status: {
				critical: "bg-status-critical-bg text-status-critical border-status-critical/20",
				low: "bg-status-low-bg text-status-low border-status-low/20",
				ok: "bg-status-ok-bg text-status-ok border-status-ok/20",
				info: "bg-status-info-bg text-status-info border-status-info/20",
			},
		},
		defaultVariants: {
			status: "info",
		},
	},
);

const dotVariants = cva("size-1.5 shrink-0 rounded-full bg-current", {
	variants: {
		pulse: {
			true: "animate-pulse",
			false: "",
		},
	},
	defaultVariants: {
		pulse: false,
	},
});

interface StatusTagProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof statusTagVariants> {
	pulse?: boolean;
}

// Urgency/status label with a leading dot — inventory levels, alert severity.
export function StatusTag({
	status,
	pulse = false,
	className,
	children,
	...props
}: StatusTagProps) {
	return (
		<span className={cn(statusTagVariants({ status }), className)} {...props}>
			<span className={cn(dotVariants({ pulse }))} />
			{children}
		</span>
	);
}
