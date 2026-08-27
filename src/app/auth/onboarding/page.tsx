"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import { authClient } from "@/lib/auth-client";
import { updateUserProfile } from "@/servers/user";
import { toast } from "sonner";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

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

export default function OnboardingPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const role = session?.user?.role;

	const [bloodGroup, setBloodGroup] = useState("");
	const [phone, setPhone] = useState("");
	const [orgName, setOrgName] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!session?.user?.id) return;

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
			await updateUserProfile(session.user.id, updateData as any);

			if (role === "hospital") {
				toast.success("Organization created. You can now create emergency requests.");
			} else {
				toast.success("Profile complete. You can now respond to emergency requests.");
			}

			router.push(role === "hospital" ? "/hospital" : "/donor");
		} catch (err) {
			toast.error("Failed to save profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isPending) {
		return null;
	}

	if (!session?.user) {
		router.push("/auth/login");
		return null;
	}

	if (role !== "donor" && role !== "hospital") {
		router.push("/");
		return null;
	}

	return (
		<AuthShell
			eyebrow="Complete Your Profile"
			headline={
				<>
					Almost there,
					<br />
					<span className="italic text-brand">a few more details.</span>
				</>
			}
			description={
				role === "donor"
					? "Tell us your blood group so we can match you with emergencies."
					: "Confirm your organization name to start creating emergency requests."
			}
			stats={AUTH_STATS}
		>
			<AuthCard
				icon={<BloodDropIcon className="h-5 w-5 text-white" />}
				title={role === "donor" ? "Donor Profile" : "Hospital Setup"}
				description={
					role === "donor"
						? "This information helps us match you with the right emergencies."
						: "Your organization is ready. Confirm the name to continue."
				}
			>
				<form onSubmit={handleSubmit} className="space-y-5">
					{role === "donor" && (
						<>
							<div>
								<label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Blood Group <span className="text-brand">*</span>
								</label>
								<div className="grid grid-cols-4 gap-2">
									{BLOOD_GROUPS.map((bg) => (
										<button
											key={bg}
											type="button"
											onClick={() => setBloodGroup(bg)}
											className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
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

							<AuthFormField
								label="Phone Number (optional)"
								icon="phone"
								type="tel"
								value={phone}
								onChange={setPhone}
								placeholder="08012345678"
							/>
						</>
					)}

					{role === "hospital" && (
						<AuthFormField
							label="Organization Name"
							value={orgName}
							onChange={setOrgName}
							placeholder="e.g. Red Cross Hospital"
							required
						/>
					)}

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-2xl py-6 text-sm font-medium"
					>
						{isLoading ? "Saving..." : "Complete Setup"}
					</Button>
				</form>
			</AuthCard>
		</AuthShell>
	);
}
