"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Send,
	Loader2,
	CheckCircle2,
	Minus,
	Plus,
	Droplet,
	AlertTriangle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { createBloodRequest } from "@/servers/requests";
import { formatBloodGroup } from "@/lib/blood-compatibility";
import { MATCH_START_RADIUS_KM } from "@/lib/config";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BLOOD_GROUPS = [
	"A_POS",
	"A_NEG",
	"B_POS",
	"B_NEG",
	"AB_POS",
	"AB_NEG",
	"O_POS",
	"O_NEG",
];

interface EmergencyRequestClientProps {
	organizationId: string;
}

export function EmergencyRequestClient({
	organizationId,
}: EmergencyRequestClientProps) {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";

	const [bloodGroup, setBloodGroup] = useState("");
	const [unitsNeeded, setUnitsNeeded] = useState(1);
	const [internalReference, setInternalReference] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<{
		matchedDonorCount: number;
		hospitalName: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!bloodGroup) {
			toast.error("Select a blood group");
			return;
		}
		if (unitsNeeded < 1 || unitsNeeded > 100) {
			toast.error("Units must be between 1 and 100");
			return;
		}

		setSubmitting(true);
		setResult(null);

		try {
			const res = await createBloodRequest(organizationId, callerUserId, {
				bloodGroup,
				unitsRequired: unitsNeeded,
				internalReference: internalReference.trim() || undefined,
			});
			setResult({
				matchedDonorCount: res.matchedDonorCount,
				hospitalName: res.hospitalName,
			});
			toast.success("Emergency request created");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create emergency request");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto space-y-8">
			<DashboardGreeting
				title="Emergency Blood Request"
				subtitle="Create an urgent request and notify compatible donors in your area"
			/>

			{result ? (
				<Card className="border-status-ok/20 bg-status-ok-bg/50 rounded-3xl">
					<CardContent className="p-8 text-center">
						<div className="w-16 h-16 bg-status-ok-bg rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle2 className="h-8 w-8 text-status-ok" />
						</div>
						<h2 className="text-xl font-bold text-foreground">
							Request Broadcasted
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							<span className="font-semibold text-foreground">
								{result.matchedDonorCount}
							</span>{" "}
							compatible donor
							{result.matchedDonorCount !== 1 ? "s" : ""} have
							been alerted in your area
						</p>
						<div className="mt-6 flex gap-3 justify-center">
							<Button
								onClick={() => {
									setResult(null);
									setBloodGroup("");
									setUnitsNeeded(1);
									setInternalReference("");
								}}
								variant="outline"
							>
								Create Another
							</Button>
							<Button
								onClick={() =>
									router.push("/hospital")
								}
							>
								View Active Requests
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<form onSubmit={handleSubmit} className="space-y-6">
					<Card className="rounded-3xl">
						<CardHeader>
							<CardTitle className="text-base flex items-center gap-2">
								<Droplet className="h-5 w-5 text-brand" />
								Request Details
							</CardTitle>
							<CardDescription>
								All requests are urgent — compatible donors near the hospital
								are notified immediately.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div>
								<label className="mb-2 block text-xs font-medium text-muted-foreground">
									Blood Group Needed
								</label>
								<div className="grid grid-cols-4 gap-2">
									{BLOOD_GROUPS.map((value) => {
										const selected = bloodGroup === value;
										return (
											<button
												key={value}
												type="button"
												onClick={() =>
													setBloodGroup(value)
												}
												className={cn(
													"flex flex-col items-center gap-1.5 rounded-xl border p-3 transition",
													selected
														? "border-brand bg-brand-light shadow-sm"
														: "border-border bg-card hover:border-brand/30 hover:bg-brand-light/40",
												)}
											>
												<BloodTypeBadge
													bloodGroup={value}
													size="sm"
													variant={
														selected
															? "deep"
															: "default"
													}
												/>
											</button>
										);
									})}
								</div>
							</div>

							<div>
								<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
									Units Needed (pints)
								</label>
								<div className="flex items-center gap-3">
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() =>
											setUnitsNeeded((n) =>
												Math.max(1, n - 1),
											)
										}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<Input
										type="number"
										min={1}
										max={100}
										value={unitsNeeded}
										onChange={(e) =>
											setUnitsNeeded(
												Math.max(
													1,
													parseInt(e.target.value) ||
														1,
												),
											)
										}
										className="h-9 w-20 text-center text-base font-semibold"
										required
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() =>
											setUnitsNeeded((n) =>
												Math.min(100, n + 1),
											)
										}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<p className="mt-1.5 text-[11px] text-muted-foreground">
									Adult patient: 1 unit raises hemoglobin by
									~1 g/dL
								</p>
							</div>

							<div>
								<label
									htmlFor="internal-reference"
									className="mb-1.5 block text-xs font-medium text-muted-foreground"
								>
									Internal reference (optional, hospital-only)
								</label>
								<Input
									id="internal-reference"
									value={internalReference}
									onChange={(e) => setInternalReference(e.target.value)}
									placeholder="e.g. Ward B bed 12"
									maxLength={120}
									className="rounded-xl"
								/>
								<p className="mt-1.5 text-[11px] text-muted-foreground">
									Never shown to donors. Patient identity is never
									collected.
								</p>
							</div>

							<div className="flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
								<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
								<p>
									Donors within {MATCH_START_RADIUS_KM} km are notified
									at once{bloodGroup ? ` for ${formatBloodGroup(bloodGroup)}` : ""}.
									The search widens automatically if more units are still
									needed.
								</p>
							</div>
						</CardContent>
					</Card>

					<Button
						type="submit"
						disabled={submitting || !callerUserId}
						className="w-full py-6 text-base rounded-2xl"
					>
						{submitting ? (
							<Loader2 className="h-5 w-5 animate-spin mr-2" />
						) : (
							<Send className="h-5 w-5 mr-2" />
						)}
						{submitting
							? "Matching Donors..."
							: "Broadcast Emergency Request"}
					</Button>
				</form>
			)}
		</div>
	);
}
