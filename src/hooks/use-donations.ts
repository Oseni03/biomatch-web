import { useQuery } from "@tanstack/react-query";
import { getDonationsForDonor } from "@/servers/donation";

export function useDonorDonations(donorId: string, enabled: boolean) {
	return useQuery({
		queryKey: ["donor-donations", donorId],
		queryFn: () => getDonationsForDonor(donorId),
		enabled,
	});
}
