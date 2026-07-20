"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	AlertTriangle,
	Send,
	Loader2,
	CheckCircle2,
	Users,
	MapPin,
	Droplet,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { createEmergencyRequest } from "@/servers/emergency";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BLOOD_GROUPS = [
	{ value: "A_PLUS", label: "A+" },
	{ value: "A_MINUS", label: "A-" },
	{ value: "B_PLUS", label: "B+" },
	{ value: "B_MINUS", label: "B-" },
	{ value: "AB_PLUS", label: "AB+" },
	{ value: "AB_MINUS", label: "AB-" },
	{ value: "O_PLUS", label: "O+" },
	{ value: "O_MINUS", label: "O-" },
] as const;

export default function EmergencyRequestPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const [bloodGroup, setBloodGroup] = useState("");
	const [unitsNeeded, setUnitsNeeded] = useState(1);
	const [urgencyLevel, setUrgencyLevel] = useState<"standard" | "critical">(
		"standard",
	);
	const [searchRadius, setSearchRadius] = useState(15);
	const [submitting, setSubmitting] = useState(false);
	const [result, setResult] = useState<{
		matchedDonorCount: number;
		hospitalName: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!session?.user?.id) {
			toast.error("Sign in to create an emergency request");
			return;
		}
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
			const res = await createEmergencyRequest({
				hospitalId: session.user.id,
				bloodGroup,
				unitsNeeded,
				urgencyLevel,
				searchRadius,
			});
			setResult({
				matchedDonorCount: res.matchedDonorCount,
				hospitalName: res.hospitalName,
			});
			toast.success("Emergency request created");
		} catch {
			toast.error("Failed to create emergency request");
		} finally {
			setSubmitting(false);
		}
	};

	if (!session?.user) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p className="text-sm text-muted-foreground">
					Sign in to request blood
				</p>
			</div>
		);
	}

	const inputClass =
		"w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ring";

	return (
		<div className="max-w-2xl space-y-8">
			<header>
				<h1 className="text-2xl font-bold text-foreground">
					Emergency Blood Request
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Create an urgent request and notify compatible donors in
					your area
				</p>
			</header>

			{result ? (
				<Card className="border-green-200 bg-green-50/50 rounded-3xl">
					<CardContent className="p-8 text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle2 className="h-8 w-8 text-green-600" />
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
									setUrgencyLevel("standard");
								}}
								variant="outline"
							>
								Create Another
							</Button>
							<Button
								onClick={() =>
									router.push("/hospital/inventory")
								}
							>
								View Inventory
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
								Specify the blood type and quantity needed
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div>
								<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
									Blood Group Needed
								</label>
								<select
									value={bloodGroup}
									onChange={(e) =>
										setBloodGroup(e.target.value)
									}
									className={inputClass}
									required
								>
									<option value="">Select blood group</option>
									{BLOOD_GROUPS.map((bg) => (
										<option key={bg.value} value={bg.value}>
											{bg.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
									Units Needed (pints)
								</label>
								<input
									type="number"
									min={1}
									max={100}
									value={unitsNeeded}
									onChange={(e) =>
										setUnitsNeeded(
											Math.max(
												1,
												parseInt(e.target.value) || 1,
											),
										)
									}
									className={inputClass}
									required
								/>
								<p className="mt-1 text-[11px] text-muted-foreground">
									Adult patient: 1 unit raises hemoglobin by
									~1 g/dL
								</p>
							</div>

							<div>
								<label className="mb-1.5 block text-xs font-medium text-muted-foreground">
									Urgency Level
								</label>
								<div className="grid grid-cols-2 gap-3">
									<button
										type="button"
										onClick={() =>
											setUrgencyLevel("standard")
										}
										className={`rounded-xl border p-4 text-left transition ${
											urgencyLevel === "standard"
												? "border-orange-300 bg-orange-50"
												: "border-border bg-white"
										}`}
									>
										<span className="text-sm font-semibold text-foreground">
											Standard
										</span>
										<p className="text-xs text-muted-foreground mt-0.5">
											Schedule within 24 hours
										</p>
									</button>
									<button
										type="button"
										onClick={() =>
											setUrgencyLevel("critical")
										}
										className={`rounded-xl border p-4 text-left transition ${
											urgencyLevel === "critical"
												? "border-destructive/30 bg-brand-light"
												: "border-border bg-white"
										}`}
									>
										<span className="flex items-center gap-1.5 text-sm font-semibold text-brand">
											<AlertTriangle className="h-4 w-4" />
											Critical
										</span>
										<p className="text-xs text-muted-foreground mt-0.5">
											Immediate response needed
										</p>
									</button>
								</div>
							</div>

							<div>
								<div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
									<span>Search Radius</span>
									<span className="font-semibold text-foreground">
										{searchRadius} km
									</span>
								</div>
								<input
									type="range"
									min={5}
									max={50}
									step={5}
									value={searchRadius}
									onChange={(e) =>
										setSearchRadius(Number(e.target.value))
									}
									className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand"
								/>
								<div className="flex justify-between text-[10px] text-muted-foreground mt-1">
									<span>5 km</span>
									<span>50 km</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Button
						type="submit"
						disabled={submitting}
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
