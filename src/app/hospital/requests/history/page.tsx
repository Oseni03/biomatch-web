import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getRequestHistory } from "@/servers/requests";
import { RequestHistoryClient } from "@/components/hospital/request-history";

export default async function HospitalRequestHistoryPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}
	const organizationId = await getActiveOrganizationId(session.user.id).catch(
		() => undefined,
	);
	if (!organizationId) {
		redirect("/hospital");
	}
	const queryClient = getQueryClient();
	const filters = { page: 1, pageSize: 10 };
	await queryClient
		.prefetchQuery({
			queryKey: ["hospital-request-history", organizationId, filters],
			queryFn: () => getRequestHistory(organizationId, session.user.id, filters),
		})
		.catch(() => undefined);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RequestHistoryClient organizationId={organizationId} />
		</HydrationBoundary>
	);
}
