"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	approveHospital,
	rejectHospital,
	reinstateHospital,
	suspendHospital,
} from "@/servers/admin";

function actionErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong";
}

export function HospitalReviewActions({
	organizationId,
	verificationStatus,
}: {
	organizationId: string;
	verificationStatus: string;
}) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";
	const [notes, setNotes] = useState("");
	const [reason, setReason] = useState("");
	const [pending, setPending] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	async function run(key: string, action: () => Promise<unknown>, success: string) {
		setPending(key);
		setError(null);
		setMessage(null);
		try {
			await action();
			setMessage(success);
			router.refresh();
		} catch (caught) {
			setError(actionErrorMessage(caught));
		} finally {
			setPending(null);
		}
	}

	return (
		<div className="space-y-4 rounded-2xl border border-border bg-card p-6">
			<h2 className="text-base font-bold text-foreground">Review decision</h2>

			<div className="space-y-2">
				<label htmlFor="review-notes" className="text-xs font-semibold text-muted-foreground">
					Internal notes (optional, stored on the application)
				</label>
				<Textarea
					id="review-notes"
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					placeholder="Verification findings, documents checked…"
					rows={3}
					className="rounded-xl"
				/>
			</div>

			{verificationStatus === "pending" && (
				<>
					<div className="space-y-2">
						<label htmlFor="reject-reason" className="text-xs font-semibold text-muted-foreground">
							Rejection reason (required to reject, sent to the hospital)
						</label>
						<Textarea
							id="reject-reason"
							value={reason}
							onChange={(event) => setReason(event.target.value)}
							placeholder="e.g. Registration number could not be verified"
							rows={2}
							className="rounded-xl"
						/>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							className="rounded-xl"
							disabled={pending !== null || !callerUserId}
							onClick={() =>
								run(
									"approve",
									() => approveHospital(callerUserId, { organizationId, notes: notes || undefined }),
									"Hospital approved. The hospital has been emailed.",
								)
							}
						>
							{pending === "approve" ? "Approving…" : "Approve hospital"}
						</Button>
						<Button
							variant="destructive"
							className="rounded-xl"
							disabled={pending !== null || !callerUserId}
							onClick={() =>
								run(
									"reject",
									() =>
										rejectHospital(callerUserId, {
											organizationId,
											reason,
											notes: notes || undefined,
										}),
									"Hospital rejected. The hospital has been emailed.",
								)
							}
						>
							{pending === "reject" ? "Rejecting…" : "Reject with reason"}
						</Button>
					</div>
				</>
			)}

			{verificationStatus === "approved" && (
				<Button
					variant="destructive"
					className="rounded-xl"
					disabled={pending !== null || !callerUserId}
					onClick={() =>
						run(
							"suspend",
							() => suspendHospital(callerUserId, { organizationId, notes: notes || undefined }),
							"Hospital suspended. Dispatch is now disabled for this workspace.",
						)
					}
				>
					{pending === "suspend" ? "Suspending…" : "Suspend hospital"}
				</Button>
			)}

			{verificationStatus === "suspended" && (
				<Button
					className="rounded-xl"
					disabled={pending !== null || !callerUserId}
					onClick={() =>
						run(
							"reinstate",
							() => reinstateHospital(callerUserId, { organizationId, notes: notes || undefined }),
							"Hospital reinstated and approved again.",
						)
					}
				>
					{pending === "reinstate" ? "Reinstating…" : "Reinstate hospital"}
				</Button>
			)}

			{error && <p className="text-xs font-semibold text-destructive">{error}</p>}
			{message && <p className="text-xs font-semibold text-emerald-600">{message}</p>}
		</div>
	);
}
