"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { requestAccountDeletion } from "@/servers/erasure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountSection() {
	const router = useRouter();
	const [confirming, setConfirming] = useState(false);
	const [confirmation, setConfirmation] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");

	async function onDelete() {
		setPending(true);
		setError("");
		try {
			await requestAccountDeletion({ password, confirmation });
			await authClient.signOut();
			router.push("/");
		} catch (cause) {
			setError(
				cause instanceof Error ? cause.message : "Could not delete account",
			);
			setPending(false);
		}
	}

	return (
		<section className="rounded-2xl border border-red-200 bg-card p-5 sm:p-6">
			<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
				<TriangleAlert className="h-4 w-4 text-red-600" />
				Delete account
			</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				This permanently wipes your name, contact details, location and
				health-adjacent profile data. Donation and request records stay as
				de-identified history. This cannot be undone.
			</p>
			{!confirming ? (
				<Button
					variant="outline"
					size="sm"
					className="mt-3 rounded-xl border-red-200 text-red-700 hover:text-red-700"
					onClick={() => setConfirming(true)}
				>
					Delete my account…
				</Button>
			) : (
				<div className="mt-4 space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="delete-confirm">
							Type DELETE to confirm
						</Label>
						<Input
							id="delete-confirm"
							value={confirmation}
							placeholder="DELETE"
							onChange={(event) => setConfirmation(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="delete-password">Current password</Label>
						<Input
							id="delete-password"
							type="password"
							autoComplete="current-password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="destructive"
							size="sm"
							className="rounded-xl"
							disabled={
								pending || confirmation !== "DELETE" || !password
							}
							onClick={onDelete}
						>
							{pending ? "Deleting…" : "Permanently delete my account"}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="rounded-xl"
							disabled={pending}
							onClick={() => {
								setConfirming(false);
								setConfirmation("");
								setPassword("");
								setError("");
							}}
						>
							Keep my account
						</Button>
					</div>
					{error && (
						<p className="text-xs font-semibold text-red-600">{error}</p>
					)}
				</div>
			)}
		</section>
	);
}
