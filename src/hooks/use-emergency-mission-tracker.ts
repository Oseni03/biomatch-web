"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { respondToAlert, updateAlertStatus } from "@/servers/emergency";

type TrackingStatus = "accepted" | "en_route" | "arrived";

export function useEmergencyMissionTracker(
	onDonationCompleted?: (dateISO: string) => void,
) {
	const queryClient = useQueryClient();
	const [activeTrackingId, setActiveTrackingId] = useState<string | null>(
		null,
	);
	const [trackingStatus, setTrackingStatus] =
		useState<TrackingStatus>("accepted");
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

	const handleRespond = useCallback(
		async (reqId: string) => {
			setActiveTrackingId(reqId);
			setTrackingStatus("accepted");
			try {
				await respondToAlert(reqId, "accepted");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to accept alert");
			}
		},
		[queryClient],
	);

	const handleDecline = useCallback(
		async (reqId: string) => {
			try {
				await respondToAlert(reqId, "declined");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				toast.success("Alert declined");
			} catch {
				toast.error("Failed to decline alert");
			}
		},
		[queryClient],
	);

	const handleMarkEnRoute = useCallback(
		async (reqId: string) => {
			try {
				await updateAlertStatus(reqId, "en_route");
				setTrackingStatus("en_route");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				toast.success("Marked as en route");
			} catch {
				toast.error("Failed to update status");
			}
		},
		[queryClient],
	);

	const handleMarkArrived = useCallback(
		async (reqId: string) => {
			try {
				await updateAlertStatus(reqId, "arrived");
				setTrackingStatus("arrived");
				setIsSuccessModalOpen(true);
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to update status");
			}
		},
		[queryClient],
	);

	const handleManualComplete = useCallback(async () => {
		if (activeTrackingId) {
			try {
				await updateAlertStatus(activeTrackingId, "completed");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				queryClient.invalidateQueries({
					queryKey: ["donor-dashboard"],
				});
			} catch {
				toast.error("Failed to update donation status");
			}
		}
		setActiveTrackingId(null);
		setIsSuccessModalOpen(false);
		const today = new Date().toISOString().split("T")[0];
		onDonationCompleted?.(today);
		toast.success("Donation recorded. Deferral period reset.");
	}, [activeTrackingId, queryClient, onDonationCompleted]);

	return {
		activeTrackingId,
		trackingStatus,
		isSuccessModalOpen,
		setActiveTrackingId,
		handleRespond,
		handleDecline,
		handleMarkEnRoute,
		handleMarkArrived,
		handleManualComplete,
	};
}
