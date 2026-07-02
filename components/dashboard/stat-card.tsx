import type { LucideIcon } from "lucide-react";

interface StatCardProps {
	icon: LucideIcon;
	label: string;
	value: string;
	tone?: "default" | "warning";
}

export function StatCard({
	icon: Icon,
	label,
	value,
	tone = "default",
}: StatCardProps) {
	return (
		<div className="rounded-xl border border-border bg-card p-5">
			<div className="flex items-center gap-2 text-muted-foreground">
				<Icon className="h-4 w-4" />
				<span className="text-xs font-medium">{label}</span>
			</div>
			<p
				className={`mt-2 text-2xl font-bold ${tone === "warning" ? "text-amber-600" : "text-foreground"}`}
			>
				{value}
			</p>
		</div>
	);
}
