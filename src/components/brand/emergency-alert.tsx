import * as React from "react";
import { cn } from "@/lib/utils";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";

interface EmergencyAlertProps extends React.HTMLAttributes<HTMLDivElement> {
	bloodGroup: string;
	hospitalName: string;
	distanceKm?: number;
	action?: React.ReactNode;
}

// Bright emergency-red, one-tap-respond alert. Reserved for genuinely urgent
// broadcasts — see the red/white surface rule in the BioMatch design system.
export function EmergencyAlert({
	bloodGroup,
	hospitalName,
	distanceKm,
	action,
	className,
	children,
	...props
}: EmergencyAlertProps) {
	return (
		<div
			className={cn(
				"on-red flex items-center gap-4 rounded-card bg-emergency p-4 text-white shadow-brand",
				className,
			)}
			role="alert"
			{...props}
		>
			<BloodTypeBadge
				bloodGroup={bloodGroup}
				variant="onRed"
				className="shrink-0"
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold">{hospitalName}</p>
				{distanceKm !== undefined && (
					<p className="text-xs text-white/80">{distanceKm} km away</p>
				)}
				{children}
			</div>
			{action}
		</div>
	);
}
