"use client";

import { useEffect, useState } from "react";
import { useCompleteWalkthrough, useResetWalkthrough, useWalkthroughState } from "@/hooks/use-walkthrough";
import { WalkthroughDialog } from "@/components/walkthrough/walkthrough-dialog";
import { Button } from "@/components/ui/button";
import type { WalkthroughAudience } from "@/servers/walkthrough";

export function WalkthroughGate({
	audience,
}: {
	audience: Exclude<WalkthroughAudience, "admin">;
}) {
	const { data: state } = useWalkthroughState();
	const complete = useCompleteWalkthrough();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (state && !state.completed && state.audience === audience) {
			setOpen(true);
		}
	}, [state, audience]);

	if (!state || state.completed || state.audience !== audience) {
		return null;
	}

	return (
		<WalkthroughDialog
			audience={audience}
			open={open}
			onDone={() => {
				setOpen(false);
				complete.mutate();
			}}
		/>
	);
}

export function ReplayWalkthroughButton({
	audience,
}: {
	audience: Exclude<WalkthroughAudience, "admin">;
}) {
	const reset = useResetWalkthrough();
	const [open, setOpen] = useState(false);
	const complete = useCompleteWalkthrough();

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				className="rounded-xl"
				disabled={reset.isPending}
				onClick={() =>
					reset.mutate(undefined, { onSuccess: () => setOpen(true) })
				}
			>
				{reset.isPending ? "Preparing…" : "Replay walkthrough"}
			</Button>
			{open && (
				<WalkthroughDialog
					audience={audience}
					open={open}
					onDone={() => {
						setOpen(false);
						complete.mutate();
					}}
				/>
			)}
		</>
	);
}
