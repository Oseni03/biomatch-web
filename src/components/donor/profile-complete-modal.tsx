"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "@/servers/user";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const BLOOD_GROUPS = [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
] as const;

const BG_ENUM: Record<string, string> = {
	A_PLUS: "A+",
	A_MINUS: "A-",
	B_PLUS: "B+",
	B_MINUS: "B-",
	AB_PLUS: "AB+",
	AB_MINUS: "AB-",
	O_PLUS: "O+",
	O_MINUS: "O-",
};

export function ProfileCompleteModal({
	isOpen,
	onClose,
	userId,
	role,
}: {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	role: "donor" | "hospital" | "admin";
}) {
	const [bloodGroup, setBloodGroup] = useState("");
	const [phone, setPhone] = useState("");
	const [orgName, setOrgName] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!userId) return;

		if (role === "donor" && !bloodGroup) {
			toast.error("Please select your blood group");
			return;
		}
		if (role === "hospital" && !orgName.trim()) {
			toast.error("Please enter your organization name");
			return;
		}

		setIsLoading(true);

		const updateData: Record<string, unknown> = {};
		if (role === "donor") {
			updateData.bloodGroup = BG_ENUM[bloodGroup];
			if (phone.trim()) updateData.updatedHealthInfo = { phone: phone.trim() };
		}

		try {
			await updateUserProfile(userId, updateData as any);

			if (role === "hospital") {
				toast.success(
					"Organization created. You can now create emergency requests.",
				);
			} else {
				toast.success(
					"Profile complete. You can now respond to emergency requests.",
				);
			}

			onClose();
		} catch (err) {
			toast.error("Failed to save profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>
						{role === "donor" ? "Donor Profile" : "Hospital Setup"}
					</DialogTitle>
					<DialogDescription>
						{role === "donor"
							? "This information helps us match you with the right emergencies."
							: "Your organization is ready. Confirm the name to continue."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{role === "donor" && (
						<>
							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Blood Group *
								</label>
								<div className="grid grid-cols-4 gap-2">
									{BLOOD_GROUPS.map((bg) => (
										<button
											key={bg}
											type="button"
											onClick={() => setBloodGroup(bg)}
											className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
												bloodGroup === bg
													? "border-brand bg-brand-light text-brand"
													: "border-border bg-muted text-muted-foreground hover:border-brand/50"
											}`}
										>
											{bg}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Phone Number (optional)
								</label>
								<input
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="08012345678"
									className="w-full rounded-xl border-border bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							</div>
						</>
					)}

					{role === "hospital" && (
						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Organization Name *
							</label>
							<input
								type="text"
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								placeholder="e.g. Red Cross Hospital"
								className="w-full rounded-xl border-border bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								required
							/>
						</div>
					)}

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-2xl py-6 text-sm font-medium"
					>
						{isLoading ? "Saving..." : "Complete Setup"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
