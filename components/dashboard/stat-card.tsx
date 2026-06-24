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
		<div className="rounded-xl border border-gray-200 bg-white p-5">
			<div className="flex items-center gap-2 text-gray-400">
				<Icon className="h-4 w-4" />
				<span className="text-xs font-medium">{label}</span>
			</div>
			<p
				className={`mt-2 text-2xl font-bold ${tone === "warning" ? "text-amber-600" : "text-gray-900"}`}
			>
				{value}
			</p>
		</div>
	);
}
