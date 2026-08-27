"use client";

import { useState } from "react";
import { Send, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
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

export function EmergencyRequestForm({ organizationId }: EmergencyRequestFormProps) {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [reqBloodType, setReqBloodType] = useState("O+");
	const [reqUrgency, setReqUrgency] = useState<"standard" | "critical">("critical");
	const [reqPints, setReqPints] = useState(2);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			await createEmergencyRequest({
				organizationId,
				bloodGroup: BG_ENUM[reqBloodType],
				unitsNeeded: reqPints,
				urgencyLevel: reqUrgency,
			});

			toast.success("Emergency request created! Donors are being alerted.");
			setShowCreateForm(false);
		} catch (err) {
			toast.error("Failed to create request. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!showCreateForm) {
		return (
			<div className="flex justify-end">
				<Button
					size="lg"
					onClick={() => setShowCreateForm(true)}
					className="shadow-md"
				>
					<Plus className="h-4 w-4" />
					Create Emergency Request
				</Button>
			</div>
		);
	}

	return (
		<Card className="bg-card border-border rounded-2xl p-6 mb-8 shadow-sm">
			<div className="mb-6">
				<h2 className="text-lg font-semibold tracking-tight">
					Create Emergency Request
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					This alerts all nearby compatible donors matching the blood criteria.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-3 gap-6"
			>
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
							onChange={(e) => setReqPints(parseInt(e.target.value) || 1)}
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

				<div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t border-border">
					<Button
						type="button"
						variant="outline"
						onClick={() => setShowCreateForm(false)}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						<Send className="h-4 w-4" />
						{isSubmitting ? "Creating..." : "Create Request"}
					</Button>
				</div>
			</form>
		</Card>
	);
}
