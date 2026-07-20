import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getQueryClient } from "@/lib/get-query-client";
import { getServerSession } from "@/lib/get-session";
import { getUserById } from "@/servers/user";
import { HealthProfileClient } from "./health-profile-client";

export default async function HealthProfilePage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const queryClient = getQueryClient();
	const userId = session.user.id;

	await queryClient.prefetchQuery({
		queryKey: ["health-profile", userId],
		queryFn: () => getUserById(userId),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HealthProfileClient />
		</HydrationBoundary>
	);
}
