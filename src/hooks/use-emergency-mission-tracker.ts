"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	respondToAlert,
	updateAlertStatus,
	withdrawAlert,
} from "@/servers/emergency";

type TrackingStatus = "accepted" | "en_route" | "arrived";

export function useEmergencyMissionTracker() {
	const queryClient = useQueryClient();
	const [activeTrackingId, setActiveTrackingId] = useState<string | null>(
		null,
	);
	const [trackingStatus, setTrackingStatus] =
		useState<TrackingStatus>("accepted");

	const handleRespond = useCallback(
		async (reqId: string, donorId?: string) => {
			setActiveTrackingId(reqId);
			setTrackingStatus("accepted");
			try {
				await respondToAlert(reqId, "accepted", donorId);
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to accept alert");
			}
		},
		[queryClient],
	);

	const handleDecline = useCallback(
		async (reqId: string, donorId?: string) => {
			try {
				await respondToAlert(reqId, "declined", donorId);
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				toast.success("Alert declined");
			} catch {
				toast.error("Failed to decline alert");
			}
		},
		[queryClient],
	);

	const handleWithdraw = useCallback(
		async (reqId: string, donorId?: string, reason?: string) => {
			if (!donorId) {
				toast.error("You must be signed in to withdraw from this alert");
				return;
			}
			try {
				await withdrawAlert(reqId, donorId, reason);
				setActiveTrackingId(null);
				setTrackingStatus("accepted");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
				toast.success("Alert withdrawn. Hospital was notified.");
			} catch {
				toast.error("Failed to withdraw from this alert");
			}
		},
		[queryClient],
	);

	const handleMarkEnRoute = useCallback(
		async (reqId: string, donorId?: string) => {
			try {
				await updateAlertStatus(reqId, "en_route", donorId);
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
		async (reqId: string, donorId?: string) => {
			try {
				await updateAlertStatus(reqId, "arrived", donorId);
				setTrackingStatus("arrived");
				queryClient.invalidateQueries({ queryKey: ["donor-alerts"] });
			} catch {
				toast.error("Failed to update status");
			}
		},
		[queryClient],
	);

	return {
		activeTrackingId,
		trackingStatus,
		setActiveTrackingId,
		handleRespond,
		handleDecline,
		handleWithdraw,
		handleMarkEnRoute,
		handleMarkArrived,
	};
}
