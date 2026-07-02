import { useState } from "react";
import { Send, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { EmergencyMatchRequest } from "@/lib/donor-types";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface EmergencyRequestFormProps {
	hospitalName: string;
	hospitalLocation: string;
	hospitalPhone: string;
	onSubmit: (req: EmergencyMatchRequest) => void;
}

export function EmergencyRequestForm({
	hospitalName,
	hospitalLocation,
	hospitalPhone,
	onSubmit,
}: EmergencyRequestFormProps) {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [reqBloodType, setReqBloodType] = useState("O+");
	const [reqLocation, setReqLocation] = useState(
		hospitalLocation || "Ikeja, Lagos",
	);
	const [reqUrgency, setReqUrgency] = useState<
		"critical" | "high" | "medium"
	>("critical");
	const [reqPints, setReqPints] = useState(2);
	const [reqPhone, setReqPhone] = useState(hospitalPhone || "08098765432");
	const [formSuccess, setFormSuccess] = useState("");

	const handleCreateRequestSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFormSuccess("");

		const newRequest: EmergencyMatchRequest = {
			id: "req-" + Math.random().toString(36).substr(2, 9),
			bloodType: reqBloodType,
			hospitalName,
			location: reqLocation,
			urgency: reqUrgency,
			requiredPints: reqPints,
			contactPhone: reqPhone,
			timestamp: new Date().toISOString(),
			status: "pending",
		};

		onSubmit(newRequest);
		setFormSuccess(
			"Emergency Live Broadcast triggered! Nearby compatible donors alerted via Push & SMS.",
		);

		setTimeout(() => {
			setShowCreateForm(false);
			setFormSuccess("");
		}, 2500);
	};

	if (!showCreateForm) {
		return (
			<div className="flex justify-end">
				<button
					onClick={() => setShowCreateForm(true)}
					className="bg-brand hover:bg-brand-hover text-white text-xs font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition"
				>
					<Plus className="h-4 w-4" />
					Launch Emergency Match Request
				</button>
			</div>
		);
	}

	return (
		<Card className="bg-card border-border rounded-3xl p-8 mb-8 animate-in slide-in-from-top-4 duration-300 shadow-lg">
			<h2 className="text-xl font-bold tracking-tight mb-2">
				Publish Immediate Emergency Match Request
			</h2>
			<p className="text-muted-foreground text-xs mb-6">
				This triggers instant emergency broadcasts across the bio
				network, alerting all nearby voluntary donors matching the blood
				criteria.
			</p>

			{formSuccess && (
				<div className="p-4 mb-6 text-xs text-green-700 bg-green-50 border border-green-200 rounded-2xl animate-fade-in">
					{formSuccess}
				</div>
			)}

			<form
				onSubmit={handleCreateRequestSubmit}
				className="grid grid-cols-1 md:grid-cols-4 gap-6"
			>
				<div>
					<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
						Required Blood Type
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
						Location Address
					</label>
					<input
						type="text"
						value={reqLocation}
						onChange={(e) => setReqLocation(e.target.value)}
						className="w-full px-4 py-3 bg-muted border-border rounded-xl text-xs focus:outline-none"
						required
					/>
				</div>

				<div>
					<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
						Urgency Level
					</label>
					<select
						value={reqUrgency}
						onChange={(e) =>
							setReqUrgency(
								e.target.value as
									| "critical"
									| "high"
									| "medium",
							)
						}
						className="w-full px-4 py-3 bg-muted border-border rounded-xl text-xs focus:outline-none"
					>
						<option value="critical">
							Critical (Simultaneous Push & SMS)
						</option>
						<option value="high">High (&lt; 2 Hours)</option>
						<option value="medium">Medium (Scheduled)</option>
					</select>
				</div>

				<div>
					<label className="block text-xs font-mono tracking-wider text-muted-foreground uppercase mb-2">
						Required Pints
					</label>
					<input
						type="number"
						min="1"
						max="10"
						value={reqPints}
						onChange={(e) =>
							setReqPints(parseInt(e.target.value) || 1)
						}
						className="w-full px-4 py-3 bg-muted border-border rounded-xl text-xs focus:outline-none"
					/>
				</div>

				<div className="md:col-span-4 flex justify-end gap-3 mt-4 pt-4 border-t border-border">
					<button
						type="button"
						onClick={() => setShowCreateForm(false)}
						className="px-5 py-3 rounded-2xl border-border text-xs hover:bg-muted transition"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-medium rounded-2xl text-xs shadow flex items-center gap-2"
					>
						<Send className="h-4 w-4" />
						Launch Live Broadcast
					</button>
				</div>
			</form>
		</Card>
	);
}
