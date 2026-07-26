"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ScreeningFailureConsequence } from "@/servers/screening";

export function ScreeningFailurePrompt({
	onConfirm,
	onCancel,
	isPending,
}: {
	onConfirm: (consequence: ScreeningFailureConsequence) => void;
	onCancel: () => void;
	isPending: boolean;
}) {
	const [choice, setChoice] = useState<"defer" | "blacklist">("defer");
	const [deferDate, setDeferDate] = useState("");

	return (
		<div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 max-w-md">
			<p className="text-xs font-semibold text-foreground">
				Screening failed — choose a consequence for this donor
			</p>
			<div className="flex flex-col gap-2 text-xs text-foreground">
				<label className="flex items-center gap-2">
					<input
						type="radio"
						checked={choice === "defer"}
						onChange={() => setChoice("defer")}
					/>
					Defer until a specific date
				</label>
				{choice === "defer" && (
					<input
						type="date"
						value={deferDate}
						onChange={(e) => setDeferDate(e.target.value)}
						min={new Date().toISOString().split("T")[0]}
						className="w-full max-w-[10rem] px-3 py-1.5 bg-muted border-border rounded-lg text-xs"
					/>
				)}
				<label className="flex items-center gap-2">
					<input
						type="radio"
						checked={choice === "blacklist"}
						onChange={() => setChoice("blacklist")}
					/>
					Blacklist permanently
				</label>
			</div>
			<div className="flex gap-2">
				<Button
					size="sm"
					variant="destructive"
					disabled={isPending || (choice === "defer" && !deferDate)}
					onClick={() =>
						onConfirm(
							choice === "blacklist"
								? { type: "blacklist" }
								: { type: "defer", until: new Date(deferDate) },
						)
					}
				>
					{isPending ? "Applying..." : "Confirm"}
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={onCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
			</div>
		</div>
	);
}
