"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	confirmDonationByDonor,
	confirmDonationByHospital,
	getMyDonations,
} from "@/servers/donations";

export function useMyDonations(donorId?: string) {
	return useQuery({
		queryKey: ["my-donations", donorId],
		queryFn: () => getMyDonations(donorId!),
		enabled: !!donorId,
	});
}

export function useConfirmDonationDonor() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ matchId, donorId }: { matchId: string; donorId: string }) =>
			confirmDonationByDonor(matchId, donorId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["my-responses"] });
			queryClient.invalidateQueries({ queryKey: ["my-donations"] });
			queryClient.invalidateQueries({ queryKey: ["notification-inbox"] });
		},
	});
}

export function useConfirmDonationHospital(organizationId: string, callerId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (matchId: string) =>
			confirmDonationByHospital(organizationId, callerId, matchId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["hospital-active-requests"] });
			queryClient.invalidateQueries({ queryKey: ["hospital-request-history"] });
		},
	});
}
