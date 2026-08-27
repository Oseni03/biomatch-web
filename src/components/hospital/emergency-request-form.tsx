"use client";

import { useState } from "react";
import { Send, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createEmergencyRequest } from "@/servers/emergency";
import { toast } from "sonner";

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
		<Card className="bg-card border-border rounded-xl p-8 mb-8 shadow-lg">
			<h2 className="text-xl font-bold tracking-tight mb-2">
				Create Emergency Request
			</h2>
			<p className="text-muted-foreground text-xs mb-6">
				This alerts all nearby compatible donors matching the blood criteria.
			</p>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-3 gap-6"
			>
				<div>
					<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
						Blood Type
					</label>
					<select
						value={reqBloodType}
						onChange={(e) => setReqBloodType(e.target.value)}
						className="w-full px-4 py-3 bg-muted border-border rounded-xl text-xs focus:outline-none"
					>
						{BLOOD_GROUPS.map((v) => (
							<option key={v} value={v}>
								{v} Group
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
						Urgency Level
					</label>
					<select
						value={reqUrgency}
						onChange={(e) =>
							setReqUrgency(e.target.value as "standard" | "critical")
						}
						className="w-full px-4 py-3 bg-muted border-border rounded-xl text-xs focus:outline-none"
					>
						<option value="critical">Critical</option>
						<option value="standard">Standard</option>
					</select>
				</div>

				<div>
					<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
						Units Needed
					</label>
					<input
						type="number"
						min="1"
						max="10"
						value={reqPints}
						onChange={(e) => setReqPints(parseInt(e.target.value) || 1)}
						className="w-full px-4 py-3 bg-muted border-border rounded-xl text-xs focus:outline-none"
					/>
				</div>

				<div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t border-border">
					<Button
						type="button"
						variant="outline"
						size="lg"
						onClick={() => setShowCreateForm(false)}
					>
						Cancel
					</Button>
					<Button type="submit" size="lg" className="shadow" disabled={isSubmitting}>
						<Send className="h-4 w-4" />
						{isSubmitting ? "Creating..." : "Create Request"}
					</Button>
				</div>
			</form>
		</Card>
	);
}
