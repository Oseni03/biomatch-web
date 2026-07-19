"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { EXPANSION_TIMEOUT_MS } from "@/lib/radius-expansion";
import { RadiusExpansionCard } from "@/components/hospital/radius-expansion-card";
import { EmergencyRequestForm } from "@/components/hospital/emergency-request-form";
import { LiveStatusPanel } from "@/components/hospital/live-status-panel";
import {
	usePendingEmergencyRequests,
	useExpandSearchRadius,
} from "@/hooks/use-emergency-requests";
import { PaginationControls } from "@/components/ui/pagination-controls";

const EXPANSION_COUNTDOWN_S = Math.floor(EXPANSION_TIMEOUT_MS / 1000);

export default function HospitalBroadcastsPage() {
	const { data: session } = authClient.useSession();
	const [page, setPage] = useState(1);
	const { data: pendingRequests } = usePendingEmergencyRequests(
		session?.user?.id,
		{
			page,
			pageSize: 10,
		},
	);
	const expandMutation = useExpandSearchRadius();

	const pendingServerReqs = pendingRequests?.requests ?? [];
	const hasPendingServerReq = pendingServerReqs.some(
		(r) => r.status === "pending",
	);

	const [alertRadius, setAlertRadius] = useState(5);
	const [totalDonors, setTotalDonors] = useState(0);
	const [autoExpandCountdown, setAutoExpandCountdown] = useState(
		EXPANSION_COUNTDOWN_S,
	);
	const [isExpandingRadius, setIsExpandingRadius] = useState(false);
	const [expandingRequestId, setExpandingRequestId] = useState<string | null>(
		null,
	);

	const lastExpandRef = useRef<number>(0);

	const handleFilter = () => {
		setPage(1);
	};

	useEffect(() => {
		if (pendingServerReqs.length > 0) {
			const pending = pendingServerReqs.find(
				(r) => r.status === "pending",
			);
			if (pending) {
				setAlertRadius(pending.searchRadius);
				setTotalDonors(pending.alerts.length);
				setExpandingRequestId(pending.id);
			}
		}
	}, [pendingServerReqs]);

	useEffect(() => {
		if (!hasPendingServerReq || !expandingRequestId) {
			setAutoExpandCountdown(EXPANSION_COUNTDOWN_S);
			return;
		}

		const timer = setInterval(() => {
			setAutoExpandCountdown((prev) => {
				if (prev <= 1) {
					const now = Date.now();
					if (now - lastExpandRef.current > 10_000) {
						lastExpandRef.current = now;
						expandMutation.mutate(
							{ requestId: expandingRequestId },
							{
								onSuccess: (data) => {
									if (data.expanded) {
										setAlertRadius(data.searchRadius);
										setTotalDonors(data.totalDonors);
										setIsExpandingRadius(true);
										setTimeout(
											() => setIsExpandingRadius(false),
											2000,
										);
									}
								},
							},
						);
					}
					return EXPANSION_COUNTDOWN_S;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [hasPendingServerReq, expandingRequestId]);

	useEffect(() => {
		if (!hasPendingServerReq && expandingRequestId) {
			setExpandingRequestId(null);
		}
	}, [hasPendingServerReq, expandingRequestId]);

	return (
		<div className="space-y-8">
			{hasPendingServerReq && expandingRequestId && (
				<RadiusExpansionCard
					hospitalLocation=""
					alertRadius={alertRadius}
					autoExpandCountdown={autoExpandCountdown}
					isExpanding={isExpandingRadius}
					totalDonors={totalDonors}
					onWidenRadius={() => {
						if (!expandingRequestId) return;
						const now = Date.now();
						if (now - lastExpandRef.current < 5_000) return;
						lastExpandRef.current = now;
						expandMutation.mutate(
							{ requestId: expandingRequestId },
							{
								onSuccess: (data) => {
									if (data.expanded) {
										setAlertRadius(data.searchRadius);
										setTotalDonors(data.totalDonors);
										setIsExpandingRadius(true);
										setTimeout(
											() => setIsExpandingRadius(false),
											2000,
										);
										setAutoExpandCountdown(
											EXPANSION_COUNTDOWN_S,
										);
									}
								},
							},
						);
					}}
					requestId={expandingRequestId}
				/>
			)}

			<EmergencyRequestForm
				hospitalName=""
				hospitalLocation=""
				hospitalPhone=""
				onSubmit={() => {}}
			/>

			<div className="space-y-6">
				<h3 className="font-bold flex items-center gap-2 text-base text-foreground">
					<Clock className="h-5 w-5 text-muted-foreground" />
					Active Dispatch Stream
				</h3>

				{pendingServerReqs.length > 0 ? (
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
							Live Status Panel
						</h4>
						{pendingServerReqs.map((req) => (
							<LiveStatusPanel key={req.id} requestId={req.id} />
						))}
						{pendingRequests && pendingRequests.totalPages > 1 && (
							<PaginationControls
								page={page}
								totalPages={pendingRequests.totalPages}
								onPageChange={setPage}
								variant="numbered"
							/>
						)}
					</div>
				) : (
					<div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground">
						No active emergency requests. Create one from the
						emergency request form above.
					</div>
				)}
			</div>
		</div>
	);
}
