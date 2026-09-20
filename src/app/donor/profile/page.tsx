import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getUserById } from "@/servers/user";
import { DonorProfileClient } from "./donor-profile-client";

export default async function DonorProfilePage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const userId = session.user.id;

	await queryClient.prefetchQuery({
		queryKey: ["donor-dashboard", userId],
		queryFn: () => getUserById(userId),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DonorProfileClient />
		</HydrationBoundary>
	);
}
