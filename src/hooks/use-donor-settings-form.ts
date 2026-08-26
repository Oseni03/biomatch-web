"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateUserProfile } from "@/servers/user";
import type { DonorStatus } from "@/lib/donor-types";

interface UseDonorSettingsFormArgs {
	userId?: string;
	userLocation?: string | null;
	userIsActive?: boolean;
	lastDonationDate: string | null;
}

export function useDonorSettingsForm({
	userId,
	userLocation,
	userIsActive,
	lastDonationDate,
}: UseDonorSettingsFormArgs) {
	const queryClient = useQueryClient();
	const [donorStatus, setDonorStatus] = useState<DonorStatus>("available");
	const [donorLocation, setDonorLocation] = useState<string>(
		userLocation ?? "",
	);
	const [maxRadius, setMaxRadius] = useState<number>(15);
	const [smsFallbackEnabled, setSmsFallbackEnabled] =
		useState<boolean>(true);
	const [settingsSuccess, setSettingsSuccess] = useState<string>("");
	const [lastDonationDateInput, setLastDonationDateInput] =
		useState<string>(lastDonationDate ?? "");

	useEffect(() => {
		if (userLocation) setDonorLocation(userLocation);
		if (lastDonationDate) setLastDonationDateInput(lastDonationDate);
		if (userIsActive === false) setDonorStatus("inactive");
	}, [userLocation, userIsActive, lastDonationDate]);

	const handleSaveSettings = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!userId) return;
			try {
				await updateUserProfile(userId, {
					location: donorLocation || undefined,
					isActive: donorStatus !== "inactive",
					lastDonationDate: lastDonationDateInput
						? new Date(lastDonationDateInput)
						: undefined,
				});
				setSettingsSuccess(
					"Preferences updated successfully! Match filters updated in real-time.",
				);
				setTimeout(() => setSettingsSuccess(""), 4000);
				queryClient.invalidateQueries({
					queryKey: ["donor-dashboard"],
				});
				toast.success("Settings saved");
			} catch {
				toast.error("Failed to save settings");
			}
		},
		[userId, donorLocation, donorStatus, lastDonationDateInput, queryClient],
	);

	return {
		donorStatus,
		setDonorStatus,
		donorLocation,
		setDonorLocation,
		maxRadius,
		setMaxRadius,
		smsFallbackEnabled,
		setSmsFallbackEnabled,
		settingsSuccess,
		lastDonationDateInput,
		setLastDonationDateInput,
		handleSaveSettings,
	};
}
