import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getUserById } from "@/servers/user";
import { getAlertsForDonor } from "@/servers/emergency";
import { DonorDashboardClient } from "./donor-dashboard-client";

export default async function DonorDashboardPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const userId = session.user.id;

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["donor-dashboard", userId],
			queryFn: () => getUserById(userId),
		}),
		queryClient.prefetchQuery({
			queryKey: ["donor-alerts", userId, { page: 1, pageSize: 10 }],
			queryFn: () => getAlertsForDonor(userId, { page: 1, pageSize: 10 }),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DonorDashboardClient />
		</HydrationBoundary>
	);
}
