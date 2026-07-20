import { cn } from "@/lib/utils";
import { formatBloodGroup } from "@/lib/blood-compatibility";
import { CRITICAL_THRESHOLD } from "@/lib/constants";

interface InventoryGaugeProps {
	bloodGroup: string;
	units: number;
	capacity: number;
	lowThreshold?: number;
	className?: string;
}

function levelFor(units: number, lowThreshold: number) {
	if (units <= CRITICAL_THRESHOLD) return "critical" as const;
	if (units <= lowThreshold) return "low" as const;
	return "ok" as const;
}

const barClasses = {
	critical: "bg-status-critical",
	low: "bg-status-low",
	ok: "bg-status-ok",
} as const;

const labelClasses = {
	critical: "text-status-critical",
	low: "text-status-low",
	ok: "text-status-ok",
} as const;

// Stock level per blood type, colored by urgency (critical / low / ok).
export function InventoryGauge({
	bloodGroup,
	units,
	capacity,
	lowThreshold = CRITICAL_THRESHOLD * 2,
	className,
}: InventoryGaugeProps) {
	const level = levelFor(units, lowThreshold);
	const pct = capacity > 0 ? Math.min(100, (units / capacity) * 100) : 0;

	return (
		<div className={cn("space-y-1.5", className)}>
			<div className="flex items-baseline justify-between text-sm">
				<span className="font-mono font-bold">
					{formatBloodGroup(bloodGroup)}
				</span>
				<span className={cn("num font-semibold", labelClasses[level])}>
					{units} <span className="text-muted-foreground font-normal">units</span>
				</span>
			</div>
			<div
				className="h-2 w-full overflow-hidden rounded-full bg-muted"
				role="progressbar"
				aria-valuenow={units}
				aria-valuemin={0}
				aria-valuemax={capacity}
				aria-label={`${formatBloodGroup(bloodGroup)} inventory level`}
			>
				<div
					className={cn(
						"h-full rounded-full transition-all",
						barClasses[level],
					)}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}
