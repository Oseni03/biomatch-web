import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getConsentStatusForUser } from "@/servers/consent";
import { ConsentClient } from "./consent-client";

export default async function ConsentPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string }>;
}) {
	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const params = await searchParams;
	const next = params.next?.startsWith("/") ? params.next : null;
	const status = await getConsentStatusForUser(session.user.id);

	if (status.missing.length === 0) {
		redirect(next ?? "/donor");
	}

	return <ConsentClient next={next} marketingGranted={status.marketingGranted} />;
}
