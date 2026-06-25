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
	{ blood: "B-", key: "B_MINUS" },
	{ blood: "A+", key: "A_PLUS" },
	{ blood: "AB-", key: "AB_MINUS" },
];

interface BloodSupplyChartProps {
  banks?: { inventory: unknown }[]
  bloodType: string
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
		<Card className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
			<CardHeader className="p-0 pb-4 border-b border-gray-50 dark:border-zinc-800/60 mb-6">
				<CardTitle className="text-base font-bold flex items-center gap-2">
					<Activity className="h-5 w-5 text-red-600" />
					Lagos Blood Supply and Demand Trends
				</CardTitle>
				<CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
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
							? "bg-red-600"
							: isMedium
								? "bg-orange-500"
								: "bg-red-600";
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
											className={`w-8 font-bold font-mono ${isUsers ? "text-red-600" : "text-gray-900 dark:text-white"}`}
										>
											{item.blood}
										</span>
										<span className="text-[10px] px-2 py-0.5 rounded bg-gray-50 dark:bg-zinc-950 font-mono text-gray-400">
											{statusLabel}
										</span>
									</div>
									<span className="font-mono text-gray-500">
										{units} units
									</span>
								</div>

								<div className="w-full h-2.5 bg-gray-50 dark:bg-zinc-950 rounded-full border border-gray-100 dark:border-zinc-850 overflow-hidden">
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
