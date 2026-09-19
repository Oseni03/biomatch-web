"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthSelect } from "@/components/auth/auth-select";
import { PasswordField } from "@/components/auth/password-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import {
	BLOOD_GROUP_OPTIONS,
	BLOOD_GROUP_UNKNOWN,
	DEFAULT_HOSPITAL,
} from "@/components/auth/donor-constants";
import { DonorStepper } from "@/components/auth/donor-stepper";
import { DonorAlertStep, DonorScreeningStep } from "@/components/auth/donor-steps";
import { signUpWithProfile } from "@/servers/auth";
import { toast } from "sonner";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

type Role = "donor" | "hospital";

// Numbered to match the stepper: step 1 (Choose Role) is the toggle on the
// details screen, so the donor flow starts at 2.
type DonorStep = 2 | 3 | 4;

const DONOR_HOME = "/donor";
const HOSPITAL_NEXT = "/auth/onboarding";
const PHONE_PATTERN = /^\+?[0-9\s-]{10,15}$/;

function getFormCopy(role: Role, step: DonorStep) {
	if (role === "hospital") {
		return {
			title: "Join the Network",
			subtitle: "Create your account and finish the rest of onboarding after verification.",
		};
	}
	if (step === 2) {
		return {
			title: "Join the Network",
			subtitle: "Tell us who you are so hospitals can reach you in an emergency.",
		};
	}
	if (step === 3) {
		return {
			title: "Choose Your Screening Hospital",
			subtitle: "Staff there will screen you before your first donation.",
		};
	}
	return {
		title: "Your Digital Donor Pass",
		subtitle: "Review your pass and alert settings, then create your account.",
	};
}

function SignupContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [role, setRole] = useState<Role>(
		searchParams.get("role") === "hospital" ? "hospital" : "donor",
	);
	const [step, setStep] = useState<DonorStep>(2);

	// Account
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// Donor profile
	const [phone, setPhone] = useState("");
	const [bloodGroup, setBloodGroup] = useState(BLOOD_GROUP_UNKNOWN);
	const [preferredHospital, setPreferredHospital] = useState(DEFAULT_HOSPITAL);
	const [emergencyOnly, setEmergencyOnly] = useState(true);
	const [passId] = useState(
		() => `BMD-${Math.floor(10000 + Math.random() * 90000)}`,
	);

	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const isDonor = role === "donor";
	const showAccountFields = !isDonor || step === 2;
	const copy = getFormCopy(role, step);

	const handleRoleChange = (next: Role) => {
		setRole(next);
		setStep(2);
		setError("");
	};

	const handleBack = () => {
		setError("");
		setStep((current) => (current - 1) as DonorStep);
	};

	const validateDetails = () => {
		if (!name || !email || !password || (isDonor && !phone)) {
			return "Please complete all required fields";
		}
		if (password.length < 6) {
			return "Password must be at least 6 characters";
		}
		if (isDonor && !PHONE_PATTERN.test(phone.trim())) {
			return "Enter a valid phone number, e.g. +234 800 000 0000";
		}
		return "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Donor steps 2 and 3 only move forward; the account is created on step 4.
		if (isDonor && step < 4) {
			if (step === 2) {
				const message = validateDetails();
				if (message) {
					setError(message);
					return;
				}
			}
			setStep((step + 1) as DonorStep);
			return;
		}

		const message = validateDetails();
		if (message) {
			setError(message);
			if (isDonor) setStep(2);
			return;
		}

		setIsLoading(true);

		const result = await signUpWithProfile({
			email,
			password,
			fullName: name,
			role,
			donorProfile: isDonor
				? { phone: phone.trim(), bloodGroup, preferredHospital, emergencyOnly }
				: undefined,
		});

		if (result?.error) {
			setError(result.error);
			setIsLoading(false);
			return;
		}

		if (isDonor) {
			toast.success("You're registered as a donor. Your pass is ready on your dashboard.");
			router.push(DONOR_HOME);
		} else {
			toast.success("Registration successful! Complete your profile to continue.");
			router.push(HOSPITAL_NEXT);
		}
	};

	const submitLabel = !isDonor
		? isLoading
			? "Creating Account..."
			: "Register as Hospital Partner"
		: step < 4
			? "Continue"
			: isLoading
				? "Creating Account..."
				: "Create Account";

	return (
		<AuthShell
			eyebrow="Join The Network"
			headline={
				<>
					Every match starts
					<br />
					with <span className="italic text-brand">one signup.</span>
				</>
			}
			description="Create your account with email and password. Donors add their blood group, screening hospital, and alert preferences as part of signup, while hospitals can start creating requests once their org is set up."
			stats={AUTH_STATS}
		>
			<AuthForm
				title={copy.title}
				subtitle={copy.subtitle}
				error={error}
				onSubmit={handleSubmit}
				footer={
					<div className="mt-8 border-t border-border pt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Already registered?{" "}
							<Link
								href="/auth/login"
								className="font-medium text-brand transition-colors hover:text-brand-hover"
							>
								Sign In
							</Link>
						</p>
					</div>
				}
			>
				{isDonor && <DonorStepper currentStep={step} />}

				{showAccountFields && (
					<>
						<div className="relative mb-6 grid grid-cols-2 gap-2 rounded-2xl border-border bg-muted p-1.5">
							<button
								type="button"
								aria-pressed={role === "donor"}
								onClick={() => handleRoleChange("donor")}
								className={`cursor-pointer rounded-xl py-3 text-sm font-medium transition-all duration-300 ${role === "donor"
									? "bg-card font-semibold text-brand shadow-sm"
									: "text-muted-foreground hover:text-foreground"
									}`}
							>
								Become a Donor
							</button>
							<button
								type="button"
								aria-pressed={role === "hospital"}
								onClick={() => handleRoleChange("hospital")}
								className={`cursor-pointer rounded-xl py-3 text-sm font-medium transition-all duration-300 ${role === "hospital"
									? "bg-card font-semibold text-brand shadow-sm"
									: "text-muted-foreground hover:text-foreground"
									}`}
							>
								Hospital Partner
							</button>
						</div>

						<AuthInput
							id="signup-name"
							label={isDonor ? "Full Name" : "Hospital Name"}
							requiredIndicator
							leftIcon={<User className="h-4 w-4" />}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={isDonor ? "e.g. David Adebayo" : "e.g. Red Cross Hospital"}
							autoComplete="name"
						/>
						<AuthInput
							id="signup-email"
							label="Email Address"
							requiredIndicator
							leftIcon={<Mail className="h-4 w-4" />}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							autoComplete="email"
						/>

						{isDonor && (
							<>
								<AuthInput
									id="signup-phone"
									label="Phone Number"
									requiredIndicator
									leftIcon={<Phone className="h-4 w-4" />}
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="+234 800 000 0000"
									autoComplete="tel"
								/>
								<AuthSelect
									id="signup-blood-group"
									label="Blood Group"
									value={bloodGroup}
									onChange={(e) => setBloodGroup(e.target.value)}
									options={BLOOD_GROUP_OPTIONS}
								/>
							</>
						)}

						<PasswordField
							id="signup-password"
							label="Password"
							requiredIndicator
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="At least 6 characters"
							autoComplete="new-password"
						/>
					</>
				)}

				{isDonor && step === 3 && (
					<DonorScreeningStep
						hospital={preferredHospital}
						onHospitalChange={setPreferredHospital}
					/>
				)}

				{isDonor && step === 4 && (
					<DonorAlertStep
						fullName={name}
						phone={phone.trim()}
						bloodGroup={bloodGroup}
						passId={passId}
						emergencyOnly={emergencyOnly}
						onEmergencyOnlyChange={setEmergencyOnly}
					/>
				)}

				<div className="flex gap-3">
					{isDonor && step > 2 && (
						<Button
							type="button"
							variant="outline"
							disabled={isLoading}
							onClick={handleBack}
							className="rounded-2xl py-6 text-sm font-medium"
						>
							Back
						</Button>
					)}
					<Button
						type="submit"
						disabled={isLoading}
						className="flex-1 rounded-2xl py-6 text-sm font-medium"
					>
						{submitLabel}
					</Button>
				</div>
			</AuthForm>
		</AuthShell>
	);
}

export default function SignupPage() {
	return (
		<Suspense fallback={null}>
			<SignupContent />
		</Suspense>
	);
}
