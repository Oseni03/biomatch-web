"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import { signUpWithProfile } from "@/servers/auth";
import { toast } from "sonner";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

type Role = "donor" | "hospital";

export default function SignupPage() {
	const router = useRouter();
	const [role, setRole] = useState<Role>("donor");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name || !email || !password) {
			setError("Please complete all required fields");
			return;
		}

		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);

		const result = await signUpWithProfile({
			email,
			password,
			fullName: name,
			role,
		});

		if (result?.error) {
			setError(result.error);
			setIsLoading(false);
			return;
		}

		toast.success("Registration successful! Complete your profile to continue.");
		router.push("/auth/onboarding");
	};

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
			description="Create your account with email and password. Donors complete their profile and availability details after signup, while hospitals can start creating requests once their org is set up."
			stats={AUTH_STATS}
		>
			<AuthCard
				icon={<BloodDropIcon className="h-5 w-5 text-white" />}
				title="Join the Network"
				description="Create your account and finish the rest of onboarding after verification."
			>
				<div className="relative mb-6 grid grid-cols-2 gap-2 rounded-2xl border-border bg-muted p-1.5">
					<button
						type="button"
						onClick={() => {
							setRole("donor");
							setError("");
						}}
						className={`cursor-pointer rounded-xl py-3 text-sm font-medium transition-all duration-300 ${
							role === "donor"
								? "bg-card font-semibold text-brand shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Become a Donor
					</button>
					<button
						type="button"
						onClick={() => {
							setRole("hospital");
							setError("");
						}}
						className={`cursor-pointer rounded-xl py-3 text-sm font-medium transition-all duration-300 ${
							role === "hospital"
								? "bg-card font-semibold text-brand shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Hospital Partner
					</button>
				</div>

				{error && (
					<div className="mb-6 rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					<AuthFormField
						label={role === "donor" ? "Full Name" : "Hospital Name"}
						value={name}
						onChange={setName}
						placeholder={role === "donor" ? "e.g. David Adebayo" : "e.g. Red Cross Hospital"}
						required
					/>
					<AuthFormField
						label="Email Address"
						icon="mail"
						type="email"
						value={email}
						onChange={setEmail}
						placeholder="you@example.com"
						required
					/>
					<AuthFormField
						label="Password"
						icon="lock"
						type="password"
						value={password}
						onChange={setPassword}
						placeholder="At least 6 characters"
						required
					/>

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-2xl py-6 text-sm font-medium"
					>
						{isLoading
							? "Creating Account..."
							: `Register as ${role === "donor" ? "Donor" : "Hospital Partner"}`}
					</Button>
				</form>

				<div className="mt-8 border-t border-border pt-6 text-center">
					<p className="text-sm text-muted-foreground">
						Already registered?{" "}
						<Link
							href="/auth/login"
							className="font-medium text-brand hover:text-brand-hover transition-colors"
						>
							Sign In
						</Link>
					</p>
				</div>
			</AuthCard>
		</AuthShell>
	);
}
