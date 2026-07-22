"use client";

import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { BarChart as BarChartIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBloodGroupUsage } from "@/hooks/use-blood-group-usage";
import { formatBloodGroup } from "@/lib/blood-compatibility";
import { cn } from "@/lib/utils";

export function BloodUsageChart() {
	const { data, isLoading } = useBloodGroupUsage();
	const [selected, setSelected] = useState<string | null>(null);

	const rows = (data ?? []).map((r) => ({
		...r,
		label: formatBloodGroup(r.bloodGroup),
	}));
	const hasUsage = rows.some((r) => r.currentMonthUsage > 0);
	const selectedRow = rows.find((r) => r.bloodGroup === selected) ?? null;

	return (
		<Card className="bg-card border-border rounded-xl p-6 transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<BarChartIcon className="h-5 w-5 text-brand" />
					ABO Usage This Month
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Units drawn down by blood group. Click a bar for its trend.
				</CardDescription>
			</CardHeader>

			{isLoading ? (
				<div className="h-64 animate-pulse rounded bg-muted" />
			) : !hasUsage ? (
				<div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
					No inventory usage recorded yet
				</div>
			) : (
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={rows}
							margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
							barCategoryGap="24%"
						>
							<CartesianGrid
								vertical={false}
								stroke="hsl(var(--border))"
							/>
							<XAxis
								dataKey="label"
								tickLine={false}
								axisLine={false}
								tick={{
									fill: "hsl(var(--muted-foreground))",
									fontSize: 11,
									fontFamily: "var(--font-mono)",
								}}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								allowDecimals={false}
								width={28}
								tick={{
									fill: "hsl(var(--muted-foreground))",
									fontSize: 11,
									fontFamily: "var(--font-mono)",
								}}
							/>
							<Tooltip
								cursor={{ fill: "hsl(var(--muted))" }}
								contentStyle={{
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12,
								}}
								labelStyle={{ color: "hsl(var(--foreground))" }}
								formatter={(value) => [`${value} units`, "Drawn down"]}
							/>
							<Bar
								dataKey="currentMonthUsage"
								radius={[4, 4, 0, 0]}
								cursor="pointer"
								onClick={(entry) => {
									const bloodGroup = (
										entry as unknown as { bloodGroup: string }
									).bloodGroup;
									setSelected((prev) =>
										prev === bloodGroup ? null : bloodGroup,
									);
								}}
							>
								{rows.map((row) => (
									<Cell
										key={row.bloodGroup}
										fill="hsl(var(--red))"
										opacity={
											selected && selected !== row.bloodGroup
												? 0.4
												: 1
										}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
			)}

			{selectedRow && <TrendPanel row={selectedRow} />}
		</Card>
	);
}

function TrendPanel({
	row,
}: {
	row: { label: string; currentMonthUsage: number; previousMonthUsage: number };
}) {
	const delta = row.currentMonthUsage - row.previousMonthUsage;
	const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
	const pct =
		row.previousMonthUsage > 0
			? Math.round((Math.abs(delta) / row.previousMonthUsage) * 100)
			: null;

	const Icon =
		direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
	const toneClass =
		direction === "up"
			? "text-status-critical"
			: direction === "down"
				? "text-status-ok"
				: "text-muted-foreground";

	return (
		<div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
			<Icon className={cn("h-4 w-4 shrink-0", toneClass)} />
			<div className="text-xs">
				<span className="font-semibold text-foreground">{row.label}</span>{" "}
				<span className="text-muted-foreground">
					usage is{" "}
					{direction === "flat" ? (
						"unchanged"
					) : (
						<span className={cn("font-semibold", toneClass)}>
							trending {direction}
							{pct !== null ? ` ${pct}%` : ""}
						</span>
					)}{" "}
					vs last month ({row.previousMonthUsage} units)
				</span>
			</div>
		</div>
	);
}
