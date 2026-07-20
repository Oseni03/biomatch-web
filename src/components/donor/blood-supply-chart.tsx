"use client";

import { Activity } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { displayBloodGroup } from "@/lib/donor-types";

const GROUPS = [
	"A_PLUS",
	"A_MINUS",
	"B_PLUS",
	"B_MINUS",
	"AB_PLUS",
	"AB_MINUS",
	"O_PLUS",
	"O_MINUS",
] as const;

const DISPLAY_DATA = [
	{ blood: "O+", key: "O_PLUS" },
	{ blood: "O-", key: "O_MINUS" },
	{ blood: "A+", key: "A_PLUS" },
	{ blood: "A-", key: "A_MINUS" },
	{ blood: "B+", key: "B_PLUS" },
	{ blood: "B-", key: "B_MINUS" },
	{ blood: "AB+", key: "AB_PLUS" },
	{ blood: "AB-", key: "AB_MINUS" },
];

interface BloodSupplyChartProps {
	banks?: { inventory: unknown }[];
	bloodType: string;
}

export function BloodSupplyChart({ banks, bloodType }: BloodSupplyChartProps) {
	const totals: Record<string, number> = {};
	for (const g of GROUPS) {
		totals[g] = 0;
	}
	for (const bank of banks ?? []) {
		const inv = bank.inventory as Record<string, number> | null;
		for (const g of GROUPS) {
			totals[g] += inv?.[g] ?? 0;
		}
	}
	const maxTotal = Math.max(...Object.values(totals), 1);

	return (
		<Card className="bg-card border-border rounded-xl p-6 shadow-sm transition-shadow hover:shadow-card-hover">
			<CardHeader className="p-0 pb-4 border-b border-border mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<Activity className="h-5 w-5 text-brand" />
					Lagos Blood Supply and Demand Trends
				</CardTitle>
				<CardDescription className="text-xs text-muted-foreground">
					Monthly active emergency requests count by blood group in
					your area
				</CardDescription>
			</CardHeader>

			<CardContent className="p-0">
				<div className="space-y-4 pt-2">
					{DISPLAY_DATA.map((item) => {
						const units = totals[item.key] ?? 0;
						const pct = Math.round((units / maxTotal) * 100);
						const isLow = units < 5;
						const isMedium = units >= 5 && units < 15;
						const barColor = isLow
							? "bg-brand"
							: isMedium
								? "bg-orange-500"
								: "bg-brand";
						const statusLabel = isLow
							? "Critical Shortage"
							: isMedium
								? "High Demand"
								: "Stable";
						const isUsers =
							displayBloodGroup(item.key) === bloodType;

						return (
							<div key={item.key} className="space-y-1 text-left">
								<div className="flex justify-between items-center text-xs">
									<div className="flex items-center gap-2">
										<span
											className={`w-8 font-bold font-mono ${isUsers ? "text-brand" : "text-foreground"}`}
										>
											{item.blood}
										</span>
										<span className="text-[10px] px-2 py-0.5 rounded bg-muted font-mono text-muted-foreground">
											{statusLabel}
										</span>
									</div>
									<span className="font-mono text-gray-500">
										{units} units
									</span>
								</div>

								<div className="w-full h-2.5 bg-muted rounded-full border-border overflow-hidden">
									<div
										className={`h-full ${barColor} rounded-full transition-all duration-1000`}
										style={{
											width: `${Math.max(2, pct)}%`,
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
