"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Plus, Minus, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { createEmergencyRequest } from "@/servers/emergency";
import { INITIAL_RADIUS } from "@/lib/radius-expansion";
import { displayBloodGroup, BLOOD_GROUP_MAP } from "@/lib/donor-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BLOOD_GROUPS = Object.keys(BLOOD_GROUP_MAP);

interface EmergencyRequestFormProps {
	organizationId: string;
}

export function EmergencyRequestForm({ organizationId }: EmergencyRequestFormProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [reqBloodType, setReqBloodType] = useState("O_PLUS");
	const [reqUrgency, setReqUrgency] = useState<"standard" | "critical">("critical");
	const [reqPints, setReqPints] = useState(2);
	const [searchRadius, setSearchRadius] = useState(INITIAL_RADIUS);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetForm = () => {
		setReqBloodType("O_PLUS");
		setReqUrgency("critical");
		setReqPints(2);
		setSearchRadius(INITIAL_RADIUS);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (reqPints < 1 || reqPints > 20) {
			toast.error("Units must be between 1 and 20");
			return;
		}
		setIsSubmitting(true);

		try {
			const res = await createEmergencyRequest({
				organizationId,
				bloodGroup: reqBloodType,
				unitsNeeded: reqPints,
				urgencyLevel: reqUrgency,
				searchRadius,
			});

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["pending-emergency-requests"] }),
				queryClient.invalidateQueries({ queryKey: ["emergency-history"] }),
			]);
			toast.success(
				res.matchedDonorCount > 0
					? `Emergency broadcast sent to ${res.matchedDonorCount} screened donor${res.matchedDonorCount !== 1 ? "s" : ""}.`
					: "Emergency request created — no eligible donors found in range.",
			);
			setOpen(false);
			resetForm();
		} catch {
			toast.error("Failed to create request. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="lg" className="shadow-md">
					<Plus className="h-4 w-4" />
					Create Emergency Request
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
						Create Emergency Blood Request
					</DialogTitle>
					<DialogDescription>
						Alerts nearby verified donors via email broadcast.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
							Blood Type
						</label>
						<div className="grid grid-cols-4 gap-2">
							{BLOOD_GROUPS.map((v) => (
								<button
									key={v}
									type="button"
									onClick={() => setReqBloodType(v)}
									className={cn(
										"flex items-center justify-center rounded-xl border p-2 transition",
										reqBloodType === v
											? "border-brand bg-brand-light shadow-sm"
											: "border-border bg-card hover:border-brand/30 hover:bg-brand-light/40",
									)}
								>
									<BloodTypeBadge
										bloodGroup={v}
										size="sm"
										variant={reqBloodType === v ? "deep" : "default"}
									/>
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
								Units Needed
							</label>
							<div className="flex items-center gap-3">
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setReqPints((n) => Math.max(1, n - 1))
									}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<Input
									type="number"
									min={1}
									max={20}
									value={reqPints}
									onChange={(e) => setReqPints(parseInt(e.target.value) || 1)}
									className="h-9 w-20 text-center text-base font-semibold"
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										setReqPints((n) => Math.min(20, n + 1))
									}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<p className="mt-2 text-xs text-muted-foreground">
								Adult patient: 1 unit raises hemoglobin by ~1 g/dL
							</p>
						</div>

						<div>
							<div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
								<span className="font-medium uppercase tracking-wider">
									Search Radius
								</span>
								<span className="font-semibold text-foreground">
									{searchRadius} km
								</span>
							</div>
							<input
								type="range"
								min={5}
								max={25}
								step={5}
								value={searchRadius}
								onChange={(e) => setSearchRadius(Number(e.target.value))}
								className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand"
							/>
							<div className="flex justify-between text-[10px] text-muted-foreground mt-1">
								<span>5 km</span>
								<span>25 km</span>
							</div>
						</div>
					</div>

					<div>
						<label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
							Urgency Level
						</label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setReqUrgency("standard")}
								className={cn(
									"rounded-xl border p-3 text-left transition",
									reqUrgency === "standard"
										? "border-status-low/40 bg-status-low-bg shadow-sm"
										: "border-border bg-card hover:border-status-low/30 hover:bg-status-low-bg/40",
								)}
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
								onClick={() => setReqUrgency("critical")}
								className={cn(
									"rounded-xl border p-3 text-left transition",
									reqUrgency === "critical"
										? "border-brand/40 bg-brand-light shadow-sm"
										: "border-border bg-card hover:border-brand/30 hover:bg-brand-light/40",
								)}
							>
								<span className="flex items-center gap-1.5 text-sm font-semibold text-brand">
									<Droplet className="h-4 w-4" />
									Critical
								</span>
								<p className="text-xs text-muted-foreground mt-0.5">
									Immediate response needed
								</p>
							</button>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							<Send className="h-4 w-4" />
							{isSubmitting
								? "Broadcasting..."
								: `Broadcast ${displayBloodGroup(reqBloodType)} Request`}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
