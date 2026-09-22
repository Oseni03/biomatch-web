"use client";

import { useState } from "react";
import { ClipboardCheck, ScanSearch, ShieldAlert } from "lucide-react";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { StatusTag } from "@/components/brand/status-tag";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	lookupDonorByCode,
	recordScreening,
	type DonorLookupResult,
	type RecentScreening,
} from "@/servers/screening";

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong";
}

export function ScreeningClient({
	organizationId,
	callerUserId,
	canRecord,
	initialRecent,
}: {
	organizationId: string;
	callerUserId: string;
	canRecord: boolean;
	initialRecent: RecentScreening[];
}) {
	const [code, setCode] = useState("");
	const [donor, setDonor] = useState<DonorLookupResult | null>(null);
	const [recent, setRecent] = useState(initialRecent);
	const [notes, setNotes] = useState("");
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	async function handleLookup(event: React.FormEvent) {
		event.preventDefault();
		setBusy("lookup");
		setError(null);
		setMessage(null);
		setDonor(null);
		try {
			const result = await lookupDonorByCode(organizationId, callerUserId, code);
			setDonor(result);
		} catch (caught) {
			setError(errorMessage(caught));
		} finally {
			setBusy(null);
		}
	}

	async function handleRecord(result: "passed" | "failed") {
		if (!donor) return;
		setBusy(result);
		setError(null);
		setMessage(null);
		try {
			const recorded = await recordScreening(organizationId, callerUserId, {
				donorCode: donor.donorCode,
				result,
				notes: notes || undefined,
			});
			setDonor({ ...donor, verificationStatus: recorded.verificationStatus });
			setNotes("");
			setRecent((rows) => [
				{
					id: recorded.screeningId,
					donorCode: donor.donorCode,
					donorName: donor.name,
					result,
					screenedAt: new Date(),
					recordedBy: "You",
					notes: null,
				},
				...rows,
			]);
			setMessage(
				result === "passed"
					? "Screening recorded: donor verified and now eligible for matching."
					: "Screening recorded: donor marked as failed and stays out of matching.",
			);
		} catch (caught) {
			setError(errorMessage(caught));
		} finally {
			setBusy(null);
		}
	}

	if (!canRecord) {
		return (
			<div className="space-y-8">
				<DashboardGreeting
					title="Donor screening"
					subtitle="Record in-person screening results by donor code."
				/>
				<div className="rounded-2xl border border-border bg-card p-6 text-center">
					<ShieldAlert className="mx-auto h-7 w-7 text-muted-foreground" />
					<p className="mt-2 text-sm font-semibold text-foreground">
						Screening permission required
					</p>
					<p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
						Your role does not include recording screenings, or this hospital is
						not an approved screening partner. Ask a hospital admin for access.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<DashboardGreeting
				title="Donor screening"
				subtitle="Look up a donor by code after the in-person screen, then record the result."
			/>

			{error && (
				<p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
					{error}
				</p>
			)}
			{message && (
				<p className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-xs font-semibold text-emerald-600">
					{message}
				</p>
			)}

			<section className="rounded-2xl border border-border bg-card p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
					<ScanSearch className="h-4 w-4" /> Find donor by code
				</h2>
				<form onSubmit={handleLookup} className="mt-3 flex flex-col gap-3 sm:flex-row">
					<Input
						value={code}
						onChange={(event) => setCode(event.target.value.toUpperCase())}
						placeholder="e.g. BM-7K3Q9X"
						className="max-w-xs rounded-xl font-mono uppercase"
						maxLength={9}
						required
					/>
					<Button type="submit" disabled={busy !== null} className="rounded-xl sm:w-auto">
						{busy === "lookup" ? "Looking up…" : "Look up"}
					</Button>
				</form>

				{!donor && busy === null && !error && (
					<div className="mt-4 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center">
						<p className="text-xs font-semibold text-foreground">No donor looked up yet</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Enter the donor&apos;s code from their app after completing the
							in-person screening.
						</p>
					</div>
				)}

				{donor && (
					<div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
						<div className="flex flex-wrap items-center gap-3">
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-bold text-foreground">{donor.name}</p>
								<p className="font-mono text-xs text-muted-foreground">{donor.donorCode}</p>
							</div>
							<BloodTypeBadge bloodGroup={donor.bloodGroup} />
							<StatusTag status={donor.verificationStatus === "verified" ? "ok" : "info"}>
								{donor.verificationStatus}
							</StatusTag>
						</div>
						<div className="mt-4 space-y-2">
							<label htmlFor="screening-notes" className="text-xs font-semibold text-muted-foreground">
								Screening notes (optional, never shown to the donor)
							</label>
							<Textarea
								id="screening-notes"
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
								placeholder="Observations, test batch, deferral advice…"
								rows={2}
								className="rounded-xl"
							/>
						</div>
						<div className="mt-3 flex flex-wrap gap-2">
							<Button
								className="rounded-xl"
								disabled={busy !== null}
								onClick={() => handleRecord("passed")}
							>
								{busy === "passed" ? "Recording…" : "Record passed"}
							</Button>
							<Button
								variant="destructive"
								className="rounded-xl"
								disabled={busy !== null}
								onClick={() => handleRecord("failed")}
							>
								{busy === "failed" ? "Recording…" : "Record failed"}
							</Button>
						</div>
					</div>
				)}
			</section>

			<section className="rounded-2xl border border-border bg-card p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-foreground">
					<ClipboardCheck className="h-4 w-4" /> Recent screenings at this hospital
				</h2>
				{recent.length === 0 ? (
					<div className="mt-3 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center">
						<p className="text-xs font-semibold text-foreground">No screenings recorded yet</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Screenings recorded here appear in this list with the result and date.
						</p>
					</div>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{recent.map((row) => (
							<li key={row.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
								<div className="min-w-0 flex-1">
									<p className="truncate font-semibold text-foreground">
										{row.donorName}{" "}
										<span className="font-mono text-xs font-normal text-muted-foreground">
											{row.donorCode}
										</span>
									</p>
									<p className="text-xs text-muted-foreground">
										{row.screenedAt.toLocaleDateString()} · by {row.recordedBy}
									</p>
								</div>
								<StatusTag status={row.result === "passed" ? "ok" : "critical"}>
									{row.result}
								</StatusTag>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
