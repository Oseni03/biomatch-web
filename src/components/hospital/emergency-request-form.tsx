"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Plus, Minus, Droplet } from "lucide-react";
import { authClient } from "@/lib/auth-client";
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
import { createBloodRequest } from "@/servers/requests";
import { formatBloodGroup } from "@/lib/blood-compatibility";
import { MATCH_START_RADIUS_KM } from "@/lib/config";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface EmergencyRequestFormProps {
	organizationId: string;
}

export function EmergencyRequestForm({ organizationId }: EmergencyRequestFormProps) {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const callerUserId = session?.user?.id ?? "";
	const [open, setOpen] = useState(false);
	const [reqBloodType, setReqBloodType] = useState("O_POS");
	const [reqPints, setReqPints] = useState(2);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const resetForm = () => {
		setReqBloodType("O_POS");
		setReqPints(2);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (reqPints < 1 || reqPints > 100) {
			toast.error("Units must be between 1 and 100");
			return;
		}
		setIsSubmitting(true);

		try {
			const res = await createBloodRequest(organizationId, callerUserId, {
				bloodGroup: reqBloodType,
				unitsRequired: reqPints,
			});

			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["pending-emergency-requests"] }),
				queryClient.invalidateQueries({ queryKey: ["emergency-history"] }),
			]);
			toast.success(
				res.matchedDonorCount > 0
					? `Emergency broadcast sent to ${res.matchedDonorCount} donor${res.matchedDonorCount !== 1 ? "s" : ""}.`
					: "Emergency request created — no eligible donors found in range.",
			);
			setOpen(false);
			resetForm();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create request. Please try again.");
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
						All requests are urgent. Compatible verified donors nearby are
						notified immediately.
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
								max={100}
								value={reqPints}
								onChange={(e) => setReqPints(parseInt(e.target.value) || 1)}
								className="h-9 w-20 text-center text-base font-semibold"
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={() =>
									setReqPints((n) => Math.min(100, n + 1))
								}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<p className="mt-2 text-xs text-muted-foreground">
							Adult patient: 1 unit raises hemoglobin by ~1 g/dL. Donors within{" "}
							{MATCH_START_RADIUS_KM} km are notified at once; the search widens
							automatically if more units are still needed.
						</p>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || !callerUserId}>
							<Send className="h-4 w-4" />
							{isSubmitting
								? "Broadcasting..."
								: `Broadcast ${formatBloodGroup(reqBloodType)} Request`}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
