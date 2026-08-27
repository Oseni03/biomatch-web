"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { signUpWithProfile } from "@/servers/auth";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";

const STATS = [
	{ value: "2.3x", label: "Faster response" },
	{ value: "94%", label: "Donor activation" },
	{ value: "99.2%", label: "Match accuracy" },
];

export default function SignupPage() {
	const router = useRouter();
	const [role, setRole] = useState<"donor" | "hospital">("donor");
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

		toast.success("Registration successful! Check your inbox to verify your email.");
		router.push(`/auth/login?email=${encodeURIComponent(email)}`);
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
			stats={STATS}
		>
			<Card className="rounded-3xl p-2">
				<CardHeader className="relative pb-2 pt-6 text-center">
					<div className="mx-auto mb-4 flex h-10 w-10 scale-100 items-center justify-center rounded-2xl bg-brand transition-transform duration-300 hover:scale-105">
						<BloodDropIcon className="h-5 w-5 text-white" />
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tighter">
						Join the Network
					</CardTitle>
					<CardDescription className="mt-2 text-sm text-muted-foreground">
						Create your account and finish the rest of onboarding after verification.
					</CardDescription>
				</CardHeader>

				<CardContent className="p-6 pt-0">
					<div className="relative mb-8 grid grid-cols-2 gap-2 rounded-2xl border-border bg-muted p-1.5">
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

					<form onSubmit={handleSubmit} className="relative space-y-6">
						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								{role === "donor" ? "Full Name" : "Hospital Name"} *
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={
									role === "donor"
										? "e.g. David Adebayo"
										: "e.g. Red Cross Hospital"
								}
								className="w-full rounded-xl border-border bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								required
							/>
						</div>

						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Email Address *
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full rounded-xl border-border bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								required
							/>
						</div>

						<div>
							<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
								Password *
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="At least 6 characters"
									className="w-full rounded-xl border-border bg-muted px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

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
								className="font-medium text-brand hover:text-brand-hover"
							>
								Sign In
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</AuthShell>
	);
}
