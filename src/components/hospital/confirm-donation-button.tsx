"use client";

import { useState } from "react";
import { useConfirmDonationHospital } from "@/hooks/use-donations";
import { Button } from "@/components/ui/button";

export function ConfirmDonationButton({
	organizationId,
	callerId,
	matchId,
}: {
	organizationId: string;
	callerId: string;
	matchId: string;
}) {
	const confirm = useConfirmDonationHospital(organizationId, callerId);
	const [error, setError] = useState<string | null>(null);

	return (
		<span className="inline-flex flex-col items-end gap-1">
			<Button
				size="sm"
				className="rounded-xl"
				disabled={confirm.isPending}
				onClick={() => {
					setError(null);
					confirm.mutate(matchId, {
						onError: (caught) =>
							setError(
								caught instanceof Error ? caught.message : "Could not confirm",
							),
					});
				}}
			>
				{confirm.isPending ? "Confirming…" : "Confirm donation"}
			</Button>
			{error && <span className="text-[11px] font-semibold text-destructive">{error}</span>}
		</span>
	);
}
