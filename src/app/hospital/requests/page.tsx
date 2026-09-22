import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getActiveOrganizationId } from "@/servers/organization";
import { getActiveRequests } from "@/servers/requests";
import { ActiveRequestsClient } from "@/components/hospital/active-requests";

export default async function HospitalActiveRequestsPage() {
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
			queryKey: ["hospital-active-requests", organizationId, filters],
			queryFn: () => getActiveRequests(organizationId, session.user.id, filters),
		})
		.catch(() => undefined);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ActiveRequestsClient organizationId={organizationId} />
		</HydrationBoundary>
	);
}
