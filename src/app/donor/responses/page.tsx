import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { DonorNearbyClient } from "./donor-nearby-client";

export default async function DonorResponsesPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	return <DonorNearbyClient />;
}
