import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { DonorDashboardClient } from "./donor-dashboard-client";

export default async function DonorDashboardPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login?callbackUrl=/donor");
	}

	return <DonorDashboardClient />;
}
