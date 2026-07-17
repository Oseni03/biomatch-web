"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
	MapPin,
	Mail,
	Search,
	SlidersHorizontal,
	AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CRITICAL_THRESHOLD } from "@/lib/constants";
import { containerVariants, cardVariants } from "@/lib/animations";

const BLOOD_GROUPS = [
	"O+",
	"O-",
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
] as const;

interface HospitalBank {
	id: string;
	hospitalName: string;
	location: string;
	inventory: Record<string, number>;
	managedBy: { id: string; name: string; email: string } | null;
}

interface BloodSearchCardsProps {
	banks: HospitalBank[];
}

export function BloodSearchCards({ banks }: BloodSearchCardsProps) {
	const [selectedGroup, setSelectedGroup] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [showAvailableOnly, setShowAvailableOnly] = useState(false);

	const filteredBanks = useMemo(() => {
		return banks.filter((bank) => {
			const inventory = bank.inventory ?? {};
			const matchesGroup =
				selectedGroup === "all" || (inventory[selectedGroup] ?? 0) > 0;

			if (showAvailableOnly && selectedGroup !== "all") {
				if ((inventory[selectedGroup] ?? 0) === 0) return false;
			}

			const q = searchQuery.toLowerCase();
			const matchesSearch =
				!q ||
				bank.hospitalName.toLowerCase().includes(q) ||
				bank.location.toLowerCase().includes(q);

			return matchesGroup && matchesSearch;
		});
	}, [banks, selectedGroup, searchQuery, showAvailableOnly]);

	const hasActiveFilters =
		selectedGroup !== "all" || searchQuery.length > 0 || showAvailableOnly;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search hospitals or locations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
					<select
						value={selectedGroup}
						onChange={(e) => setSelectedGroup(e.target.value)}
						className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
					>
						<option value="all">All Blood Types</option>
						{BLOOD_GROUPS.map((g) => (
							<option key={g} value={g}>
								{g}
							</option>
						))}
					</select>
					<label
						className={`flex cursor-pointer items-center gap-2 text-sm ${
							selectedGroup === "all"
								? "text-muted-foreground/50"
								: "text-muted-foreground"
						}`}
					>
						<input
							type="checkbox"
							checked={showAvailableOnly}
							disabled={selectedGroup === "all"}
							onChange={(e) =>
								setShowAvailableOnly(e.target.checked)
							}
							className="h-4 w-4 rounded border-border text-brand focus:ring-brand disabled:opacity-40"
						/>
						Available only
					</label>
				</div>
			</div>

			{filteredBanks.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center"
				>
					<Search className="mb-3 h-8 w-8 text-muted-foreground" />
					<h3 className="text-base font-semibold text-foreground">
						{hasActiveFilters
							? "No matching hospitals"
							: "No hospitals registered"}
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						{hasActiveFilters
							? "Try adjusting your search or filters"
							: "Partner hospitals will appear here once they register"}
					</p>
					{hasActiveFilters && (
						<Button
							variant="outline"
							size="sm"
							className="mt-4"
							onClick={() => {
								setSelectedGroup("all");
								setSearchQuery("");
								setShowAvailableOnly(false);
							}}
						>
							Clear filters
						</Button>
					)}
				</motion.div>
			) : (
				<motion.div
					className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					{filteredBanks.map((bank) => (
						<BloodBankCard key={bank.id} bank={bank} />
					))}
				</motion.div>
			)}
		</div>
	);
}

function BloodBankCard({ bank }: { bank: HospitalBank }) {
	const inventory = bank.inventory ?? {};
	const hasCritical = BLOOD_GROUPS.some(
		(g) =>
			(inventory[g] ?? 0) > 0 && (inventory[g] ?? 0) < CRITICAL_THRESHOLD,
	);

	return (
		<motion.div variants={cardVariants}>
			<Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-card-hover">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-base font-bold text-foreground">
							{bank.hospitalName}
						</h3>
						<p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
							<MapPin className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">{bank.location}</span>
						</p>
					</div>
					{hasCritical && (
						<Badge
							variant="destructive"
							className="shrink-0 gap-1 px-2 py-0.5 text-[10px]"
						>
							<AlertTriangle className="h-3 w-3" />
							Low Stock
						</Badge>
					)}
				</div>

				<div className="mt-4 grid grid-cols-4 gap-1.5">
					{BLOOD_GROUPS.map((group) => {
						const units = inventory[group] ?? 0;
						const isCritical =
							units > 0 && units < CRITICAL_THRESHOLD;
						return (
							<div
								key={group}
								className={cn(
									"flex flex-col items-center rounded-lg border p-2 transition-colors",
									units === 0 &&
										"border-border bg-muted/30 opacity-50",
									isCritical &&
										"border-brand/30 bg-brand-light",
									units > 0 &&
										!isCritical &&
										"border-border bg-card",
								)}
							>
								<span className="text-[11px] font-semibold text-foreground">
									{group}
								</span>
								<span
									className={cn(
										"mt-0.5 text-sm font-bold",
										units === 0 && "text-muted-foreground",
										isCritical && "text-brand",
										units > 0 &&
											!isCritical &&
											"text-foreground",
									)}
								>
									{units}
								</span>
							</div>
						);
					})}
				</div>

				{bank.managedBy && (
					<div className="mt-4 space-y-1 text-xs text-muted-foreground">
						<p className="inline-flex items-center gap-1">
							<Mail className="h-3 w-3 shrink-0" />
							<span className="truncate">
								{bank.managedBy.email}
							</span>
						</p>
					</div>
				)}

				<div className="mt-auto pt-4">
					<Button
						variant="outline"
						size="sm"
						className="w-full text-xs"
						onClick={() => {
							const contact = bank.managedBy?.email ?? "";
							const subject = encodeURIComponent(
								`Blood Reserve Request - ${bank.hospitalName}`,
							);
							window.open(`mailto:${contact}?subject=${subject}`);
						}}
					>
						<Mail className="mr-1.5 h-3.5 w-3.5" />
						Reserve
					</Button>
				</div>
			</Card>
		</motion.div>
	);
}
