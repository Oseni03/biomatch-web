"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { displayBloodGroup, BLOOD_GROUP_MAP } from "@/lib/donor-types";

const BLOOD_GROUPS = Object.keys(BLOOD_GROUP_MAP);
const STATUS_OPTIONS = ["fulfilled", "expired", "cancelled"] as const;

const STATUS_LABELS: Record<string, string> = {
	fulfilled: "Fulfilled",
	expired: "Expired",
	cancelled: "Cancelled",
};

interface HistoryFilterBarProps {
	dateFrom: string;
	dateTo: string;
	bloodFilter: string;
	statusFilter: string;
	onDateFromChange: (value: string) => void;
	onDateToChange: (value: string) => void;
	onBloodFilterChange: (value: string) => void;
	onStatusFilterChange: (value: string) => void;
	onApply: () => void;
}

export function HistoryFilterBar({
	dateFrom,
	dateTo,
	bloodFilter,
	statusFilter,
	onDateFromChange,
	onDateToChange,
	onBloodFilterChange,
	onStatusFilterChange,
	onApply,
}: HistoryFilterBarProps) {
	return (
		<div className="bg-card border-border rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-card-hover">
			<div className="flex items-center gap-2 mb-4">
				<Filter className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm font-semibold text-foreground">
					Filters
				</span>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
				<div>
					<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
						From
					</label>
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => onDateFromChange(e.target.value)}
						className="w-full rounded-xl border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<div>
					<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
						To
					</label>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => onDateToChange(e.target.value)}
						className="w-full rounded-xl border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
				<div>
					<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
						Blood Type
					</label>
					<Select value={bloodFilter} onValueChange={onBloodFilterChange}>
						<SelectTrigger>
							<SelectValue placeholder="All Types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">All Types</SelectItem>
							{BLOOD_GROUPS.map((bg) => (
								<SelectItem key={bg} value={bg}>
									{displayBloodGroup(bg)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<label className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block mb-1">
						Status
					</label>
					<Select value={statusFilter} onValueChange={onStatusFilterChange}>
						<SelectTrigger>
							<SelectValue placeholder="All Statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">All Statuses</SelectItem>
							{STATUS_OPTIONS.map((s) => (
								<SelectItem key={s} value={s}>
									{STATUS_LABELS[s] ?? s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-end">
					<Button onClick={onApply} className="w-full">
						Apply Filters
					</Button>
				</div>
			</div>
		</div>
	);
}
