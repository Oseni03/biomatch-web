import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getUserById } from "@/servers/user";
import { getAllHospitalBanks } from "@/servers/hospital";
import { getAlertsForDonor, getDonorHistory } from "@/servers/emergency";
import { getAllCityLabels } from "@/servers/location";
import { getDonorVerificationStatus } from "@/servers/screening";
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
			queryKey: ["inventory"],
			queryFn: () => getAllHospitalBanks(),
		}),
		queryClient.prefetchQuery({
			queryKey: ["donor-alerts", userId, { page: 1, pageSize: 10 }],
			queryFn: () => getAlertsForDonor(userId, { page: 1, pageSize: 10 }),
		}),
		queryClient.prefetchQuery({
			queryKey: ["donor-history", userId, 1],
			queryFn: () => getDonorHistory(userId, 1),
		}),
		queryClient.prefetchQuery({
			queryKey: ["city-labels"],
			queryFn: () => getAllCityLabels(),
		}),
		queryClient.prefetchQuery({
			queryKey: ["donor-verification-status", userId],
			queryFn: () => getDonorVerificationStatus(userId),
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DonorDashboardClient />
		</HydrationBoundary>
	);
}
