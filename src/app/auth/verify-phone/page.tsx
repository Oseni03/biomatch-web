import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { VerifyPhoneClient } from "./verify-phone-client";

export default async function VerifyPhonePage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string }>;
}) {
	const params = await searchParams;
	const next = params.next?.startsWith("/") ? params.next : "/donor";

	const session = await getServerSession();
	if (!session?.user?.id) {
		redirect(`/auth/login?callbackUrl=${encodeURIComponent(next)}`);
	}

	return <VerifyPhoneClient next={next} />;
}
