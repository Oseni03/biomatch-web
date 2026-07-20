import { useQuery } from "@tanstack/react-query";
import { listDonors } from "@/servers/user";
import type { ListDonorsFilters } from "@/servers/user";

export function useEligibleDonors(filters?: ListDonorsFilters) {
	const queryKey = ["eligible-donors", filters ?? {}];

	return useQuery({
		queryKey,
		queryFn: () =>
			listDonors({
				pageSize: 20,
				...filters,
			}),
	});
}
