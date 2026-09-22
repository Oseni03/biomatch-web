"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { StatusTag } from "@/components/brand/status-tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	liftDonorRestriction,
	restrictDonor,
	type AdminDonorDetail,
} from "@/servers/admin";

function actionErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong";
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4 py-2">
			<span className="text-xs font-semibold text-muted-foreground">{label}</span>
			<span className="truncate text-sm font-semibold text-foreground">{value}</span>
		</div>
	);
}

export function DonorDetailClient({ detail }: { detail: AdminDonorDetail }) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";
	const [reason, setReason] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const restricted = detail.donorStatus === "restricted";

	async function run(action: () => Promise<unknown>) {
		setPending(true);
		setError(null);
		try {
			await action();
			setReason("");
			router.refresh();
		} catch (caught) {
			setError(actionErrorMessage(caught));
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-border bg-card p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-bold text-foreground">Account</h2>
					<StatusTag status={restricted ? "critical" : "ok"}>
						{detail.donorStatus}
					</StatusTag>
				</div>
				<div className="mt-2 divide-y divide-border">
					<Row label="Email" value={detail.email} />
					<Row label="Donor code" value={detail.donorCode} />
					<Row label="State" value={detail.state ?? "—"} />
					<Row label="LGA" value={detail.lga ?? "—"} />
					<Row label="Available" value={detail.isAvailable ? "Yes" : "No"} />
					<Row
						label="Registered"
						value={new Date(detail.createdAt).toLocaleDateString()}
					/>
				</div>
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Verification & donations</h2>
				<div className="mt-2 divide-y divide-border">
					<Row label="Verification" value={detail.verificationStatus} />
					<Row
						label="Verified at"
						value={detail.verifiedAt ? new Date(detail.verifiedAt).toLocaleDateString() : "—"}
					/>
					<Row label="Donations" value={String(detail.donationCount)} />
					<Row label="Completed" value={String(detail.completedDonationCount)} />
					<Row
						label="Last donated"
						value={detail.lastDonatedAt ? new Date(detail.lastDonatedAt).toLocaleDateString() : "—"}
					/>
					<Row
						label="Cooldown until"
						value={detail.cooldownUntil ? new Date(detail.cooldownUntil).toLocaleDateString() : "—"}
					/>
				</div>
				{detail.recentDonations.length > 0 && (
					<ul className="mt-4 divide-y divide-border border-t border-border">
						{detail.recentDonations.map((donation) => (
							<li key={donation.id} className="flex items-center justify-between gap-4 py-2">
								<span className="truncate text-sm text-foreground">{donation.hospitalName}</span>
								<span className="shrink-0 text-xs text-muted-foreground">{donation.status}</span>
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="rounded-2xl border border-border bg-card p-6">
				<h2 className="text-base font-bold text-foreground">Restriction</h2>
				{restricted ? (
					<div className="mt-2 space-y-2">
						<p className="text-sm text-muted-foreground">
							Restricted{detail.restrictedAt ? ` on ${new Date(detail.restrictedAt).toLocaleDateString()}` : ""}
							{detail.restrictedByName ? ` by ${detail.restrictedByName}` : ""}. Reason:
							“{detail.restrictedReason ?? "—"}”. The donor stays active and can
							log in, but is excluded from matching and cannot accept requests.
						</p>
						<Button
							type="button"
							disabled={pending}
							onClick={() => run(() => liftDonorRestriction(callerUserId, detail.userId))}
							className="rounded-xl"
						>
							{pending ? "Working…" : "Lift restriction"}
						</Button>
					</div>
				) : (
					<div className="mt-4 space-y-3">
						<p className="text-sm text-muted-foreground">
							Restricting keeps the account active — the donor can still log in
							and view their screens — but removes them from matching
							immediately and blocks new accepts. A reason is required.
						</p>
						<div className="space-y-1">
							<label htmlFor="restrict-reason" className="text-xs font-semibold text-muted-foreground">
								Reason
							</label>
							<Input
								id="restrict-reason"
								value={reason}
								onChange={(event) => setReason(event.target.value)}
								placeholder="e.g. Failed screening, under investigation"
								className="rounded-xl"
							/>
						</div>
						<Button
							type="button"
							disabled={pending || reason.trim().length === 0}
							onClick={() => run(() => restrictDonor(callerUserId, detail.userId, { reason }))}
							className="rounded-xl"
						>
							{pending ? "Working…" : "Restrict donor"}
						</Button>
					</div>
				)}
				{error && (
					<p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
				)}
			</div>
		</div>
	);
}
