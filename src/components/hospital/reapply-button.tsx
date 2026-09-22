"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { reapplyForVerification } from "@/servers/admin";

export function ReapplyButton({ organizationId }: { organizationId: string }) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleReapply() {
		setPending(true);
		setError(null);
		try {
			await reapplyForVerification(organizationId, callerUserId);
			router.refresh();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Reapply failed");
			setPending(false);
		}
	}

	return (
		<div className="mt-4">
			<Button onClick={handleReapply} disabled={pending || !callerUserId} className="rounded-2xl">
				{pending ? "Submitting…" : "Reapply for verification"}
			</Button>
			{error && <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
		</div>
	);
}
