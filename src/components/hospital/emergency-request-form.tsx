"use client";

import { useState } from "react";
import { Send, Minus, Plus, CheckCircle2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BloodTypeBadge } from "@/components/brand/blood-type-badge";
import { createEmergencyRequest } from "@/servers/emergency";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BG_ENUM: Record<string, string> = {
	"A+": "A_PLUS",
	"A-": "A_MINUS",
	"B+": "B_PLUS",
	"B-": "B_MINUS",
	"AB+": "AB_PLUS",
	"AB-": "AB_MINUS",
	"O+": "O_PLUS",
	"O-": "O_MINUS",
};

interface EmergencyRequestFormProps {
	organizationId: string;
}

interface SubmitResult {
	matchedDonorCount: number;
	hospitalName: string;
}

export function EmergencyRequestForm({ organizationId }: EmergencyRequestFormProps) {
	const [open, setOpen] = useState(false);
	const [reqBloodType, setReqBloodType] = useState("O+");
	const [reqUrgency, setReqUrgency] = useState<"standard" | "critical">("critical");
	const [reqPints, setReqPints] = useState(2);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [result, setResult] = useState<SubmitResult | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setResult(null);

		try {
			const res = await createEmergencyRequest({
				organizationId,
				bloodGroup: BG_ENUM[reqBloodType],
				unitsNeeded: reqPints,
				urgencyLevel: reqUrgency,
			});

			setResult({
				matchedDonorCount: res.matchedDonorCount,
				hospitalName: res.hospitalName,
			});
		} catch (err) {
			toast.error("Failed to create request. Please try again.");
			setOpen(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetForm = () => {
		setResult(null);
		setReqBloodType("O+");
		setReqUrgency("critical");
		setReqPints(2);
	};

	return (
		<div className="flex justify-end">
			<Dialog open={open} onOpenChange={(next) => {
				setOpen(next);
				if (!next) resetForm();
			}}>
				<DialogTrigger asChild>
					<Button size="lg" className="shadow-md">
						<Plus className="h-4 w-4" />
						Create Emergency Request
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-xl">
					<DialogHeader>
						<DialogTitle>Create Emergency Request</DialogTitle>
						<DialogDescription>
							This alerts all nearby compatible donors matching the blood criteria.
						</DialogDescription>
					</DialogHeader>

					{result ? (
						<div className="flex flex-col items-center text-center gap-4 py-6">
							<div className="w-14 h-14 bg-status-ok-bg rounded-full flex items-center justify-center text-status-ok">
								<CheckCircle2 className="h-7 w-7" />
							</div>
							<div>
								<h3 className="text-lg font-semibold tracking-tight">Request Broadcasted</h3>
								<p className="mt-1.5 text-sm text-muted-foreground">
									<span className="font-semibold text-foreground">{result.matchedDonorCount}</span>{" "}
									compatible donor{result.matchedDonorCount !== 1 ? "s" : ""} have been alerted in your area
								</p>
							</div>
							<div className="flex gap-3 justify-center w-full">
								<Button
									variant="outline"
									onClick={resetForm}
								>
									Create Another
								</Button>
								<Button onClick={() => setOpen(false)}>
									Done
								</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
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
											Critical
										</span>
										<p className="text-xs text-muted-foreground mt-0.5">
											Immediate response needed
										</p>
									</button>
								</div>
							</div>

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
										max={10}
										value={reqPints}
										onChange={(e) => parseInt(e.target.value) || 1}
										className="h-9 w-20 text-center text-base font-semibold"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={() =>
											setReqPints((n) => Math.min(10, n + 1))
										}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<p className="mt-2 text-xs text-muted-foreground">
									Adult patient: 1 unit raises hemoglobin by ~1 g/dL
								</p>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-border">
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									<Send className="h-4 w-4" />
									{isSubmitting ? "Broadcasting..." : "Broadcast Emergency Request"}
								</Button>
							</div>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
