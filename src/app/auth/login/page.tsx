"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordField } from "@/components/auth/password-field";
import { Wordmark } from "@/components/brand/wordmark";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import { authClient } from "@/lib/auth-client";

function LoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState(searchParams.get("email") ?? "");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(
		searchParams.get("verify-required") === "1"
			? "Please verify your email before accessing BioMatch."
			: "",
	);
	const [success, setSuccess] = useState(
		searchParams.get("verified") === "1"
			? "Your email has been verified. You can now sign in."
			: "",
	);
	const [isLoading, setIsLoading] = useState(false);

	const clearAlert = () => {
		setError("");
		setSuccess("");
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		clearAlert();
		setIsLoading(true);

		const { data, error: authError } = await authClient.signIn.email({
			email,
			password,
		});

		if (authError) {
			setError(
				typeof authError === "string"
					? authError
					: (authError as any)?.message ?? "Invalid credentials",
			);
			setIsLoading(false);
			return;
		}

		const role = data?.user.role;

		if (role) {
			router.push(`/${role}`);
		} else {
			setError("Login succeeded but unable to determine your role.");
			setIsLoading(false);
		}
	};

	const handleResendVerification = async () => {
		if (!email.trim()) {
			setError("Enter your email address before requesting a new verification link.");
			return;
		}

		setIsLoading(true);
		clearAlert();

		const response = await fetch("/api/auth/send-verification-email", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: email.trim(),
				callbackURL:
					typeof window !== "undefined"
						? `${window.location.origin}/auth/login?verified=1`
						: undefined,
			}),
		});

		if (!response.ok) {
			setError("We couldn't send a fresh verification link right now. Please try again in a moment.");
			setIsLoading(false);
			return;
		}

		setSuccess("A fresh verification email has been sent. Check your inbox.");
		setIsLoading(false);
	};

	return (
		<AuthShell
			eyebrow="Welcome Back"
			headline={
				<>
					Sign in to the network
					<br />
					that <span className="italic text-brand">saves lives.</span>
				</>
			}
			description="Every donor and hospital on BioMatch is verified in real time — pick up right where you left off."
			stats={AUTH_STATS}
		>
			<Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand transition-transform duration-300 hover:scale-105">
					<BloodDropIcon className="size-5" />
				</div>
				<Wordmark size="lg" className="text-white" />
			</Link>

			<AuthForm
				title="Sign in to BioMATCH"
				subtitle="Access the national emergency blood logistics console or manage your voluntary donor status."
				error={error}
				success={success}
				onClearAlert={clearAlert}
				onSubmit={handleLogin}
				footer={
					<div className="space-y-3">
						<div className="text-sm text-muted-foreground">
							New to BioMATCH?{" "}
							<Link
								href="/auth/signup"
								className="font-medium text-brand transition-colors hover:text-brand-hover"
							>
								Create an account
							</Link>
						</div>
						<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
							<Link
								href="/auth/signup?role=hospital"
								className="transition-colors hover:text-foreground"
							>
								Register Hospital
							</Link>
							<span className="text-muted-foreground/50" aria-hidden>
								•
							</span>
							<Link href="/auth/signup" className="transition-colors hover:text-foreground">
								Register as Blood Donor
							</Link>
						</div>
					</div>
				}
			>
				<AuthInput
					id="login-identifier"
					label="Email Address"
					requiredIndicator
					leftIcon={<Mail className="h-4 w-4" />}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="name@hospital.org or donor@biomatch.test"
					autoComplete="email"
				/>

				<PasswordField
					id="login-password"
					label="Password"
					requiredIndicator
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter your password"
					autoComplete="current-password"
					headerAction={
						<Link
							href="/auth/forgot-password"
							className="text-xs font-medium text-brand transition-colors hover:text-brand-hover"
						>
							Forgot password?
						</Link>
					}
				/>

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isLoading ? "Verifying Credentials..." : "Sign In to BioMATCH"}
					{!isLoading && <ArrowRight className="h-4 w-4" />}
				</Button>

				<Button
					type="button"
					variant="outline"
					disabled={isLoading}
					onClick={handleResendVerification}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					Resend verification email
				</Button>
			</AuthForm>
		</AuthShell>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginContent />
		</Suspense>
	);
}