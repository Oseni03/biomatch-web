import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { DonorInboxClient } from "./donor-inbox-client";

export default async function DonorNotificationsPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	return <DonorInboxClient />;
}
