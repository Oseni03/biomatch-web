"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BloodDropIcon } from "@/components/brand/blood-drop-icon";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthFormField } from "@/components/auth/auth-form-field";
import { AUTH_STATS } from "@/components/auth/auth-constants";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

function LoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [email, setEmail] = useState(searchParams.get("email") ?? "");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
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

		const user = data?.user as { role?: string; emailVerified?: boolean } | undefined;
		if (user?.emailVerified === false) {
			setError("Your email is not verified yet. Check your inbox for the verification link or resend it below.");
			setIsLoading(false);
			return;
		}

		const userRole = user?.role;
		if (userRole) {
			router.push(`/${userRole}`);
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
		setError("");

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
			<AuthCard
				icon={<BloodDropIcon className="h-5 w-5 text-white" />}
				title="Welcome back"
				description="Sign in to access your dashboard"
			>
				{error && (
					<div className="mb-6 rounded-2xl border border-brand/20 bg-brand-light p-4 text-sm text-brand">
						{error}
					</div>
				)}
				{success && (
					<div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-700">
						{success}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					<AuthFormField
						label="Email Address"
						icon="mail"
						type="email"
						value={email}
						onChange={setEmail}
						placeholder="example@biomatch.org"
						required
					/>
					<AuthFormField
						label="Password"
						icon="lock"
						type="password"
						value={password}
						onChange={setPassword}
						placeholder="••••••••"
						required
					/>

					<div className="flex items-center justify-between">
						<span />
						<Link
							href="/auth/forgot-password"
							className="text-xs text-brand hover:text-brand-hover transition-colors"
						>
							Forgot password?
						</Link>
					</div>

					<Button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-2xl py-6 text-sm font-medium"
					>
						{isLoading ? "Authenticating..." : "Sign in"}
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
				</form>

				<div className="mt-8 border-t border-border pt-6 text-center">
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							href="/auth/signup"
							className="font-medium text-brand hover:text-brand-hover transition-colors"
						>
							Register here
						</Link>
					</p>
				</div>
			</AuthCard>
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
