import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { HospitalBroadcastsClient } from "./hospital-broadcasts-client";

export default async function HospitalBroadcastsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	return <HospitalBroadcastsClient hospitalId={session.user.id} />;
}
