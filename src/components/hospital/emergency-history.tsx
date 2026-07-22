"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { useEmergencyHistory } from "@/hooks/use-emergency-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { HistoryFilterBar } from "@/components/hospital/history-filter-bar";
import { RequestFunnelCard } from "@/components/hospital/request-funnel-card";

interface EmergencyHistoryProps {
	organizationId: string;
}

export function EmergencyHistory({ organizationId }: EmergencyHistoryProps) {
	const [page, setPage] = useState(1);
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [bloodFilter, setBloodFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const filters = {
		...(dateFrom ? { dateFrom } : {}),
		...(dateTo ? { dateTo } : {}),
		...(bloodFilter ? { bloodGroup: bloodFilter } : {}),
		...(statusFilter ? { status: statusFilter } : {}),
		page,
		pageSize: 10,
	};

	const { data, isLoading } = useEmergencyHistory(organizationId, filters);

	const handleFilter = () => {
		setPage(1);
	};

	return (
		<div className="space-y-6">
			<HistoryFilterBar
				dateFrom={dateFrom}
				dateTo={dateTo}
				bloodFilter={bloodFilter}
				statusFilter={statusFilter}
				onDateFromChange={setDateFrom}
				onDateToChange={setDateTo}
				onBloodFilterChange={setBloodFilter}
				onStatusFilterChange={setStatusFilter}
				onApply={handleFilter}
			/>

			{isLoading ? (
				<div className="flex h-32 items-center justify-center">
					<Clock className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : !data || data.requests.length === 0 ? (
				<div className="bg-card border-border rounded-xl p-10 text-center text-muted-foreground">
					<Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
					<p className="text-sm font-medium">
						No completed emergency requests found.
					</p>
					<p className="text-xs text-muted-foreground mt-1">
						Past requests with fulfilled, expired, or cancelled
						status will appear here.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{data.requests.map((req) => (
						<RequestFunnelCard
							key={req.id}
							request={req}
							isExpanded={expandedId === req.id}
							onToggle={() =>
								setExpandedId(
									expandedId === req.id ? null : req.id,
								)
							}
						/>
					))}
				</div>
			)}

			<PaginationControls
				page={page}
				totalPages={data?.totalPages ?? 1}
				onPageChange={setPage}
			/>
		</div>
	);
}
