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
import { Input } from "@/components/ui/input";

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

const AVAILABILITY_OPTIONS = [
	{ value: "weekdays", label: "Weekdays" },
	{ value: "weekends", label: "Weekends" },
	{ value: "mornings", label: "Mornings" },
	{ value: "afternoons", label: "Afternoons" },
	{ value: "evenings", label: "Evenings" },
	{ value: "anytime", label: "Anytime" },
] as const;

const BG_ENUM_REVERSE: Record<string, string> = {
	"A+": "A_PLUS",
	"A-": "A_MINUS",
	"B+": "B_PLUS",
	"B-": "B_MINUS",
	"AB+": "AB_PLUS",
	"AB-": "AB_MINUS",
	"O+": "O_PLUS",
	"O-": "O_MINUS",
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
	const [step, setStep] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const [bloodGroup, setBloodGroup] = useState("");
	const [phone, setPhone] = useState("");
	const [location, setLocation] = useState("");
	const [availability, setAvailability] = useState("");
	const [heightCm, setHeightCm] = useState("");
	const [weightKg, setWeightKg] = useState("");
	const [bloodPressure, setBloodPressure] = useState("");
	const [restingHeartRate, setRestingHeartRate] = useState("");
	const [orgName, setOrgName] = useState("");

	const reset = () => {
		setStep(0);
		setBloodGroup("");
		setPhone("");
		setLocation("");
		setAvailability("");
		setHeightCm("");
		setWeightKg("");
		setBloodPressure("");
		setRestingHeartRate("");
		setOrgName("");
		setIsLoading(false);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const validateDonorStep = (s: number): boolean => {
		if (s === 0 && !bloodGroup) {
			toast.error("Please select your blood group");
			return false;
		}
		if (s === 1 && !location.trim()) {
			toast.error("Please enter your location");
			return false;
		}
		if (s === 2 && !availability) {
			toast.error("Please select your availability");
			return false;
		}
		if (s === 3) {
			if (!heightCm.trim() || !weightKg.trim() || !bloodPressure.trim() || !restingHeartRate.trim()) {
				toast.error("Please fill in all health metrics");
				return false;
			}
		}
		return true;
	};

	const validateHospitalStep = (s: number): boolean => {
		if (s === 0 && !orgName.trim()) {
			toast.error("Please enter your organization name");
			return false;
		}
		if (s === 1 && !location.trim()) {
			toast.error("Please enter your location");
			return false;
		}
		return true;
	};

	const canProceed = (): boolean => {
		if (role === "donor") return validateDonorStep(step);
		if (role === "hospital") return validateHospitalStep(step);
		return true;
	};

	const isLastStep = (): boolean => {
		if (role === "donor") return step === 3;
		if (role === "hospital") return step === 1;
		return true;
	};

	const handleNext = () => {
		if (!canProceed()) return;
		if (isLastStep()) {
			handleSubmit();
		} else {
			setStep((s) => s + 1);
		}
	};

	const handleBack = () => {
		setStep((s) => s - 1);
	};

	const handleSubmit = async () => {
		if (!userId) return;

		setIsLoading(true);

		const updateData: Record<string, unknown> = {};

		if (role === "donor") {
			updateData.bloodGroup = BG_ENUM_REVERSE[bloodGroup] || bloodGroup;
			if (phone.trim()) {
				updateData.updatedHealthInfo = {
					...(typeof updateData.updatedHealthInfo === "object" && updateData.updatedHealthInfo !== null
						? updateData.updatedHealthInfo
						: {}),
					phone: phone.trim(),
				};
			}
			updateData.location = location.trim();
			updateData.availability = availability;

			const healthInfo: Record<string, unknown> = {
				...(typeof updateData.updatedHealthInfo === "object" && updateData.updatedHealthInfo !== null
					? updateData.updatedHealthInfo
					: {}),
				height_cm: heightCm.trim(),
				weight_kg: weightKg.trim(),
				blood_pressure: bloodPressure.trim(),
				resting_heart_rate: restingHeartRate.trim(),
			};
			updateData.updatedHealthInfo = healthInfo;
		}

		if (role === "hospital") {
			updateData.name = orgName.trim();
			updateData.location = location.trim();
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

			handleClose();
		} catch (err) {
			toast.error("Failed to save profile. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	const donorSteps = [
		{ title: "Blood Group", description: "Select your blood type and add a contact number." },
		{ title: "Location", description: "Where are you located? This helps us match you with nearby emergencies." },
		{ title: "Availability", description: "When are you typically available to donate?" },
		{ title: "Health Info", description: "Basic health metrics to ensure safe matching." },
	];

	const hospitalSteps = [
		{ title: "Organization", description: "Confirm your hospital or organization name." },
		{ title: "Location", description: "Where is your hospital located?" },
	];

	const steps = role === "donor" ? donorSteps : hospitalSteps;
	const currentStep = steps[step];

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent showCloseButton={false} className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{currentStep.title}</DialogTitle>
					<DialogDescription>{currentStep.description}</DialogDescription>
				</DialogHeader>

				<div className="flex items-center gap-2 mb-6">
					{steps.map((_, i) => (
						<div
							key={i}
							className={`h-1 flex-1 rounded-full transition-colors ${
								i <= step ? "bg-brand" : "bg-muted"
							}`}
						/>
					))}
				</div>

				<div className="space-y-5">
					{role === "donor" && step === 0 && (
						<>
							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Blood Group <span className="text-brand">*</span>
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
								<Input
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="08012345678"
								/>
							</div>
						</>
					)}

					{role === "donor" && step === 1 && (
						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Your Location <span className="text-brand">*</span>
							</label>
							<Input
								type="text"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder="e.g. Lagos, Nigeria"
							/>
						</div>
					)}

					{role === "donor" && step === 2 && (
						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Availability <span className="text-brand">*</span>
							</label>
							<div className="grid grid-cols-2 gap-2">
								{AVAILABILITY_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => setAvailability(opt.value)}
										className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
											availability === opt.value
												? "border-brand bg-brand-light text-brand"
												: "border-border bg-muted text-muted-foreground hover:border-brand/50"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					)}

					{role === "donor" && step === 3 && (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Height (cm) <span className="text-brand">*</span>
								</label>
								<Input
									type="text"
									inputMode="numeric"
									value={heightCm}
									onChange={(e) => setHeightCm(e.target.value)}
									placeholder="170"
								/>
							</div>
							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Weight (kg) <span className="text-brand">*</span>
								</label>
								<Input
									type="text"
									inputMode="numeric"
									value={weightKg}
									onChange={(e) => setWeightKg(e.target.value)}
									placeholder="70"
								/>
							</div>
							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Blood Pressure <span className="text-brand">*</span>
								</label>
								<Input
									type="text"
									value={bloodPressure}
									onChange={(e) => setBloodPressure(e.target.value)}
									placeholder="120/80"
								/>
							</div>
							<div>
								<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
									Resting Heart Rate <span className="text-brand">*</span>
								</label>
								<Input
									type="text"
									inputMode="numeric"
									value={restingHeartRate}
									onChange={(e) => setRestingHeartRate(e.target.value)}
									placeholder="72"
								/>
							</div>
						</div>
					)}

					{role === "hospital" && step === 0 && (
						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Organization Name <span className="text-brand">*</span>
							</label>
							<Input
								type="text"
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								placeholder="e.g. Red Cross Hospital"
								required
							/>
						</div>
					)}

					{role === "hospital" && step === 1 && (
						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Location <span className="text-brand">*</span>
							</label>
							<Input
								type="text"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder="e.g. Lagos, Nigeria"
							/>
						</div>
					)}

					<div className="flex gap-3 pt-2">
						{step > 0 && (
							<Button
								type="button"
								variant="outline"
								onClick={handleBack}
								className="flex-1 rounded-2xl py-6 text-sm font-medium"
							>
								Back
							</Button>
						)}
						<Button
							type="button"
							onClick={handleNext}
							disabled={isLoading}
							className="flex-1 rounded-2xl py-6 text-sm font-medium"
						>
							{isLoading
								? "Saving..."
								: isLastStep()
									? "Complete Setup"
									: "Next"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
