import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { EmergencyRequestClient } from "./emergency-request-client";

export default async function EmergencyRequestPage() {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	return <EmergencyRequestClient hospitalId={session.user.id} />;
}
