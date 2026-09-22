import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
	getHospitalDashboardMetrics,
	getOrganizationProfile,
	updateOrganizationProfile,
	type OrganizationProfile,
} from "@/servers/hospital";

export function useHospitalDashboardMetrics(organizationId?: string) {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;
	return useQuery({
		queryKey: ["hospital-dashboard-metrics", organizationId],
		queryFn: () => getHospitalDashboardMetrics(organizationId!, userId!),
		enabled: !!organizationId && !!userId,
		refetchInterval: 30_000,
	});
}

export function useOrganizationProfile(organizationId?: string) {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;
	return useQuery({
		queryKey: ["organization-profile", organizationId],
		queryFn: () => getOrganizationProfile(organizationId!, userId!),
		enabled: !!organizationId && !!userId,
	});
}

export function useUpdateOrganizationProfile(organizationId: string) {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: {
			name: string;
			phone?: string | null;
			address: string;
			state: string;
			lga?: string | null;
		}) => updateOrganizationProfile(organizationId, userId!, input),
		onSuccess: (next: OrganizationProfile) => {
			queryClient.setQueryData(
				["organization-profile", organizationId],
				next,
			);
		},
	});
}
