"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { setScreeningPartner } from "@/servers/admin";

export function PartnerToggle({
	organizationId,
	initialIsPartner,
	canToggle,
}: {
	organizationId: string;
	initialIsPartner: boolean;
	canToggle: boolean;
}) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";
	const [isPartner, setIsPartner] = useState(initialIsPartner);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleToggle() {
		setPending(true);
		setError(null);
		try {
			const result = await setScreeningPartner(callerUserId, {
				organizationId,
				isScreeningPartner: !isPartner,
			});
			setIsPartner(result.isScreeningPartner);
			router.refresh();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Update failed");
		} finally {
			setPending(false);
		}
	}

	if (!canToggle) {
		return (
			<p className="text-sm text-muted-foreground">
				Screening partner: {isPartner ? "Yes" : "No"}
			</p>
		);
	}

	return (
		<div className="space-y-2 rounded-2xl border border-border bg-card p-6">
			<h2 className="text-base font-bold text-foreground">Screening partner</h2>
			<p className="text-sm text-muted-foreground">
				{isPartner
					? "Staff at this hospital can record donor screenings."
					: "Only approved hospitals can be marked as screening partners."}
			</p>
			<Button
				variant="outline"
				className="rounded-xl"
				disabled={pending || !callerUserId}
				onClick={handleToggle}
			>
				{pending ? "Saving…" : isPartner ? "Remove partner status" : "Mark as screening partner"}
			</Button>
			{error && <p className="text-xs font-semibold text-destructive">{error}</p>}
		</div>
	);
}
